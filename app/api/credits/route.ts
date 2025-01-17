import { NextResponse } from 'next/server';
import crypto from 'crypto';

const LEMONSQUEEZY_SIGNING_SECRET = process.env.LEMONSQUEEZY_SIGNING_SECRET;

export async function POST(req: Request) {
  try {
    const body = await req.text();
    const signature = req.headers.get('x-signature');

    // Verify webhook signature
    if (LEMONSQUEEZY_SIGNING_SECRET) {
      const hmac = crypto.createHmac('sha256', LEMONSQUEEZY_SIGNING_SECRET);
      const digest = hmac.update(body).digest('hex');
      
      if (signature !== digest) {
        return NextResponse.json(
          { success: false, message: 'Invalid signature' },
          { status: 401 }
        );
      }
    }

    const event = JSON.parse(body);

    if (event.meta.event_name === 'order_created') {
      const { order } = event.data;
      const { user_id, variant_id, total } = order;

      // Calculate credits based on variant_id or total
      let creditsToAdd = 0;
      switch (variant_id) {
        case 'your_variant_id_1':
          creditsToAdd = 100;
          break;
        case 'your_variant_id_2':
          creditsToAdd = 500;
          break;
        default:
          creditsToAdd = Math.floor(total / 100); // Example: $1 = 1 credit
      }

      // TODO: Update user credits in your database
      // await db.user.update({
      //   where: { id: user_id },
      //   data: { credits: { increment: creditsToAdd } }
      // });

      return NextResponse.json({ 
        success: true, 
        message: `Added ${creditsToAdd} credits` 
      });
    }

    return NextResponse.json({ 
      success: false, 
      message: 'Unhandled event' 
    });
  } catch (error) {
    console.error('Error processing webhook:', error);
    return NextResponse.json(
      { success: false, error: 'Internal server error' },
      { status: 500 }
    );
  }
} 