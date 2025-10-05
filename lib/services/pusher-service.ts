import Pusher from 'pusher-js'

class PusherService {
  private static instance: PusherService
  private pusher: Pusher | null = null
  private channels: Map<string, any> = new Map()

  private constructor() {
    this.initializePusher()
  }

  public static getInstance(): PusherService {
    if (!PusherService.instance) {
      PusherService.instance = new PusherService()
    }
    return PusherService.instance
  }

  private initializePusher() {
    if (typeof window === 'undefined') return // Server-side rendering check

    const appId = process.env.NEXT_PUBLIC_PUSHER_APP_ID
    const key = process.env.NEXT_PUBLIC_PUSHER_APP_KEY
    const cluster = process.env.NEXT_PUBLIC_PUSHER_APP_CLUSTER

    if (!appId || !key || !cluster) {
      console.warn('Pusher credentials not found in environment variables')
      return
    }

    this.pusher = new Pusher(key, {
      cluster,
      forceTLS: true,
      encrypted: true,
    })

    console.log('Pusher initialized for web portal')
  }

  public getPusher(): Pusher | null {
    return this.pusher
  }

  public subscribeToChannel(channelName: string, eventName: string, callback: (data: any) => void) {
    if (!this.pusher) {
      console.warn('Pusher not initialized')
      return null
    }

    const channel = this.pusher.subscribe(channelName)
    channel.bind(eventName, callback)
    
    this.channels.set(channelName, channel)
    return channel
  }

  public subscribeToChatRoom(chatRoomId: number, callback: (data: any) => void) {
    const channelName = `chat.room.${chatRoomId}`
    return this.subscribeToChannel(channelName, 'new_message', callback)
  }

  public subscribeToUserChat(userId: number, callback: (data: any) => void) {
    const channelName = `private-chat.user.${userId}`
    return this.subscribeToChannel(channelName, 'message.sent', callback)
  }

  public subscribeToTypingStatus(chatRoomId: number, callback: (data: any) => void) {
    const channelName = `chat.room.${chatRoomId}`
    return this.subscribeToChannel(channelName, 'typing_status', callback)
  }

  public unsubscribeFromChannel(channelName: string) {
    if (!this.pusher) return

    const channel = this.channels.get(channelName)
    if (channel) {
      this.pusher.unsubscribe(channelName)
      this.channels.delete(channelName)
    }
  }

  public disconnect() {
    if (this.pusher) {
      this.pusher.disconnect()
      this.pusher = null
      this.channels.clear()
    }
  }

  public getConnectionState(): string {
    if (!this.pusher) return 'disconnected'
    return this.pusher.connection.state
  }

  public isConnected(): boolean {
    return this.pusher?.connection.state === 'connected'
  }

  public subscribeToConcerns(callback: (data: any) => void) {
    return this.subscribeToChannel('concerns', 'concern.updated', callback)
  }

  public subscribeToDepartmentConcerns(departmentId: number, callback: (data: any) => void) {
    const channelName = `private-concerns.department.${departmentId}`
    return this.subscribeToChannel(channelName, 'concern.updated', callback)
  }
}

export const pusherService = PusherService.getInstance()

