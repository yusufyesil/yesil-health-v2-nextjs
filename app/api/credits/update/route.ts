import { NextResponse } from 'next/server';

export async function POST(req: Request) {
  try {
    const { orderId } = await req.json();

    // TODO: Verify the order with Lemonsqueezy API
    // TODO: Update user credits in your database

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error updating credits:', error);
    return NextResponse.json(
      { success: false, error: 'Internal server error' },
      { status: 500 }
    );
  }
} 