import { useEffect, useRef } from 'react'
import { pusherService } from '../services/pusher-service'

interface UseWebSocketOptions {
  onConcernUpdate?: (data: any) => void
  onChatRoomCreated?: (data: any) => void
  departmentId?: number
  autoConnect?: boolean
}

export function useWebSocket(options: UseWebSocketOptions = {}) {
  const { onConcernUpdate, onChatRoomCreated, departmentId, autoConnect = true } = options
  const isConnected = useRef(false)

  useEffect(() => {
    if (!autoConnect) return

    // Connect to Pusher
    pusherService.getPusher() // This will initialize Pusher if not already done
    isConnected.current = true

    // Subscribe to concern updates
    if (onConcernUpdate) {
      if (departmentId) {
        pusherService.subscribeToDepartmentConcerns(departmentId, onConcernUpdate)
      } else {
        pusherService.subscribeToConcerns(onConcernUpdate)
      }
    }

    // Subscribe to chat room creation events
    if (onChatRoomCreated) {
      if (departmentId) {
        pusherService.subscribeToDepartmentConcerns(departmentId, onChatRoomCreated)
      } else {
        pusherService.subscribeToConcerns(onChatRoomCreated)
      }
    }

    // Cleanup on unmount
    return () => {
      if (isConnected.current) {
        if (departmentId) {
          pusherService.unsubscribeFromChannel(`private-concerns.department.${departmentId}`)
        } else {
          pusherService.unsubscribeFromChannel('concerns')
        }
        pusherService.disconnect()
        isConnected.current = false
      }
    }
  }, [onConcernUpdate, departmentId, autoConnect])

  return {
    isConnected: isConnected.current,
    connect: () => {
      pusherService.getPusher()
      isConnected.current = true
    },
    disconnect: () => {
      pusherService.disconnect()
      isConnected.current = false
    },
  }
}
