"use client";

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/button';
import { Coins, Check } from 'lucide-react';

export default function PricingPage() {
  const { user, credits, isNewUser } = useAuth();
  const router = useRouter();

  useEffect(() => {
    // If no user, redirect to onboarding
    if (!user) {
      router.push('/onboarding');
      return;
    }

    // If existing user with credits, redirect to home
    if (!isNewUser && credits > 0) {
      router.push('/');
      return;
    }

    // New users or users without credits stay on pricing page
  }, [user, credits, isNewUser, router]);

  const handlePurchaseClick = () => {
    const baseUrl = "https://yesilhealth.lemonsqueezy.com/buy/17283596-b745-4deb-bf66-f4492bfddb11";
    const params = new URLSearchParams({
      'embed': '1',
      'discount': '0',
      'checkout[email]': user?.email || ''
    });
    const checkoutUrl = `${baseUrl}?${params.toString()}`;
    
    // Create and click a temporary link with the lemonsqueezy-button class
    const link = document.createElement('a');
    link.href = checkoutUrl;
    link.className = 'lemonsqueezy-button';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const handleStartFree = () => {
    router.push('/');
  };

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-gradient-to-b from-teal-50 to-white px-4">
      <div className="text-center mb-12">
        <img
          src="https://hebbkx1anhila5yf.public.blob.vercel-storage.com/logo200px-RHm9VN8wUaVd9WkNDzpDhPBeUG4JYr.png"
          alt="Yesil AI Logo"
          className="h-20 w-20 mx-auto mb-6"
        />
        <h1 className="text-3xl font-bold text-gray-900 mb-2">Choose Your Plan</h1>
        <p className="text-gray-600">Get started with your virtual health consultation</p>
      </div>

      <div className="grid md:grid-cols-2 gap-8 w-full max-w-4xl">
        {/* Free Plan */}
        <div className="bg-white rounded-2xl shadow-sm border p-8 text-center">
          <div className="flex justify-center mb-6">
            <div className="bg-gray-50 p-3 rounded-full">
              <Coins className="h-8 w-8 text-gray-600" />
            </div>
          </div>
          <h2 className="text-2xl font-semibold mb-2">Free Plan</h2>
          <div className="text-4xl font-bold text-gray-900 mb-2">$0</div>
          <p className="text-gray-500 mb-6">10 questions per month</p>
          
          <ul className="text-left space-y-4 mb-8">
            <li className="flex items-center">
              <Check className="h-5 w-5 text-gray-600 mr-2" />
              10 monthly consultations
            </li>
            <li className="flex items-center">
              <Check className="h-5 w-5 text-gray-600 mr-2" />
              Basic medical advice
            </li>
            <li className="flex items-center">
              <Check className="h-5 w-5 text-gray-600 mr-2" />
              24/7 availability
            </li>
          </ul>

          <Button
            onClick={handleStartFree}
            variant="outline"
            className="w-full py-6 rounded-xl text-lg font-semibold"
          >
            Start Free
          </Button>
        </div>

        {/* Premium Plan */}
        <div className="bg-white rounded-2xl shadow-sm border border-[#14ca9e] p-8 text-center relative">
          <div className="absolute -top-4 left-1/2 transform -translate-x-1/2">
            <span className="bg-[#14ca9e] text-white px-4 py-1 rounded-full text-sm font-medium">
              Most Popular
            </span>
          </div>
          <div className="flex justify-center mb-6">
            <div className="bg-teal-50 p-3 rounded-full">
              <Coins className="h-8 w-8 text-[#14ca9e]" />
            </div>
          </div>
          <h2 className="text-2xl font-semibold mb-2">Premium Plan</h2>
          <div className="text-4xl font-bold text-gray-900 mb-2">$5</div>
          <p className="text-gray-500 mb-6">100 consultation credits</p>
          
          <ul className="text-left space-y-4 mb-8">
            <li className="flex items-center">
              <Check className="h-5 w-5 text-[#14ca9e] mr-2" />
              100 consultations
            </li>
            <li className="flex items-center">
              <Check className="h-5 w-5 text-[#14ca9e] mr-2" />
              Access to all medical specialties
            </li>
            <li className="flex items-center">
              <Check className="h-5 w-5 text-[#14ca9e] mr-2" />
              Detailed specialist consultations
            </li>
            <li className="flex items-center">
              <Check className="h-5 w-5 text-[#14ca9e] mr-2" />
              24/7 availability
            </li>
          </ul>

          <Button
            onClick={handlePurchaseClick}
            className="w-full bg-[#14ca9e] hover:bg-[#14ca9e]/90 text-white py-6 rounded-xl text-lg font-semibold"
          >
            Get Premium
          </Button>
        </div>
      </div>

      <p className="mt-8 text-sm text-gray-500">
        By continuing, you agree to our Terms of Service and Privacy Policy
      </p>
    </div>
  );
} 