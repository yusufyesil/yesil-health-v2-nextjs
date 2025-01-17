import { NextResponse } from 'next/server'
import { headers } from 'next/headers'
import crypto from 'crypto'
import { doc, getFirestore, updateDoc, increment, getDoc } from 'firebase/firestore'

export async function POST(req: Request) {
  try {
    const body = await req.text()
    const headersList = headers()
    
    // Get the raw signature from headers
    const signingSecret = process.env.LEMONSQUEEZY_SIGNING_SECRET
    const signature = headersList.get('x-signature')
    
    console.log('Webhook received:', {
      hasSigningSecret: !!signingSecret,
      hasSignature: !!signature,
      bodyLength: body.length,
      rawSignature: signature
    })
    
    if (!signingSecret || !signature) {
      console.error('Missing signing secret or signature')
      return new NextResponse('Unauthorized', { status: 401 })
    }

    // Create HMAC
    const hmac = crypto.createHmac('sha256', signingSecret)
    hmac.update(body)
    const digest = hmac.digest('hex')
    
    console.log('Signature verification:', {
      receivedSignature: signature,
      calculatedSignature: digest,
      match: signature === digest
    })
    
    // Verify signature
    if (signature !== digest) {
      return new NextResponse('Invalid signature', { status: 401 })
    }

    const event = JSON.parse(body)
    console.log('Full webhook payload:', event)

    const eventName = event.meta.event_name
    console.log('Processing event:', {
      eventName,
      testMode: event.meta.test_mode
    })

    // Handle different webhook events
    switch (eventName) {
      case 'order_created':
        // Get user ID from custom data
        const customData = event.data.attributes.custom_data
        const userId = customData?.userId
        const orderStatus = event.data.attributes.status
        const variantId = event.data.attributes.first_order_item.variant_id.toString()
        const expectedVariantId = process.env.NEXT_PUBLIC_LEMONSQUEEZY_VARIANT_ID
        
        console.log('Order details:', {
          userId,
          orderStatus,
          total: event.data.attributes.total,
          customData,
          variantId,
          expectedVariantId
        })
        
        // Only add credits if the order is paid and variant matches
        if (userId && orderStatus === 'paid' && variantId === expectedVariantId) {
          const db = getFirestore()
          const userRef = doc(db, 'users', userId)
          
          // Verify user exists
          const userDoc = await getDoc(userRef)
          if (!userDoc.exists()) {
            console.error('User not found:', userId)
            return new NextResponse('User not found', { status: 404 })
          }
          
          // Add 100 credits for the test product
          await updateDoc(userRef, {
            credits: increment(100)
          })
          
          console.log('Credits added successfully for user:', userId)
          
          return new NextResponse(JSON.stringify({
            success: true,
            message: 'Added 100 credits to user account'
          }), { 
            status: 200,
            headers: {
              'Content-Type': 'application/json'
            }
          })
        } else {
          console.log('Order not processed:', {
            reason: !userId ? 'No user ID' : !orderStatus ? 'Invalid order status' : 'Variant ID mismatch',
            userId,
            orderStatus,
            variantId,
            expectedVariantId
          })
        }
        break
    }

    return new NextResponse('Webhook processed', { 
      status: 200,
      headers: {
        'Content-Type': 'application/json'
      }
    })
  } catch (error) {
    console.error('Webhook error:', error)
    return new NextResponse('Webhook error', { status: 500 })
  }
} 