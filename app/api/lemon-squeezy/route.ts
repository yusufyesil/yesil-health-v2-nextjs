import { NextResponse } from 'next/server'
import { headers } from 'next/headers'
import crypto from 'crypto'
import { doc, getFirestore, updateDoc, increment, getDoc } from 'firebase/firestore'
import { initializeApp, getApps, cert } from 'firebase-admin/app'
import { getFirestore as getAdminFirestore } from 'firebase-admin/firestore'

// Initialize Firebase Admin if not already initialized
let adminApp;
if (!getApps().length) {
  adminApp = initializeApp({
    credential: cert({
      projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
      clientEmail: process.env.FIREBASE_CLIENT_EMAIL,
      privateKey: process.env.FIREBASE_PRIVATE_KEY?.replace(/\\n/g, '\n')
    })
  });
}

const adminDb = getAdminFirestore();

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
        const userEmail = event.data.attributes.user_email
        const orderStatus = event.data.attributes.status
        const variantId = event.data.attributes.first_order_item.variant_id.toString()
        const expectedVariantId = process.env.NEXT_PUBLIC_LEMONSQUEEZY_VARIANT_ID
        
        console.log('Order details:', {
          userEmail,
          orderStatus,
          total: event.data.attributes.total,
          variantId,
          expectedVariantId,
          fullPayload: event
        })
        
        // Only add credits if the order is paid and variant matches
        if (userEmail && orderStatus === 'paid' && variantId === expectedVariantId) {
          try {
            // Get user document by email
            const usersRef = adminDb.collection('users')
            const userSnapshot = await usersRef.where('email', '==', userEmail).limit(1).get()
            
            if (userSnapshot.empty) {
              console.error('User not found with email:', userEmail)
              return new NextResponse('User not found', { status: 404 })
            }

            const userDoc = userSnapshot.docs[0]
            const currentCredits = userDoc.data()?.credits || 0
            console.log('Current credits:', currentCredits)

            // Add 100 credits
            await userDoc.ref.update({
              credits: currentCredits + 100
            })
            
            console.log('Credits updated successfully:', {
              userEmail,
              oldCredits: currentCredits,
              newCredits: currentCredits + 100
            })
            
            return new NextResponse(JSON.stringify({
              success: true,
              message: 'Added 100 credits to user account',
              oldCredits: currentCredits,
              newCredits: currentCredits + 100
            }), { 
              status: 200,
              headers: {
                'Content-Type': 'application/json'
              }
            })
          } catch (error) {
            console.error('Error updating credits:', error)
            return new NextResponse(JSON.stringify({
              success: false,
              error: 'Failed to update credits'
            }), { status: 500 })
          }
        } else {
          console.log('Order not processed:', {
            reason: !userEmail ? 'No user email' : !orderStatus ? 'Invalid order status' : 'Variant ID mismatch',
            userEmail,
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