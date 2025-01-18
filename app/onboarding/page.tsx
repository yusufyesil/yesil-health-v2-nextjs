"use client";

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/button';

export default function OnboardingPage() {
  const { user, credits, signInWithGoogle, loading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    // Only redirect after loading is complete and we have a user
    if (!loading && user) {
      console.log('OnboardingPage: Redirecting user:', { 
        email: user.email,
        credits,
        loading 
      });
      
      // Use a small timeout to ensure state is settled
      setTimeout(() => {
        if (credits > 0) {
          router.replace('/');
        } else {
          router.replace('/pricing');
        }
      }, 100);
    }
  }, [user, credits, loading, router]);

  // Show loading state while authentication is in progress
  if (loading || user) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-gradient-to-b from-teal-50 to-white px-4">
        <div className="text-center mb-8">
          <div className="animate-pulse">
            <img
              src="https://hebbkx1anhila5yf.public.blob.vercel-storage.com/logo200px-RHm9VN8wUaVd9WkNDzpDhPBeUG4JYr.png"
              alt="Yesil AI Logo"
              className="h-20 w-20 mx-auto mb-6"
            />
            <div className="h-8 w-48 bg-gray-200 rounded mx-auto mb-2"></div>
            <div className="h-4 w-64 bg-gray-100 rounded mx-auto"></div>
          </div>
        </div>
      </div>
    );
  }

  const handleSignIn = () => {
    console.log('OnboardingPage: Starting sign in process');
    signInWithGoogle();
  };

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
            onClick={handleSignIn}
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