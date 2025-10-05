import { NextRequest, NextResponse } from 'next/server'
import Pusher from 'pusher'

const pusher = new Pusher({
  appId: process.env.NEXT_PUBLIC_PUSHER_APP_ID!,
  key: process.env.NEXT_PUBLIC_PUSHER_APP_KEY!,
  secret: process.env.PUSHER_APP_SECRET!,
  cluster: process.env.NEXT_PUBLIC_PUSHER_APP_CLUSTER!,
  useTLS: true
})

export async function POST(request: NextRequest) {
  try {
    const { socket_id, channel_name } = await request.json()
    
    // Get the authorization header
    const authHeader = request.headers.get('authorization')
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const token = authHeader.substring(7)
    
    // Here you would typically validate the JWT token
    // For now, we'll assume the token is valid if it exists
    if (!token) {
      return NextResponse.json({ error: 'Invalid token' }, { status: 401 })
    }

    // Generate auth response for private channels
    const authResponse = pusher.authorizeChannel(socket_id, channel_name, {
      user_id: 'user_' + Date.now(), // You should extract this from the JWT token
      user_info: {
        name: 'Department User', // You should extract this from the JWT token
        role: 'department_head' // You should extract this from the JWT token
      }
    })

    return NextResponse.json(authResponse)
  } catch (error) {
    console.error('Pusher auth error:', error)
    return NextResponse.json({ error: 'Authentication failed' }, { status: 500 })
  }
}

