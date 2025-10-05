"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { ScrollArea } from "@/components/ui/scroll-area"
import { 
  MessageSquare, 
  Search, 
  Clock, 
  CheckCircle, 
  AlertCircle,
  User,
  MoreVertical
} from "lucide-react"
import { apiClient, type ChatRoom } from "@/lib/api-client"
import { useWebSocket } from "@/lib/hooks/use-websocket"
import { useAuth } from "@/components/auth-provider"
import { formatDistanceToNow } from "date-fns"

interface ChatRoomListProps {
  onSelectChatRoom: (chatRoom: ChatRoom) => void
  selectedChatRoomId?: number
}

export function ChatRoomList({ onSelectChatRoom, selectedChatRoomId }: ChatRoomListProps) {
  const { user } = useAuth()
  const [chatRooms, setChatRooms] = useState<ChatRoom[]>([])
  const [loading, setLoading] = useState(true)
  const [searchQuery, setSearchQuery] = useState("")

  useEffect(() => {
    loadChatRooms()
  }, [])

  // Handle WebSocket events
  const handleChatRoomCreated = (data: any) => {
    console.log('Received chat room created event:', data)
    if (data.event_type === 'chat_room_created' && data.chat_room) {
      setChatRooms(prev => {
        // Check if chat room already exists
        const exists = prev.some(room => room.id === data.chat_room.id)
        if (!exists) {
          return [data.chat_room, ...prev]
        }
        return prev
      })
    }
  }

  useWebSocket({
    onChatRoomCreated: handleChatRoomCreated,
    departmentId: user?.department_id,
    autoConnect: true
  })

  const loadChatRooms = async () => {
    try {
      setLoading(true)
      const rooms = await apiClient.getActiveChatRooms()
      setChatRooms(rooms)
    } catch (error) {
      console.error('Failed to load chat rooms:', error)
    } finally {
      setLoading(false)
    }
  }

  const filteredChatRooms = chatRooms.filter(room => {
    if (!searchQuery) return true
    
    const concern = room.concern
    if (!concern) return false
    
    return (
      concern.subject.toLowerCase().includes(searchQuery.toLowerCase()) ||
      concern.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
      room.room_name.toLowerCase().includes(searchQuery.toLowerCase())
    )
  })

  const getStatusColor = (status: string) => {
    if (!status) return 'bg-gray-100 text-gray-800'
    
    switch (status.toLowerCase()) {
      case 'pending':
        return 'bg-orange-100 text-orange-800'
      case 'approved':
        return 'bg-green-100 text-green-800'
      case 'in_progress':
        return 'bg-blue-100 text-blue-800'
      case 'resolved':
        return 'bg-green-100 text-green-800'
      case 'closed':
        return 'bg-gray-100 text-gray-800'
      case 'rejected':
        return 'bg-red-100 text-red-800'
      default:
        return 'bg-gray-100 text-gray-800'
    }
  }

  const getStatusIcon = (status: string) => {
    if (!status) return <AlertCircle className="h-3 w-3" />
    
    switch (status.toLowerCase()) {
      case 'pending':
        return <Clock className="h-3 w-3" />
      case 'approved':
        return <CheckCircle className="h-3 w-3" />
      case 'in_progress':
        return <AlertCircle className="h-3 w-3" />
      case 'resolved':
        return <CheckCircle className="h-3 w-3" />
      case 'closed':
        return <CheckCircle className="h-3 w-3" />
      case 'rejected':
        return <AlertCircle className="h-3 w-3" />
      default:
        return <AlertCircle className="h-3 w-3" />
    }
  }

  const formatLastActivity = (lastActivity?: string) => {
    if (!lastActivity) return 'No activity'
    
    try {
      return formatDistanceToNow(new Date(lastActivity), { addSuffix: true })
    } catch {
      return 'Unknown'
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
      </div>
    )
  }

  return (
    <div className="h-full flex flex-col">
      {/* Header */}
      <div className="p-6 border-b border-gray-200 bg-gray-50">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h2 className="text-2xl font-bold text-[#1E2A78] tracking-tight">Active Chats</h2>
            <p className="text-gray-600 font-medium mt-1">Select a conversation to continue</p>
          </div>
          <Button
            variant="outline"
            size="sm"
            onClick={loadChatRooms}
            className="h-10 px-4 rounded-lg"
          >
            <span className="font-semibold">Refresh</span>
          </Button>
        </div>
        
        {/* Search */}
        <div className="relative">
          <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
          <Input
            placeholder="Search chats..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-12 h-12 rounded-lg border border-gray-200 focus:border-[#1E2A78] focus:ring-2 focus:ring-[#1E2A78]/20 bg-white shadow-sm"
          />
        </div>
      </div>

      {/* Chat Rooms List */}
      <ScrollArea className="flex-1 modern-scrollbar">
        <div className="p-4">
          {filteredChatRooms.length === 0 ? (
            <div className="text-center py-12">
              <div className="w-16 h-16 mx-auto mb-4 rounded-2xl bg-gradient-to-br from-gray-100 to-gray-200 flex items-center justify-center">
                <MessageSquare className="h-8 w-8 text-gray-400" />
              </div>
              <p className="text-gray-500 font-medium text-lg">No active chats found</p>
              <p className="text-sm text-gray-400 mt-2">
                {searchQuery ? 'Try adjusting your search' : 'Start a conversation by responding to a concern'}
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6">
              {filteredChatRooms.map((room) => {
              const concern = room.concern
              if (!concern) return null

              const isSelected = selectedChatRoomId === room.id
              const hasUnread = (room.unread_count || 0) > 0

              return (
                <Card
                  key={room.id}
                    className={`group cursor-pointer hover:shadow-md transition-all duration-200 ${
                      isSelected 
                        ? 'ring-2 ring-[#1E2A78] bg-[#1E2A78]/5 border-[#1E2A78]/40' 
                        : 'border-gray-200 hover:border-[#1E2A78]/30'
                  }`}
                  onClick={() => onSelectChatRoom(room)}
                >
                    <CardContent className="p-5">
                      <div className="space-y-4">
                        {/* Header with Title and Unread Badge */}
                        <div className="flex items-start justify-between gap-3">
                          <h3 className="font-bold text-gray-900 text-sm leading-tight truncate flex-1 group-hover:text-[#1E2A78] transition-colors">
                            {concern.subject}
                          </h3>
                          {hasUnread && (
                            <Badge className="bg-gradient-to-r from-[#E22824] to-[#DC2626] text-white text-xs font-bold px-3 py-1.5 rounded-xl shadow-lg shadow-red-500/25 border border-red-400">
                              {room.unread_count}
                            </Badge>
                          )}
                        </div>
                        
                        {/* Status and Priority Badges */}
                        <div className="flex flex-wrap gap-2">
                          <span className={`text-xs font-semibold px-3 py-1.5 rounded-lg text-white flex items-center ${
                            concern.status === 'pending' ? 'bg-orange-500' :
                            concern.status === 'approved' ? 'bg-green-500' :
                            concern.status === 'in_progress' ? 'bg-blue-500' :
                            concern.status === 'resolved' ? 'bg-green-500' :
                            concern.status === 'closed' ? 'bg-gray-500' :
                            concern.status === 'rejected' ? 'bg-red-500' :
                            'bg-gray-500'
                          }`}>
                            {getStatusIcon(concern.status)}
                            <span className="ml-1">{concern.status?.toUpperCase() || 'UNKNOWN'}</span>
                          </span>
                          <span className={`text-xs font-semibold px-3 py-1.5 rounded-lg text-white ${
                            concern.priority === 'urgent' ? 'bg-red-600' :
                            concern.priority === 'high' ? 'bg-red-500' :
                            concern.priority === 'medium' ? 'bg-yellow-500' :
                            concern.priority === 'low' ? 'bg-green-500' :
                            'bg-yellow-500'
                          }`}>
                            {concern.priority?.toUpperCase() || 'MEDIUM'}
                          </span>
                        </div>

                        {/* Latest Message */}
                        <div className="bg-gray-50 rounded-lg p-3 border border-gray-200">
                          <p className="text-xs text-gray-700 line-clamp-2 font-medium leading-relaxed">
                          {room.latest_message?.message || 'No messages yet'}
                        </p>
                        </div>

                        {/* Footer with User and Time */}
                        <div className="flex items-center justify-between text-xs">
                          <div className="flex items-center gap-2">
                            <div className="w-2 h-2 rounded-full bg-[#1E2A78]"></div>
                            <User className="h-3 w-3 text-gray-600" />
                            <span className="font-semibold text-gray-700 truncate">{concern.student.name}</span>
                          </div>
                          <span className="font-medium text-gray-600 text-right bg-gray-100 px-2 py-1 rounded-lg border border-gray-200">
                            {formatLastActivity(room.last_activity_at)}
                          </span>
                        </div>
                    </div>
                  </CardContent>
                </Card>
              )
              })}
            </div>
          )}
        </div>
      </ScrollArea>
    </div>
  )
}

