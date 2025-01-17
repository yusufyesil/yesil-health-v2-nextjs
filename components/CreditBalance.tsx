import { useState } from 'react';
import { Coins } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useAuth } from '@/contexts/AuthContext';

interface CreditBalanceProps {
  credits: number;
}

export function CreditBalance({ credits }: CreditBalanceProps) {
  const [isLoading, setIsLoading] = useState(false);
  const { user } = useAuth();

  const handlePurchaseClick = () => {
    setIsLoading(true);
    try {
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
      <Button
        onClick={handlePurchaseClick}
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
    </div>
  );
} 