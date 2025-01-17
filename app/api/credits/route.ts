import { NextResponse } from 'next/server';
import { auth, db } from '@/lib/firebase-admin';
import { doc, getDoc } from 'firebase/firestore';

export async function GET(req: Request) {
  try {
    // Get the user ID from the session
    const session = await auth.verifySessionCookie(req.headers.get('cookie') || '');
    const userId = session.uid;

    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Get user's credits from Firestore
    const userRef = doc(db, 'users', userId);
    const userDoc = await getDoc(userRef);
    
    if (!userDoc.exists()) {
      return NextResponse.json({ credits: 0 });
    }

    const credits = userDoc.data()?.credits || 0;
    return NextResponse.json({ credits });
  } catch (error) {
    console.error('Error fetching credits:', error);
    return NextResponse.json({ error: 'Failed to fetch credits' }, { status: 500 });
  }
} 