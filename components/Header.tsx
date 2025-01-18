"use client";

import { useAuth } from "@/contexts/AuthContext";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { LogOut, Mail, Bug, Menu } from "lucide-react";

export function Header() {
  const { user, signOutUser } = useAuth();

  if (!user) return null;

  return (
    <header className="fixed top-0 right-0 left-0 z-50 bg-white/95 backdrop-blur supports-[backdrop-filter]:bg-white/60 border-b">
      <div className="flex items-center justify-between px-4 py-3">
        {/* Logo - visible on mobile */}
        <div className="flex items-center gap-2 md:hidden">
          <img
            src="https://hebbkx1anhila5yf.public.blob.vercel-storage.com/logo200px-RHm9VN8wUaVd9WkNDzpDhPBeUG4JYr.png"
            alt="Yesil AI Logo"
            className="h-8 w-8"
          />
          <span className="font-semibold text-gray-900">Yesil AI</span>
        </div>

        <div className="flex items-center gap-4">
          {/* Contact and Bug Report - hidden on mobile */}
          <div className="hidden md:flex items-center gap-6">
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
          </div>

          {/* Profile Dropdown */}
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
              {/* Mobile-only menu items */}
              <div className="md:hidden">
                <DropdownMenuItem asChild>
                  <a
                    href="mailto:hello@yesilhealth.com?subject=Contact"
                    className="flex items-center cursor-pointer"
                  >
                    <Mail className="mr-2 h-4 w-4" />
                    <span>Contact Us</span>
                  </a>
                </DropdownMenuItem>
                <DropdownMenuItem asChild>
                  <a
                    href="mailto:hello@yesilhealth.com?subject=Bug Report"
                    className="flex items-center cursor-pointer"
                  >
                    <Bug className="mr-2 h-4 w-4" />
                    <span>Report Bug</span>
                  </a>
                </DropdownMenuItem>
                <DropdownMenuSeparator />
              </div>
              <DropdownMenuItem onClick={signOutUser} className="cursor-pointer text-red-600">
                <LogOut className="mr-2 h-4 w-4" />
                <span>Sign out</span>
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>
    </header>
  );
} 