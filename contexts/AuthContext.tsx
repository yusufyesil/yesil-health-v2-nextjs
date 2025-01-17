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
import { doc, getDoc, setDoc } from 'firebase/firestore';

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

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      setUser(user);
      if (user) {
        const userDoc = await getDoc(doc(db, 'users', user.uid));
        if (userDoc.exists()) {
          setCredits(userDoc.data().credits || 0);
        } else {
          await setDoc(doc(db, 'users', user.uid), {
            email: user.email,
            credits: 0, // Start with 0 credits
            createdAt: new Date()
          });
          setCredits(0);
        }
      }
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  const signInWithGoogle = async () => {
    try {
      const provider = new GoogleAuthProvider();
      await signInWithPopup(auth, provider);
    } catch (error) {
      console.error('Error signing in with Google:', error);
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