"use client"

import { useState, useEffect } from "react"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { ScrollArea } from "@/components/ui/scroll-area"
import { 
  MessageSquare, 
  User, 
  Clock, 
  Star,
  X,
  Calendar,
  Building
} from "lucide-react"
import { apiClient, type Concern, type ChatMessage } from "@/lib/api-client"

interface ChatHistoryModalProps {
  concern: Concern | null
  isOpen: boolean
  onClose: () => void
}

interface ChatRoom {
  id: number
  concern_id: number
  status: string
  last_activity_at: string
  concern: {
    id: number
    subject: string
    status: string
    student_id: number
    department_id: number
    assigned_to: number
    archived_at: string | null
    student: {
      id: number
      name: string
    }
  }
}

export function ChatHistoryModal({ concern, isOpen, onClose }: ChatHistoryModalProps) {
  const [messages, setMessages] = useState<ChatMessage[]>([])
  const [loading, setLoading] = useState(false)
  const [chatRoom, setChatRoom] = useState<ChatRoom | null>(null)

  useEffect(() => {
    if (isOpen && concern) {
      fetchChatHistory()
    }
  }, [isOpen, concern])

  const fetchChatHistory = async () => {
    if (!concern) return

    try {
      setLoading(true)
      
      // Get the chat room for this concern
      const chatRooms = await apiClient.getActiveChatRooms()
      const room = chatRooms.find(r => r.concern_id === concern.id)
      
      if (room) {
        setChatRoom(room)
        // Get messages for this chat room
        const messagesData = await apiClient.getChatMessages(room.id)
        setMessages(messagesData.data || [])
      }
    } catch (error) {
      console.error('Failed to fetch chat history:', error)
    } finally {
      setLoading(false)
    }
  }

  const formatTimestamp = (timestamp: string) => {
    const date = new Date(timestamp)
    return date.toLocaleString('en-US', {
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
      hour12: true
    })
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'pending': return 'bg-yellow-100 text-yellow-800'
      case 'in_progress': return 'bg-blue-100 text-blue-800'
      case 'resolved': return 'bg-green-100 text-green-800'
      case 'closed': return 'bg-gray-100 text-gray-800'
      default: return 'bg-gray-100 text-gray-800'
    }
  }

  if (!concern) return null

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl max-h-[80vh] flex flex-col">
        <DialogHeader className="flex-shrink-0">
          <div className="flex items-center justify-between">
            <div className="flex-1">
              <DialogTitle className="text-xl font-bold text-gray-900 mb-2">
                Chat History
              </DialogTitle>
              <div className="flex items-center space-x-2 mb-2">
                <Badge variant="outline" className="text-blue-600 border-blue-600">
                  {concern.reference_number}
                </Badge>
                <Badge className={getStatusColor(concern.status)}>
                  {concern.status}
                </Badge>
                {concern.rating && (
                  <div className="flex items-center space-x-1">
                    <Star className="h-4 w-4 text-yellow-500 fill-current" />
                    <span className="text-sm font-medium">{concern.rating}/5</span>
                  </div>
                )}
              </div>
              <p className="text-sm text-gray-600">{concern.subject}</p>
            </div>
            <Button
              variant="ghost"
              size="sm"
              onClick={onClose}
              className="flex-shrink-0"
            >
              <X className="h-4 w-4" />
            </Button>
          </div>
        </DialogHeader>

        <div className="flex-1 flex flex-col min-h-0">
          {loading ? (
            <div className="flex-1 flex items-center justify-center">
              <div className="text-center">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-4"></div>
                <p className="text-gray-600">Loading chat history...</p>
              </div>
            </div>
          ) : messages.length === 0 ? (
            <div className="flex-1 flex items-center justify-center">
              <div className="text-center text-gray-500">
                <MessageSquare className="h-12 w-12 mx-auto text-gray-300 mb-4" />
                <p className="text-lg font-medium">No messages found</p>
                <p className="text-sm">This concern has no chat history.</p>
              </div>
            </div>
          ) : (
            <ScrollArea className="flex-1 p-4">
              <div className="space-y-4">
                {messages.map((message) => (
                  <div
                    key={message.id}
                    className={`flex ${message.author.role === 'student' ? 'justify-start' : 'justify-end'}`}
                  >
                    <div
                      className={`max-w-[70%] rounded-lg p-3 ${
                        message.author.role === 'student'
                          ? 'bg-gray-100 text-gray-900'
                          : 'bg-blue-500 text-white'
                      }`}
                    >
                      <div className="flex items-center space-x-2 mb-1">
                        <User className="h-4 w-4" />
                        <span className="text-sm font-medium">
                          {message.author.name}
                        </span>
                        <span className="text-xs opacity-75">
                          ({message.author.role})
                        </span>
                      </div>
                      <p className="text-sm mb-2">{message.message}</p>
                      <div className="flex items-center space-x-1 text-xs opacity-75">
                        <Clock className="h-3 w-3" />
                        <span>{formatTimestamp(message.created_at)}</span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </ScrollArea>
          )}
        </div>

        <div className="flex-shrink-0 p-4 bg-gray-50 rounded-lg border-t">
          <div className="flex items-center justify-between text-sm text-gray-600">
            <div className="flex items-center space-x-4">
              <div className="flex items-center space-x-1">
                <Building className="h-4 w-4" />
                <span>{concern.department.name}</span>
              </div>
              <div className="flex items-center space-x-1">
                <Calendar className="h-4 w-4" />
                <span>Archived: {concern.archived_at ? formatTimestamp(concern.archived_at) : 'N/A'}</span>
              </div>
            </div>
            <div className="text-xs">
              {messages.length} message{messages.length !== 1 ? 's' : ''}
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}
