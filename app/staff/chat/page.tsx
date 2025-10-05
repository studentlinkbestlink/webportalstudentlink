"use client"

import { useState, useEffect, useRef } from "react"
import { useSearchParams } from "next/navigation"
import { useAuth } from "@/components/auth-provider"
import { ProtectedRoute } from "@/components/protected-route"
import { RoleBasedNav } from "@/components/navigation/role-based-nav"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { ScrollArea } from "@/components/ui/scroll-area"
import { 
  MessageSquare, 
  Send, 
  Phone, 
  Video, 
  MoreVertical,
  User,
  Clock,
  CheckCircle,
  CheckCircle2
} from "lucide-react"
import { apiClient, type ChatMessage, type ChatRoom } from "@/lib/api-client"
import { websocketService } from "@/lib/websocket-service"

interface ChatConversation {
  id: number
  concern_id: number
  student: {
    id: number
    name: string
    display_id: string
  }
  concern: {
    id: number
    subject: string
    status: string
    priority: string
  }
  last_message?: {
    message: string
    created_at: string
    is_staff: boolean
  }
  unread_count: number
  is_online: boolean
}

export default function StaffChat() {
  const { user } = useAuth()
  const searchParams = useSearchParams()
  const [conversations, setConversations] = useState<ChatConversation[]>([])
  const [selectedConversation, setSelectedConversation] = useState<ChatConversation | null>(null)
  const [messages, setMessages] = useState<ChatMessage[]>([])
  const [newMessage, setNewMessage] = useState("")
  const [loading, setLoading] = useState(true)
  const [sending, setSending] = useState(false)
  const messagesEndRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const fetchConversations = async () => {
      if (!user) return

      try {
        setLoading(true)
        
        // Fetch chat rooms for this staff member
        const chatRooms = await apiClient.getActiveChatRooms()
        
        // Transform to conversation format
        const staffConversations: ChatConversation[] = chatRooms
          .filter(room => {
            const assignedTo = room.concern?.assigned_to;
            return typeof assignedTo === 'number' ? assignedTo === user.id : assignedTo?.id === user.id;
          })
          .map(room => ({
            id: room.id,
            concern_id: room.concern_id,
            student: {
              id: room.concern?.student.id || 0,
              name: room.concern?.student.name || 'Unknown',
              display_id: room.concern?.student.display_id || 'N/A'
            },
            concern: {
              id: room.concern?.id || 0,
              subject: room.concern?.subject || 'No Subject',
              status: room.concern?.status || 'pending',
              priority: room.concern?.priority || 'medium'
            },
            last_message: room.latest_message ? {
              message: room.latest_message.message,
              created_at: room.latest_message.created_at,
              is_staff: room.latest_message.author?.role !== 'student'
            } : undefined,
            unread_count: room.unread_count || 0,
            is_online: false // This would come from real-time status
          }))
        
        setConversations(staffConversations)
        
        // Auto-select conversation based on URL parameter or first available
        const concernId = searchParams.get('concern')
        if (concernId) {
          const targetConversation = staffConversations.find(conv => conv.concern_id === parseInt(concernId))
          if (targetConversation) {
            setSelectedConversation(targetConversation)
          }
        } else if (staffConversations.length > 0 && !selectedConversation) {
          setSelectedConversation(staffConversations[0])
        }
      } catch (error) {
        console.error('Failed to fetch conversations:', error)
      } finally {
        setLoading(false)
      }
    }

    fetchConversations()

    // Set up WebSocket listeners
    const handleChatMessage = (message: any) => {
      if (message.room_id === selectedConversation?.id) {
        setMessages(prev => [...prev, message])
      }
      
      // Update conversation list with new message
      setConversations(prev => prev.map(conv => 
        conv.id === message.room_id 
          ? { 
              ...conv, 
              last_message: {
                message: message.message,
                created_at: message.created_at,
                is_staff: message.author?.role !== 'student'
              },
              unread_count: message.author?.role === 'student' ? conv.unread_count + 1 : conv.unread_count
            }
          : conv
      ))
    }

    const handleUserOnline = (data: any) => {
      setConversations(prev => prev.map(conv => 
        conv.student.id === data.user_id 
          ? { ...conv, is_online: true }
          : conv
      ))
    }

    const handleUserOffline = (data: any) => {
      setConversations(prev => prev.map(conv => 
        conv.student.id === data.user_id 
          ? { ...conv, is_online: false }
          : conv
      ))
    }

    const handleConcernAssigned = (data: any) => {
      if (data.assigned_to === user?.id) {
        // Refresh conversations to include new assignment
        fetchConversations()
      }
    }

    // Register WebSocket listeners
    websocketService.on('chat_message', handleChatMessage)
    websocketService.on('user_online', handleUserOnline)
    websocketService.on('user_offline', handleUserOffline)
    websocketService.on('concern_assigned', handleConcernAssigned)

    // Set user online status
    websocketService.setOnlineStatus(true)

    // Cleanup
    return () => {
      websocketService.off('chat_message', handleChatMessage)
      websocketService.off('user_online', handleUserOnline)
      websocketService.off('user_offline', handleUserOffline)
      websocketService.off('concern_assigned', handleConcernAssigned)
      websocketService.setOnlineStatus(false)
    }
  }, [user, selectedConversation, searchParams])

  useEffect(() => {
    const fetchMessages = async () => {
      if (!selectedConversation) return

      try {
        const chatMessages = await apiClient.getChatMessages(selectedConversation.id)
        setMessages(chatMessages.data)
        
        // Mark messages as read
        await apiClient.markChatAsRead(selectedConversation.id)
        
        // Update unread count
        setConversations(prev => prev.map(conv => 
          conv.id === selectedConversation.id 
            ? { ...conv, unread_count: 0 }
            : conv
        ))
      } catch (error) {
        console.error('Failed to fetch messages:', error)
      }
    }

    fetchMessages()
  }, [selectedConversation])

  useEffect(() => {
    scrollToBottom()
  }, [messages])

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" })
  }

  const handleSendMessage = async () => {
    if (!newMessage.trim() || !selectedConversation || sending) return

    const messageText = newMessage.trim()
    setNewMessage("") // Clear input immediately for better UX
    
    try {
      setSending(true)
      
      // Send via WebSocket for real-time delivery
      websocketService.sendChatMessage(selectedConversation.id, messageText)
      
      // Also send via API for persistence
      const message = await apiClient.sendChatMessage(selectedConversation.id, messageText)
      setMessages(prev => [...prev, message])
      
      // Update last message in conversations
      setConversations(prev => prev.map(conv => 
        conv.id === selectedConversation.id 
          ? { 
              ...conv, 
              last_message: {
                message: message.message,
                created_at: message.created_at,
                is_staff: true
              }
            }
          : conv
      ))
    } catch (error) {
      console.error('Failed to send message:', error)
      // Restore the message if sending failed
      setNewMessage(messageText)
      alert('Failed to send message. Please try again.')
    } finally {
      setSending(false)
    }
  }

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      handleSendMessage()
    }
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'pending': return 'bg-yellow-100 text-yellow-800'
      case 'in_progress': return 'bg-blue-100 text-blue-800'
      case 'resolved': return 'bg-green-100 text-green-800'
      default: return 'bg-gray-100 text-gray-800'
    }
  }

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'urgent': return 'bg-red-100 text-red-800'
      case 'high': return 'bg-orange-100 text-orange-800'
      case 'medium': return 'bg-yellow-100 text-yellow-800'
      case 'low': return 'bg-green-100 text-green-800'
      default: return 'bg-gray-100 text-gray-800'
    }
  }

  if (!user || user.role !== 'staff') {
    return (
      <ProtectedRoute allowedRoles={['staff']}>
        <div>Access denied</div>
      </ProtectedRoute>
    )
  }

  return (
    <ProtectedRoute allowedRoles={['staff']}>
      <div className="flex h-screen bg-gray-50">
        <RoleBasedNav />
        
        <div className="flex-1 flex flex-col overflow-hidden">
          {/* Header */}
          <header className="bg-white border-b border-gray-200 px-6 py-4">
            <div className="flex items-center justify-between">
              <div>
                <h1 className="text-2xl font-bold text-gray-900">Real-time Chat</h1>
                <p className="text-gray-600">Chat with students about their concerns</p>
              </div>
              <div className="flex items-center space-x-4">
                <Badge variant="outline" className="text-blue-600 border-blue-600">
                  {user.department}
                </Badge>
                <Badge variant="secondary">
                  Staff Member
                </Badge>
              </div>
            </div>
          </header>

          {/* Main Chat Interface */}
          <div className="flex-1 flex overflow-hidden">
            {/* Conversations Sidebar */}
            <div className="w-80 bg-white border-r border-gray-200 flex flex-col">
              <div className="p-4 border-b border-gray-200">
                <h2 className="font-semibold text-gray-900">Active Conversations</h2>
                <p className="text-sm text-gray-600">{conversations.length} conversations</p>
              </div>
              
              <ScrollArea className="flex-1">
                {loading ? (
                  <div className="flex items-center justify-center p-8">
                    <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-blue-600"></div>
                  </div>
                ) : conversations.length === 0 ? (
                  <div className="p-4 text-center text-gray-500">
                    <MessageSquare className="h-8 w-8 mx-auto text-gray-300 mb-2" />
                    <p className="text-sm font-medium">No active conversations</p>
                    <p className="text-xs">Students will appear here when they start chatting</p>
                  </div>
                ) : (
                  <div className="space-y-1 p-2">
                    {conversations.map((conversation) => (
                      <div
                        key={conversation.id}
                        onClick={() => setSelectedConversation(conversation)}
                        className={`p-3 rounded-lg cursor-pointer transition-colors ${
                          selectedConversation?.id === conversation.id
                            ? 'bg-blue-50 border border-blue-200'
                            : 'hover:bg-gray-50'
                        }`}
                      >
                        <div className="flex items-start justify-between">
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center space-x-2">
                              <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center">
                                <span className="text-blue-600 font-semibold text-sm">
                                  {conversation.student.name.charAt(0).toUpperCase()}
                                </span>
                              </div>
                              <div className="flex-1 min-w-0">
                                <p className="font-medium text-gray-900 truncate">
                                  {conversation.student.name}
                                </p>
                                <p className="text-xs text-gray-500">
                                  {conversation.student.display_id}
                                </p>
                              </div>
                            </div>
                            
                            <div className="mt-2">
                              <p className="text-sm text-gray-600 truncate">
                                {conversation.concern.subject}
                              </p>
                              <div className="flex items-center space-x-2 mt-1">
                                <Badge className={getStatusColor(conversation.concern.status)}>
                                  {conversation.concern.status}
                                </Badge>
                                <Badge className={getPriorityColor(conversation.concern.priority)}>
                                  {conversation.concern.priority}
                                </Badge>
                              </div>
                            </div>
                            
                            {conversation.last_message && (
                              <p className="text-xs text-gray-500 mt-1 truncate">
                                {conversation.last_message.is_staff ? 'You: ' : ''}
                                {conversation.last_message.message}
                              </p>
                            )}
                          </div>
                          
                          <div className="flex flex-col items-end space-y-1">
                            {conversation.unread_count > 0 && (
                              <Badge variant="destructive" className="text-xs">
                                {conversation.unread_count}
                              </Badge>
                            )}
                            <div className="flex items-center space-x-1">
                              <div className={`w-2 h-2 rounded-full ${
                                conversation.is_online ? 'bg-green-500' : 'bg-gray-300'
                              }`} />
                              <span className="text-xs text-gray-500">
                                {conversation.is_online ? 'Online' : 'Offline'}
                              </span>
                            </div>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </ScrollArea>
            </div>

            {/* Chat Area */}
            <div className="flex-1 flex flex-col">
              {selectedConversation ? (
                <>
                  {/* Chat Header */}
                  <div className="bg-white border-b border-gray-200 p-4">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-3">
                        <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center">
                          <span className="text-blue-600 font-semibold">
                            {selectedConversation.student.name.charAt(0).toUpperCase()}
                          </span>
                        </div>
                        <div>
                          <h3 className="font-semibold text-gray-900">
                            {selectedConversation.student.name}
                          </h3>
                          <p className="text-sm text-gray-600">
                            {selectedConversation.student.display_id}
                          </p>
                        </div>
                      </div>
                      
                      <div className="flex items-center space-x-2">
                        <Button variant="outline" size="sm">
                          <Phone className="h-4 w-4" />
                        </Button>
                        <Button variant="outline" size="sm">
                          <Video className="h-4 w-4" />
                        </Button>
                        <Button variant="outline" size="sm">
                          <MoreVertical className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                  </div>

                  {/* Messages */}
                  <ScrollArea className="flex-1 p-4">
                    <div className="space-y-4">
                      {messages.map((message) => (
                        <div
                          key={message.id}
                          className={`flex ${message.author?.role !== 'student' ? 'justify-end' : 'justify-start'}`}
                        >
                          <div
                            className={`max-w-xs lg:max-w-md px-4 py-2 rounded-lg ${
                              message.author?.role !== 'student'
                                ? 'bg-blue-600 text-white'
                                : 'bg-gray-200 text-gray-900'
                            }`}
                          >
                            <p className="text-sm">{message.message}</p>
                            <div className={`flex items-center space-x-1 mt-1 ${
                              message.author?.role !== 'student' ? 'text-blue-100' : 'text-gray-500'
                            }`}>
                              <Clock className="h-3 w-3" />
                              <span className="text-xs">
                                {new Date(message.created_at).toLocaleTimeString()}
                              </span>
                              {message.author?.role !== 'student' && (
                                <CheckCircle2 className="h-3 w-3" />
                              )}
                            </div>
                          </div>
                        </div>
                      ))}
                      <div ref={messagesEndRef} />
                    </div>
                  </ScrollArea>

                  {/* Message Input */}
                  <div className="bg-white border-t border-gray-200 p-4">
                    <div className="flex items-center space-x-2">
                      <Input
                        value={newMessage}
                        onChange={(e) => setNewMessage(e.target.value)}
                        onKeyPress={handleKeyPress}
                        placeholder="Type your message..."
                        className="flex-1"
                        disabled={sending}
                      />
                      <Button 
                        onClick={handleSendMessage}
                        disabled={!newMessage.trim() || sending}
                        size="sm"
                      >
                        <Send className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                </>
              ) : (
                <div className="flex-1 flex items-center justify-center text-gray-500">
                  <div className="text-center">
                    <MessageSquare className="h-12 w-12 mx-auto text-gray-300 mb-3" />
                    <p className="text-base font-medium">Welcome to Real-time Chat</p>
                    <p className="text-sm">Select a conversation from the sidebar to start chatting with students</p>
                    {conversations.length === 0 && (
                      <div className="mt-4 p-3 bg-blue-50 rounded-lg border border-blue-200">
                        <p className="text-xs text-blue-700">
                          💡 <strong>Tip:</strong> Students will appear here once they submit concerns and get assigned to you.
                        </p>
                      </div>
                    )}
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </ProtectedRoute>
  )
}
