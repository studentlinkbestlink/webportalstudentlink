"use client"

import { useState, useEffect, useRef } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Badge } from "@/components/ui/badge"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { 
  Send, 
  MoreVertical, 
  Phone, 
  Video, 
  Paperclip,
  Smile,
  Check,
  CheckCheck,
  Plus,
  CheckCircle,
  AlertCircle,
  Lock,
  LockOpen,
  Info,
  MessageSquare
} from "lucide-react"
import { apiClient, type ChatRoom, type ChatMessage } from "@/lib/api-client"
import { pusherService } from "@/lib/services/pusher-service"
import { formatDistanceToNow } from "date-fns"

interface ChatInterfaceProps {
  chatRoom: ChatRoom
  currentUserId: number
  onClose?: () => void
}

export function ChatInterface({ chatRoom, currentUserId, onClose }: ChatInterfaceProps) {
  const [messages, setMessages] = useState<ChatMessage[]>([])
  const [newMessage, setNewMessage] = useState("")
  const [loading, setLoading] = useState(true)
  const [sending, setSending] = useState(false)
  const [typingUsers, setTypingUsers] = useState<Set<string>>(new Set())
  const messagesEndRef = useRef<HTMLDivElement>(null)
  const typingTimeoutRef = useRef<NodeJS.Timeout>()

  useEffect(() => {
    loadMessages()
    setupWebSocket()
    
    return () => {
      // Cleanup WebSocket subscriptions
      if (chatRoom.id) {
        pusherService.unsubscribeFromChannel(`chat.room.${chatRoom.id}`)
      }
    }
  }, [chatRoom.id])

  useEffect(() => {
    scrollToBottom()
  }, [messages])

  const loadMessages = async () => {
    try {
      setLoading(true)
      const chatMessages = await apiClient.getChatMessages(chatRoom.id)
      // Sort messages by creation time to ensure proper order
      const sortedMessages = chatMessages.sort((a, b) => 
        new Date(a.created_at).getTime() - new Date(b.created_at).getTime()
      )
      setMessages(sortedMessages)
      
      // Mark messages as read
      await apiClient.markChatAsRead(chatRoom.id)
    } catch (error) {
      console.error('Failed to load messages:', error)
    } finally {
      setLoading(false)
    }
  }

  const setupWebSocket = () => {
    console.log('Setting up WebSocket for chat room:', chatRoom.id)
    console.log('Pusher connection state:', pusherService.getConnectionState())
    
    // Subscribe to new messages
    const channel = pusherService.subscribeToChatRoom(chatRoom.id, (data: any) => {
      console.log('Received WebSocket data:', data)
      if (data.message) {
        const newMessage = data.message
        console.log('Adding new message from WebSocket:', newMessage)
        setMessages(prev => {
          const updated = [...prev, newMessage]
          // Sort messages by creation time to maintain proper order
          return updated.sort((a, b) => 
            new Date(a.created_at).getTime() - new Date(b.created_at).getTime()
          )
        })
        
        // Mark as read if it's not from current user
        if (newMessage.author_id !== currentUserId) {
          apiClient.markChatAsRead(chatRoom.id)
        }
      }
    })
    
    if (!channel) {
      console.warn('Failed to subscribe to chat room WebSocket channel')
    }

    // Subscribe to typing status
    pusherService.subscribeToTypingStatus(chatRoom.id, (data: any) => {
      console.log('Received typing status:', data)
      if (data.user_id && data.is_typing !== undefined) {
        const userId = data.user_id
        const isTyping = data.is_typing
        
        setTypingUsers(prev => {
          const newSet = new Set(prev)
          if (isTyping) {
            newSet.add(userId.toString())
          } else {
            newSet.delete(userId.toString())
          }
          return newSet
        })
      }
    })
  }

  const sendMessage = async () => {
    if (!newMessage.trim() || sending) return

    const messageText = newMessage.trim()
    setNewMessage("") // Clear input immediately
    setSending(true)

    try {
      console.log('Sending message:', messageText, 'to chat room:', chatRoom.id)
      const sentMessage = await apiClient.sendChatMessage(chatRoom.id, messageText)
      console.log('Message sent successfully:', sentMessage)
      
      setMessages(prev => {
        const updated = [...prev, sentMessage]
        // Sort messages by creation time to maintain proper order
        return updated.sort((a, b) => 
          new Date(a.created_at).getTime() - new Date(b.created_at).getTime()
        )
      })
    } catch (error: any) {
      console.error('Failed to send message:', error)
      console.error('Error details:', {
        message: error?.message,
        status: error?.status,
        response: error?.response
      })
      // Restore the message text so user can try again
      setNewMessage(messageText)
      alert(`Failed to send message: ${error?.message || 'Unknown error'}`)
    } finally {
      setSending(false)
    }
  }

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      sendMessage()
    }
  }

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }

  const formatTime = (dateString: string) => {
    try {
      return new Date(dateString).toLocaleTimeString([], { 
        hour: '2-digit', 
        minute: '2-digit' 
      })
    } catch {
      return ''
    }
  }

  const getMessageStatus = (message: ChatMessage) => {
    if (message.author_id !== currentUserId) return null
    
    if (message.read_at) {
      return <CheckCheck className="h-3 w-3 text-blue-500" />
    } else if (message.delivered_at) {
      return <CheckCheck className="h-3 w-3 text-gray-400" />
    } else {
      return <Check className="h-3 w-3 text-gray-400" />
    }
  }

  const shouldShowAvatar = (message: ChatMessage, index: number) => {
    if (index === 0) return true
    
    const previousMessage = messages[index - 1]
    if (!previousMessage) return true
    
    const timeDiff = new Date(message.created_at).getTime() - new Date(previousMessage.created_at).getTime()
    const fiveMinutes = 5 * 60 * 1000
    
    return previousMessage.author_id !== message.author_id || timeDiff > fiveMinutes
  }

  const shouldShowTimestamp = (message: ChatMessage, index: number) => {
    if (index === messages.length - 1) return true
    
    const nextMessage = messages[index + 1]
    if (!nextMessage) return true
    
    const timeDiff = new Date(nextMessage.created_at).getTime() - new Date(message.created_at).getTime()
    const fiveMinutes = 5 * 60 * 1000
    
    return nextMessage.author_id !== message.author_id || timeDiff > fiveMinutes
  }

  const renderSystemMessage = (message: ChatMessage) => {
    let icon, bgColor, borderColor, textColor
    
    switch (message.message_type) {
      case 'status_change':
        icon = <CheckCircle className="h-4 w-4" />
        bgColor = 'bg-green-50'
        borderColor = 'border-green-200'
        textColor = 'text-green-800'
        break
      case 'system':
        icon = <Info className="h-4 w-4" />
        bgColor = 'bg-blue-50'
        borderColor = 'border-blue-200'
        textColor = 'text-blue-800'
        break
      default:
        icon = <Info className="h-4 w-4" />
        bgColor = 'bg-blue-50'
        borderColor = 'border-blue-200'
        textColor = 'text-blue-800'
    }
    
    return (
      <div className={`px-4 py-3 rounded-2xl border ${bgColor} ${borderColor} ${textColor} shadow-sm max-w-md`}>
        <div className="flex items-center gap-3">
          {icon}
          <p className="text-sm font-medium leading-relaxed">{message.message}</p>
        </div>
      </div>
    )
  }

  const concern = chatRoom.concern
  if (!concern) return null

  return (
    <div className="h-full flex flex-col">
      {/* Chat Header */}
      <div className="border-b border-gray-200/60 bg-gradient-to-r from-white via-gray-50/50 to-white p-6">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-[#2480EA] to-[#1E2A78] flex items-center justify-center shadow-lg shadow-[#2480EA]/25">
              <span className="text-white font-bold text-lg">
                {concern.student.name.charAt(0).toUpperCase()}
              </span>
            </div>
            <div>
              <h2 className="text-2xl font-bold text-[#1E2A78] tracking-tight">{concern.subject}</h2>
              <div className="flex items-center gap-3 mt-2">
                <span className="text-gray-600 font-medium">{concern.student.name}</span>
                <Badge 
                  className={`text-xs font-semibold px-3 py-1 rounded-xl shadow-sm ${
                    concern.status === 'resolved' ? 'bg-gradient-to-r from-green-100 to-green-200 text-green-800 border border-green-300/50' :
                    concern.status === 'in_progress' ? 'bg-gradient-to-r from-blue-100 to-blue-200 text-blue-800 border border-blue-300/50' :
                    concern.status === 'approved' ? 'bg-gradient-to-r from-green-100 to-green-200 text-green-800 border border-green-300/50' :
                    concern.status === 'rejected' ? 'bg-gradient-to-r from-red-100 to-red-200 text-red-800 border border-red-300/50' :
                    concern.status === 'closed' ? 'bg-gradient-to-r from-gray-100 to-gray-200 text-gray-800 border border-gray-300/50' :
                    'bg-gradient-to-r from-yellow-100 to-yellow-200 text-yellow-800 border border-yellow-300/50'
                  }`}
                >
                  {concern.status.replace('_', ' ').toUpperCase()}
                </Badge>
              </div>
            </div>
          </div>
          
          <div className="flex items-center gap-2">
            <Button variant="ghost" size="sm" className="h-10 w-10 rounded-xl hover:bg-gray-100">
              <Phone className="h-4 w-4" />
            </Button>
            <Button variant="ghost" size="sm" className="h-10 w-10 rounded-xl hover:bg-gray-100">
              <Video className="h-4 w-4" />
            </Button>
            <Button variant="ghost" size="sm" className="h-10 w-10 rounded-xl hover:bg-gray-100">
              <MoreVertical className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </div>

      {/* Status Banner */}
      {concern.status === 'resolved' && (
        <div className="bg-blue-50 border-b border-blue-200 px-4 py-3">
          <div className="flex items-center gap-2">
            <CheckCircle className="h-4 w-4 text-blue-600" />
            <span className="text-sm font-medium text-blue-800">
              Staff has marked this concern as resolved. Please confirm if your issue has been addressed.
            </span>
          </div>
        </div>
      )}

      {/* Resolution Confirmation Widget */}
      {concern.status === 'resolved' && (
        <div className="bg-white border-b border-gray-200 p-4">
          <div className="bg-blue-50 border border-blue-200 rounded-xl p-4">
            <div className="flex items-start gap-3">
              <CheckCircle className="h-5 w-5 text-blue-600 mt-0.5 flex-shrink-0" />
              <div className="flex-1">
                <h3 className="font-semibold text-blue-900 mb-2">Resolution Confirmation</h3>
                <p className="text-sm text-blue-800 mb-4">
                  Staff has marked this concern as resolved. Please confirm if your issue has been addressed.
                </p>
                <div className="flex gap-2">
                  <Button 
                    size="sm" 
                    className="bg-green-600 hover:bg-green-700 text-white"
                    onClick={() => {
                      // Handle confirm resolution
                      console.log('Confirm resolution')
                    }}
                  >
                    <CheckCircle className="h-4 w-4 mr-1" />
                    Confirm Resolved
                  </Button>
                  <Button 
                    size="sm" 
                    variant="outline"
                    className="border-red-300 text-red-600 hover:bg-red-50"
                    onClick={() => {
                      // Handle dispute resolution
                      console.log('Dispute resolution')
                    }}
                  >
                    <AlertCircle className="h-4 w-4 mr-1" />
                    Dispute
                  </Button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Messages Area */}
      <div className="flex-1 p-0 overflow-hidden">
        <ScrollArea className="h-full modern-scrollbar">
          <div className="p-6 space-y-4">
            {loading ? (
              <div className="flex items-center justify-center h-32">
                <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-blue-600"></div>
              </div>
            ) : messages.length === 0 ? (
              <div className="text-center py-12">
                <div className="w-16 h-16 mx-auto mb-4 rounded-2xl bg-gradient-to-br from-gray-100 to-gray-200 flex items-center justify-center">
                  <Send className="h-8 w-8 text-gray-400" />
                </div>
                <p className="text-gray-500 font-medium text-lg">No messages yet</p>
                <p className="text-sm text-gray-400 mt-2">Start the conversation</p>
              </div>
            ) : (
              messages.map((message, index) => {
                const isMe = message.author_id === currentUserId
                const author = message.author
                const showAvatar = shouldShowAvatar(message, index)
                const showTimestamp = shouldShowTimestamp(message, index)

                // Handle system messages
                if (message.message_type === 'system' || message.message_type === 'status_change') {
                  return (
                    <div key={message.id} className="flex justify-center">
                      {renderSystemMessage(message)}
                    </div>
                  )
                }

                return (
                  <div
                    key={message.id}
                    className={`flex ${isMe ? 'justify-end' : 'justify-start'} mb-1`}
                  >
                    <div className={`flex gap-2 max-w-[75%] ${isMe ? 'flex-row-reverse' : 'flex-row'}`}>
                      {!isMe && showAvatar && (
                        <Avatar className="h-8 w-8 flex-shrink-0">
                          <AvatarFallback className="text-xs bg-blue-100 text-blue-600">
                            {author?.name?.charAt(0).toUpperCase() || '?'}
                          </AvatarFallback>
                        </Avatar>
                      )}
                      
                      {isMe && showAvatar && (
                        <Avatar className="h-8 w-8 flex-shrink-0">
                          <AvatarFallback className="text-xs bg-blue-600 text-white">
                            {author?.name?.charAt(0).toUpperCase() || 'U'}
                          </AvatarFallback>
                        </Avatar>
                      )}
                      
                      <div className={`flex flex-col ${isMe ? 'items-end' : 'items-start'}`}>
                        <div
                          className={`px-5 py-4 rounded-2xl shadow-lg max-w-full ${
                            isMe
                              ? 'bg-gradient-to-r from-[#1E2A78] to-[#2480EA] text-white rounded-br-md'
                              : 'bg-white text-gray-900 rounded-bl-md border border-gray-200/60'
                          }`}
                          style={{
                            boxShadow: isMe 
                              ? '0 4px 12px rgba(30, 42, 120, 0.3)' 
                              : '0 4px 12px rgba(0, 0, 0, 0.1)'
                          }}
                        >
                          <p className="text-sm leading-relaxed break-words">{message.message}</p>
                        </div>
                        
                        {showTimestamp && (
                          <div className={`flex items-center gap-1 mt-1 text-xs text-gray-500 ${isMe ? 'flex-row-reverse' : 'flex-row'}`}>
                            <span>{formatTime(message.created_at)}</span>
                            {isMe && getMessageStatus(message)}
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                )
              })
            )}
            
            {/* Typing Indicator */}
            {typingUsers.size > 0 && (
              <div className="flex justify-start">
                <div className="flex gap-2">
                  <Avatar className="h-6 w-6">
                    <AvatarFallback className="text-xs">?</AvatarFallback>
                  </Avatar>
                  <div className="bg-gray-100 px-3 py-2 rounded-lg">
                    <div className="flex gap-1">
                      <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce"></div>
                      <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0.1s' }}></div>
                      <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
                    </div>
                  </div>
                </div>
              </div>
            )}
            
            <div ref={messagesEndRef} />
          </div>
        </ScrollArea>
      </div>

      {/* Message Input */}
      <div className="border-t border-gray-200/60 bg-gradient-to-r from-white via-gray-50/50 to-white p-6 shadow-lg shadow-gray-900/5">
        <div className="flex items-end gap-4">
          {/* Add Button */}
          <Button 
            variant="ghost" 
            size="sm"
            className="h-12 w-12 rounded-2xl bg-gradient-to-r from-gray-100 to-gray-200 hover:from-gray-200 hover:to-gray-300 flex-shrink-0 shadow-sm"
          >
            <Plus className="h-5 w-5 text-gray-600" />
          </Button>
          
          {/* Message Input */}
          <div className="flex-1 relative">
            <div className="bg-white/80 backdrop-blur-sm rounded-2xl border-2 border-gray-200 focus-within:border-[#1E2A78] focus-within:ring-2 focus-within:ring-[#1E2A78]/20 transition-all shadow-sm">
              <textarea
                value={newMessage}
                onChange={(e) => setNewMessage(e.target.value)}
                onKeyDown={handleKeyPress}
                placeholder="Type your message..."
                className="w-full px-5 py-4 bg-transparent border-0 rounded-2xl resize-none focus:outline-none text-sm leading-relaxed"
                rows={1}
                style={{
                  minHeight: '48px',
                  maxHeight: '120px',
                  height: 'auto'
                }}
                disabled={sending}
                onInput={(e) => {
                  const target = e.target as HTMLTextAreaElement
                  target.style.height = 'auto'
                  target.style.height = Math.min(target.scrollHeight, 120) + 'px'
                }}
              />
            </div>
          </div>
          
          {/* Send Button */}
          <Button 
            onClick={sendMessage} 
            disabled={!newMessage.trim() || sending}
            size="sm"
            className={`h-12 w-12 rounded-2xl flex-shrink-0 transition-all ${
              newMessage.trim() && !sending
                ? 'bg-gradient-to-r from-[#1E2A78] to-[#2480EA] hover:from-[#1A2568] hover:to-[#1E6FD8] shadow-lg shadow-[#1E2A78]/30'
                : 'bg-gray-300 cursor-not-allowed'
            }`}
          >
            {sending ? (
              <div className="animate-spin rounded-full h-5 w-5 border-2 border-white border-t-transparent" />
            ) : (
              <Send className="h-5 w-5 text-white" />
            )}
          </Button>
        </div>
      </div>
    </div>
  )
}