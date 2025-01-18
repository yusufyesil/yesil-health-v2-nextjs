"use client";

import { useAuth } from "@/contexts/AuthContext";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { LogOut, Mail, Bug } from "lucide-react";
import { useIsMobile } from "@/hooks/use-mobile";

export function Header() {
  const { user, signOutUser, credits } = useAuth();
  const isMobile = useIsMobile();

  if (!user) return null;

  return (
    <header className="fixed top-0 right-0 z-50 flex items-center justify-end px-4 py-3">
      <div className="flex items-center gap-6">
        {!isMobile && (
          <>
            <a
              href="mailto:hello@yesilhealth.com?subject=Contact"
              className="flex items-center gap-2 text-sm text-gray-600 hover:text-gray-900"
            >
              <Mail className="h-4 w-4" />
              <span>Contact Us</span>
            </a>
            <a
              href="mailto:hello@yesilhealth.com?subject=Bug Report"
              className="flex items-center gap-2 text-sm text-gray-600 hover:text-gray-900"
            >
              <Bug className="h-4 w-4" />
              <span>Report Bug</span>
            </a>
          </>
        )}
        <DropdownMenu>
          <DropdownMenuTrigger className="focus:outline-none">
            <div className="h-8 w-8 rounded-full bg-[#40E0D0] flex items-center justify-center">
              <span className="text-sm text-white font-medium">
                {user.email?.charAt(0).toUpperCase()}
              </span>
            </div>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-[200px]">
            <div className="px-2 py-1.5 text-sm text-gray-600 overflow-hidden text-ellipsis">
              {user.email}
            </div>
            <DropdownMenuSeparator />
            <div className="px-2 py-1.5">
              <div className="text-sm font-medium text-gray-900">Credits</div>
              <div className="text-sm text-gray-600">{credits} remaining</div>
            </div>
            <DropdownMenuSeparator />
            {isMobile && (
              <>
                <DropdownMenuItem asChild>
                  <a
                    href="mailto:hello@yesilhealth.com?subject=Contact"
                    className="cursor-pointer flex items-center"
                  >
                    <Mail className="mr-2 h-4 w-4" />
                    <span>Contact Us</span>
                  </a>
                </DropdownMenuItem>
                <DropdownMenuItem asChild>
                  <a
                    href="mailto:hello@yesilhealth.com?subject=Bug Report"
                    className="cursor-pointer flex items-center"
                  >
                    <Bug className="mr-2 h-4 w-4" />
                    <span>Report Bug</span>
                  </a>
                </DropdownMenuItem>
                <DropdownMenuSeparator />
              </>
            )}
            <DropdownMenuItem onClick={signOutUser} className="cursor-pointer text-red-600">
              <LogOut className="mr-2 h-4 w-4" />
              <span>Sign out</span>
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </header>
  );
} 