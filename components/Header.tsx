"use client";

import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { useAuth } from "@/contexts/AuthContext";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Bug, Mail, LogOut } from "lucide-react";

export function Header() {
  const { user, signOutUser, signInWithGoogle } = useAuth();

  return (
    <header className="fixed top-0 right-0 z-50 flex items-center justify-end px-4 py-3">
      <div className="flex items-center gap-6">
        <a
          href="mailto:support@yesilhealth.ai"
          className="flex items-center gap-2 text-sm text-gray-600 hover:text-gray-900"
        >
          <Mail className="h-4 w-4" />
          <span>Contact Us</span>
        </a>
        <a
          href="https://github.com/yesilhealth/issues"
          target="_blank"
          rel="noopener noreferrer"
          className="flex items-center gap-2 text-sm text-gray-600 hover:text-gray-900"
        >
          <Bug className="h-4 w-4" />
          <span>Report Bug</span>
        </a>
        {user ? (
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" className="relative h-8 w-8 rounded-full">
                <Avatar className="h-8 w-8">
                  <AvatarImage src={user.photoURL || undefined} alt={user.displayName || 'User'} />
                  <AvatarFallback>{user.displayName?.[0] || 'U'}</AvatarFallback>
                </Avatar>
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem
                onClick={signOutUser}
                className="text-red-600 cursor-pointer"
              >
                <LogOut className="mr-2 h-4 w-4" />
                <span>Log out</span>
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        ) : (
          <Button
            variant="ghost"
            className="text-sm"
            onClick={signInWithGoogle}
          >
            Sign In
          </Button>
        )}
      </div>
    </header>
  );
} 