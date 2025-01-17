import { NextResponse } from 'next/server';
import { auth, db } from '@/lib/firebase-admin';
import { doc, updateDoc, increment } from 'firebase/firestore';

export async function POST(req: Request) {
  try {
    const { orderId, credits } = await req.json();
    
    // Get the user ID from the session
    const session = await auth.verifySessionCookie(req.headers.get('cookie') || '');
    const userId = session.uid;

    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Update user's credits in Firestore
    const userRef = doc(db, 'users', userId);
    await updateDoc(userRef, {
      credits: increment(credits)
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error updating credits:', error);
    return NextResponse.json({ error: 'Failed to update credits' }, { status: 500 });
  }
} 