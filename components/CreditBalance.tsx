"use client";

import { Coins } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/contexts/AuthContext";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { LogOut, Mail, Bug, CreditCard } from "lucide-react";

interface CreditBalanceProps {
  credits: number;
}

export function CreditBalance({ credits }: CreditBalanceProps) {
  const { user, signOutUser } = useAuth();

  const handleBuyCredits = () => {
    if (!user) return;
    
    const baseUrl = "https://yesilhealth.lemonsqueezy.com/buy/17283596-b745-4deb-bf66-f4492bfddb11";
    const params = new URLSearchParams({
      'embed': '1',
      'media': '0',
      'discount': '0',
      'checkout[email]': user?.email || ''
    });
    const checkoutUrl = `${baseUrl}?${params.toString()}`;
    
    const link = document.createElement('a');
    link.href = checkoutUrl;
    link.className = 'lemonsqueezy-button';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="flex items-center gap-2">
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button 
            variant="outline" 
            size="sm"
            className="flex items-center gap-2 px-3 border-gray-200 hover:bg-gray-50"
          >
            <Coins className="h-4 w-4 text-[#14ca9e]" />
            <span>{credits} credits</span>
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end" className="w-[200px]">
          <DropdownMenuItem onClick={handleBuyCredits} className="cursor-pointer">
            <CreditCard className="mr-2 h-4 w-4" />
            <span>Buy Credits</span>
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>

      <DropdownMenu>
        <DropdownMenuTrigger className="focus:outline-none">
          <div className="h-8 w-8 rounded-full bg-[#40E0D0] flex items-center justify-center">
            <span className="text-sm text-white font-medium">
              {user?.email?.charAt(0).toUpperCase()}
            </span>
          </div>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end" className="w-[200px]">
          <div className="px-2 py-1.5 text-sm text-gray-600 overflow-hidden text-ellipsis">
            {user?.email}
          </div>
          <DropdownMenuSeparator />
          <DropdownMenuItem onClick={handleBuyCredits} className="cursor-pointer">
            <CreditCard className="mr-2 h-4 w-4" />
            <span>Buy Credits</span>
          </DropdownMenuItem>
          <DropdownMenuItem 
            onClick={() => window.location.href = 'mailto:hello@yesilhealth.com?subject=Contact'}
            className="cursor-pointer"
          >
            <Mail className="mr-2 h-4 w-4" />
            <span>Contact Us</span>
          </DropdownMenuItem>
          <DropdownMenuItem 
            onClick={() => window.location.href = 'mailto:hello@yesilhealth.com?subject=Bug Report'}
            className="cursor-pointer"
          >
            <Bug className="mr-2 h-4 w-4" />
            <span>Report Bug</span>
          </DropdownMenuItem>
          <DropdownMenuSeparator />
          <DropdownMenuItem onClick={signOutUser} className="cursor-pointer text-red-600">
            <LogOut className="mr-2 h-4 w-4" />
            <span>Sign out</span>
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
    </div>
  );
} 