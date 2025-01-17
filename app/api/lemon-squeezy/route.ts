import { NextResponse } from 'next/server'
import { headers } from 'next/headers'
import crypto from 'crypto'
import { doc, getFirestore, updateDoc, increment, getDoc } from 'firebase/firestore'

export async function POST(req: Request) {
  try {
    const body = await req.text()
    const headersList = headers()
    
    // Verify webhook signature
    const signingSecret = process.env.LEMONSQUEEZY_SIGNING_SECRET
    // Try both header formats
    const signature = headersList.get('x-signature') || headersList.get('X-Signature')
    
    console.log('Webhook received:', {
      hasSigningSecret: !!signingSecret,
      hasSignature: !!signature,
      bodyLength: body.length
    })
    
    if (!signingSecret || !signature) {
      console.error('Missing signing secret or signature')
      return new NextResponse('Unauthorized', { status: 401 })
    }

    const hmac = crypto.createHmac('sha256', signingSecret)
    const digest = hmac.update(body).digest('hex')
    
    console.log('Signature verification:', {
      receivedSignature: signature,
      calculatedSignature: digest,
      match: signature === digest
    })
    
    if (signature !== digest) {
      return new NextResponse('Invalid signature', { status: 401 })
    }

    const event = JSON.parse(body)
    const eventName = event.meta.event_name

    console.log('Processing event:', {
      eventName,
      testMode: event.meta.test_mode
    })

    // Handle different webhook events
    switch (eventName) {
      case 'order_created':
        const userId = event.data.attributes.custom_data?.userId
        const orderStatus = event.data.attributes.status
        
        console.log('Order details:', {
          userId,
          orderStatus,
          total: event.data.attributes.total
        })
        
        // Only add credits if the order is paid
        if (userId && orderStatus === 'paid') {
          const db = getFirestore()
          const userRef = doc(db, 'users', userId)
          
          // Verify user exists
          const userDoc = await getDoc(userRef)
          if (!userDoc.exists()) {
            console.error('User not found:', userId)
            return new NextResponse('User not found', { status: 404 })
          }
          
          // Add 100 credits
          await updateDoc(userRef, {
            credits: increment(100)
          })
          
          console.log('Credits added successfully for user:', userId)
          
          return new NextResponse(JSON.stringify({
            success: true,
            message: 'Added 100 credits to user account'
          }), { status: 200 })
        }
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