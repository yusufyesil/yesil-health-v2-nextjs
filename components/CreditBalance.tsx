import { useState, useEffect } from 'react';
import { Coins } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface CreditBalanceProps {
  credits: number;
}

export function CreditBalance({ credits }: CreditBalanceProps) {
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    // Add Lemonsqueezy script
    const script = document.createElement('script');
    script.src = 'https://assets.lemonsqueezy.com/lemon.js';
    script.defer = true;
    document.body.appendChild(script);

    return () => {
      const existingScript = document.querySelector('script[src="https://assets.lemonsqueezy.com/lemon.js"]');
      if (existingScript) {
        document.body.removeChild(existingScript);
      }
    };
  }, []);

  const handlePurchaseClick = () => {
    setIsLoading(true);
    try {
      // Open the direct Lemon Squeezy checkout URL
      window.location.href = "https://yesilhealth.lemonsqueezy.com/buy/17283596-b745-4deb-bf66-f4492bfddb11?embed=1&media=0&discount=0";
    } catch (error) {
      console.error('Error opening checkout:', error);
      setIsLoading(false);
    }
  };

  return (
    <div className="flex items-center gap-4">
      <div className="flex items-center gap-2 bg-white/50 px-3 py-1.5 rounded-full border">
        <Coins className="h-4 w-4 text-[#14ca9e]" />
        <span className="text-sm font-medium">{credits} Credits</span>
      </div>
      <a 
        href="https://yesilhealth.lemonsqueezy.com/buy/17283596-b745-4deb-bf66-f4492bfddb11?embed=1&media=0&discount=0" 
        className="lemonsqueezy-button"
      >
        <Button
          disabled={isLoading}
          className="bg-[#14ca9e] hover:bg-[#14ca9e]/90 text-white rounded-full px-4 py-1.5 text-sm font-medium flex items-center gap-2"
        >
          {isLoading ? (
            <>
              <span className="animate-spin">⌛</span>
              Processing...
            </>
          ) : (
            <>
              <Coins className="h-4 w-4" />
              Buy TEST Credits
            </>
          )}
        </Button>
      </a>
    </div>
  );
} 