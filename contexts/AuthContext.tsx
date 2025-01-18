"use client";

import { createContext, useContext, useEffect, useState } from 'react';
import { auth, db } from '@/lib/firebase';
import { 
  GoogleAuthProvider, 
  signInWithPopup, 
  signOut, 
  onAuthStateChanged,
  User,
  signInWithRedirect,
  getRedirectResult
} from 'firebase/auth';
import { doc, getDoc, setDoc, onSnapshot } from 'firebase/firestore';

interface AuthContextType {
  user: User | null;
  credits: number;
  loading: boolean;
  isNewUser: boolean;
  signInWithGoogle: () => Promise<void>;
  signOutUser: () => Promise<void>;
  updateCredits: (newCredits: number) => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [credits, setCredits] = useState(0);
  const [loading, setLoading] = useState(true);
  const [isNewUser, setIsNewUser] = useState(false);
  const [isHandlingRedirect, setIsHandlingRedirect] = useState(true);

  // Handle redirect result first
  useEffect(() => {
    const handleRedirectResult = async () => {
      try {
        const result = await getRedirectResult(auth);
        if (result) {
          console.log('Google redirect sign in successful:', result.user.email);
          setUser(result.user);
          
          // Create user document if it doesn't exist
          const userRef = doc(db, 'users', result.user.uid);
          const userDoc = await getDoc(userRef);
          if (!userDoc.exists()) {
            console.log('Creating new user document after redirect sign in');
            await setDoc(userRef, {
              email: result.user.email,
              credits: 10,
              createdAt: new Date(),
              lastFreeCreditsReset: new Date()
            });
            setCredits(10);
            setIsNewUser(true);
          }
        }
      } catch (error) {
        console.error('Error handling redirect result:', error);
      } finally {
        setIsHandlingRedirect(false);
      }
    };

    handleRedirectResult();
  }, []);

  // Listen for auth state changes after handling redirect
  useEffect(() => {
    if (isHandlingRedirect) return;

    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      console.log('Auth state changed:', user?.email);
      setUser(user);
      if (user) {
        const userRef = doc(db, 'users', user.uid);
        const userDoc = await getDoc(userRef);
        
        if (!userDoc.exists()) {
          console.log('Creating new user document');
          setIsNewUser(true);
          const initialUserData = {
            email: user.email,
            credits: 10,
            createdAt: new Date(),
            lastFreeCreditsReset: new Date()
          };
          await setDoc(userRef, initialUserData);
          setCredits(10);
        } else {
          setIsNewUser(false);
          const data = userDoc.data();
          const lastReset = data.lastFreeCreditsReset?.toDate() || new Date(0);
          const monthsSinceReset = (new Date().getTime() - lastReset.getTime()) / (1000 * 60 * 60 * 24 * 30);
          
          if (monthsSinceReset >= 1 && data.credits < 100) {
            console.log('Resetting free credits');
            await setDoc(userRef, {
              ...data,
              credits: 10,
              lastFreeCreditsReset: new Date()
            }, { merge: true });
            setCredits(10);
          } else {
            setCredits(data.credits || 0);
          }
        }
      } else {
        console.log('User signed out, resetting credits');
        setCredits(0);
        setIsNewUser(false);
      }
      setLoading(false);
    });

    return () => unsubscribe();
  }, [isHandlingRedirect]);

  // Separate effect for credits listener
  useEffect(() => {
    if (!user) return;

    console.log('Setting up credits listener for user:', user.email);
    const userRef = doc(db, 'users', user.uid);
    const unsubscribeCredits = onSnapshot(userRef, (doc) => {
      if (doc.exists()) {
        const newCredits = doc.data().credits;
        console.log('Firestore credits update:', {
          userId: user.uid,
          newCredits,
          previousCredits: credits
        });
        if (typeof newCredits === 'number') {
          setCredits(newCredits);
        } else {
          console.warn('Invalid credits value in Firestore:', newCredits);
        }
      }
    });

    return () => {
      console.log('Cleaning up credits listener');
      unsubscribeCredits();
    };
  }, [user]);

  const signInWithGoogle = async () => {
    try {
      const provider = new GoogleAuthProvider();
      provider.setCustomParameters({
        prompt: 'select_account'
      });

      // Check if we're on mobile
      const isMobile = /iPhone|iPad|iPod|Android/i.test(navigator.userAgent);
      
      if (isMobile) {
        // Use redirect method for mobile
        await signInWithRedirect(auth, provider);
      } else {
        // Use popup for desktop
        const result = await signInWithPopup(auth, provider);
        console.log('Google sign in successful:', result.user.email);
      }
      
    } catch (error: any) {
      console.error('Error signing in with Google:', error);
      if (error.code === 'auth/popup-closed-by-user') {
        console.log('Popup closed by user');
        return;
      }
      if (error.code === 'auth/popup-blocked') {
        console.error('Popup was blocked by the browser');
        return;
      }
    }
  };

  const signOutUser = async () => {
    try {
      await signOut(auth);
      setCredits(0);
    } catch (error) {
      console.error('Error signing out:', error);
    }
  };

  const updateCredits = async (newCredits: number) => {
    if (!user) {
      console.warn('Attempted to update credits without user');
      return;
    }
    console.log('Updating credits:', { userId: user.uid, newCredits });
    try {
      // Optimistic update
      setCredits(newCredits);
      await setDoc(doc(db, 'users', user.uid), { credits: newCredits }, { merge: true });
      console.log('Credits updated successfully');
    } catch (error) {
      console.error('Error updating credits:', error);
      // Revert optimistic update on error
      const userRef = doc(db, 'users', user.uid);
      const userDoc = await getDoc(userRef);
      setCredits(userDoc.data()?.credits || 0);
    }
  };

  return (
    <AuthContext.Provider value={{ 
      user, 
      credits, 
      loading, 
      isNewUser,
      signInWithGoogle, 
      signOutUser,
      updateCredits 
    }}>
      {children}
    </AuthContext.Provider>
  );
}

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}; 