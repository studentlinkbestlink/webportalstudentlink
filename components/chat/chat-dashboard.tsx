"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { 
  MessageSquare, 
  Users, 
  Clock, 
  CheckCircle,
  AlertCircle,
  X
} from "lucide-react"
import { ChatRoomList } from "./chat-room-list"
import { ChatInterface } from "./chat-interface"
import { type ChatRoom } from "@/lib/api-client"
import { useAuth } from "@/components/auth-provider"

export function ChatDashboard() {
  const { user } = useAuth()
  const [selectedChatRoom, setSelectedChatRoom] = useState<ChatRoom | null>(null)
  const [view, setView] = useState<'list' | 'chat'>('list')

  const handleSelectChatRoom = (chatRoom: ChatRoom) => {
    setSelectedChatRoom(chatRoom)
    setView('chat')
  }

  const handleBackToList = () => {
    setSelectedChatRoom(null)
    setView('list')
  }

  const handleCloseChat = () => {
    setSelectedChatRoom(null)
    setView('list')
  }

  if (!user) {
    return (
      <div className="flex items-center justify-center h-64">
        <p className="text-gray-500">Please log in to access chat</p>
      </div>
    )
  }

  return (
    <div className="h-full flex flex-col">
      {/* Header */}
      <div className="bg-white shadow-sm border-b border-gray-200 p-8">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 rounded-lg bg-[#1E2A78] flex items-center justify-center">
              <MessageSquare className="h-6 w-6 text-white" />
            </div>
            <div>
              <h1 className="text-3xl font-bold text-[#1E2A78] tracking-tight">Real-time Chat</h1>
              <p className="text-gray-600 text-lg font-medium">
                Communicate with students in real-time across all departments
              </p>
            </div>
          </div>
          
          {view === 'chat' && selectedChatRoom && (
            <div className="flex items-center gap-3">
              <Badge className="px-3 py-1 text-sm font-semibold rounded-lg bg-green-100 text-green-800 border border-green-300 shadow-sm">
                {selectedChatRoom.concern?.status.toUpperCase()}
              </Badge>
              <Button
                variant="outline"
                size="sm"
                onClick={handleBackToList}
                className="h-10 w-10 rounded-lg"
              >
                <X className="h-4 w-4" />
              </Button>
            </div>
          )}
        </div>
      </div>

      {/* Content */}
      <div className="flex-1 p-0 overflow-hidden">
        {view === 'list' ? (
          <ChatRoomList 
            onSelectChatRoom={handleSelectChatRoom}
            selectedChatRoomId={selectedChatRoom?.id}
          />
        ) : selectedChatRoom ? (
          <ChatInterface
            chatRoom={selectedChatRoom}
            currentUserId={user.id}
            onClose={handleCloseChat}
          />
        ) : (
          <div className="flex items-center justify-center h-64">
            <p className="text-gray-500">No chat room selected</p>
          </div>
        )}
      </div>
    </div>
  )
}

