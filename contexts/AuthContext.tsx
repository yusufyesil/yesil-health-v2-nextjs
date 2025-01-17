"use client";

import { createContext, useContext, useEffect, useState } from 'react';
import { auth, db } from '@/lib/firebase';
import { 
  GoogleAuthProvider, 
  signInWithPopup, 
  signOut, 
  onAuthStateChanged,
  User 
} from 'firebase/auth';
import { doc, getDoc, setDoc, onSnapshot } from 'firebase/firestore';

interface AuthContextType {
  user: User | null;
  credits: number;
  loading: boolean;
  signInWithGoogle: () => Promise<void>;
  signOutUser: () => Promise<void>;
  updateCredits: (newCredits: number) => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [credits, setCredits] = useState(0);
  const [loading, setLoading] = useState(true);

  // Listen for auth state changes
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      setUser(user);
      if (user) {
        const userRef = doc(db, 'users', user.uid);
        const userDoc = await getDoc(userRef);
        
        if (userDoc.exists()) {
          setCredits(userDoc.data().credits || 0);
        } else {
          await setDoc(userRef, {
            email: user.email,
            credits: 0,
            createdAt: new Date()
          });
          setCredits(0);
        }

        // Set up real-time listener for credits
        const unsubscribeCredits = onSnapshot(userRef, (doc) => {
          if (doc.exists()) {
            setCredits(doc.data().credits || 0);
          }
        });

        return () => {
          unsubscribeCredits();
        };
      } else {
        setCredits(0);
      }
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  const signInWithGoogle = async () => {
    try {
      const provider = new GoogleAuthProvider();
      provider.setCustomParameters({
        prompt: 'select_account'
      });
      const result = await signInWithPopup(auth, provider);
      
      // Create user document if it doesn't exist
      const userDoc = await getDoc(doc(db, 'users', result.user.uid));
      if (!userDoc.exists()) {
        await setDoc(doc(db, 'users', result.user.uid), {
          email: result.user.email,
          credits: 0,
          createdAt: new Date()
        });
        setCredits(0);
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
    if (!user) return;
    try {
      await setDoc(doc(db, 'users', user.uid), { credits: newCredits }, { merge: true });
      setCredits(newCredits);
    } catch (error) {
      console.error('Error updating credits:', error);
    }
  };

  return (
    <AuthContext.Provider value={{ 
      user, 
      credits, 
      loading, 
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