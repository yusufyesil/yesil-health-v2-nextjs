"use client";

import { initializeApp, getApps } from 'firebase/app';
import { getAuth } from 'firebase/auth';
import { getFirestore, enableIndexedDbPersistence } from 'firebase/firestore';

const firebaseConfig = {
  apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY,
  authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN,
  projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
  storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
  appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID
};

// Debug log to check if environment variables are loaded
console.log('Firebase Config:', {
  hasApiKey: !!firebaseConfig.apiKey,
  hasAuthDomain: !!firebaseConfig.authDomain,
  hasProjectId: !!firebaseConfig.projectId,
  // Don't log the actual values for security
});

// Initialize Firebase only if it hasn't been initialized and config is valid
if (!firebaseConfig.apiKey) {
  throw new Error('Firebase API key is missing. Check your environment variables.');
}

const app = getApps().length === 0 ? initializeApp(firebaseConfig) : getApps()[0];

// Get Auth and Firestore instances
const auth = getAuth(app);
const db = getFirestore(app);

// Enable offline persistence for Firestore
if (typeof window !== 'undefined') {
  enableIndexedDbPersistence(db)
    .catch((error: { code: string }) => {
      if (error.code === 'failed-precondition') {
        console.warn('Multiple tabs open, persistence can only be enabled in one tab at a time.');
      } else if (error.code === 'unimplemented') {
        console.warn('The current browser doesn\'t support persistence.');
      }
    });
}

export { auth, db }; 