"use client";

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/button';

export default function OnboardingPage() {
  const { user, credits, signInWithGoogle } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (user) {
      // If user has credits, go to main app
      if (credits > 0) {
        router.push('/');
      } else {
        // If user has no credits, go to pricing
        router.push('/pricing');
      }
    }
  }, [user, credits, router]);

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-gradient-to-b from-teal-50 to-white px-4">
      <div className="text-center mb-8">
        <img
          src="https://hebbkx1anhila5yf.public.blob.vercel-storage.com/logo200px-RHm9VN8wUaVd9WkNDzpDhPBeUG4JYr.png"
          alt="Yesil AI Logo"
          className="h-20 w-20 mx-auto mb-6"
        />
        <h1 className="text-3xl font-bold text-gray-900 mb-2">Welcome to Yesil AI</h1>
        <p className="text-gray-600 mb-8">Your Virtual Hospital powered by AI</p>
        
        <div className="space-y-4">
          <Button
            onClick={signInWithGoogle}
            className="w-full max-w-sm bg-white hover:bg-gray-50 text-gray-900 border shadow-sm"
          >
            <img 
              src="https://www.google.com/favicon.ico" 
              alt="Google" 
              className="w-4 h-4 mr-2"
            />
            Continue with Google
          </Button>
        </div>
      </div>

      <div className="max-w-2xl text-center text-sm text-gray-500">
        <p>By continuing, you agree to our Terms of Service and Privacy Policy.</p>
      </div>
    </div>
  );
} 