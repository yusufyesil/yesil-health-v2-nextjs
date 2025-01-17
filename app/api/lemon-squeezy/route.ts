import { NextResponse } from 'next/server'
import { headers } from 'next/headers'
import crypto from 'crypto'

export async function POST(req: Request) {
  try {
    const body = await req.text()
    const headersList = headers()
    
    // Verify webhook signature
    const signingSecret = process.env.LEMONSQUEEZY_SIGNING_SECRET
    const signature = headersList.get('x-signature')
    
    if (!signingSecret || !signature) {
      return new NextResponse('Unauthorized', { status: 401 })
    }

    const hmac = crypto.createHmac('sha256', signingSecret)
    const digest = hmac.update(body).digest('hex')
    
    if (signature !== digest) {
      return new NextResponse('Invalid signature', { status: 401 })
    }

    const event = JSON.parse(body)
    const eventName = event.meta.event_name

    // Handle different webhook events
    switch (eventName) {
      case 'order_created':
        // Handle new order
        break
      case 'subscription_created':
        // Handle new subscription
        break
      case 'subscription_updated':
        // Handle subscription update
        break
    }

    return new NextResponse('Webhook processed', { status: 200 })
  } catch (error) {
    console.error('Webhook error:', error)
    return new NextResponse('Webhook error', { status: 500 })
  }
} 