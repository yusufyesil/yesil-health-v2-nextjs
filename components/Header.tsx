"use client";

import { useAuth } from "@/contexts/AuthContext";

export function Header() {
  const { user } = useAuth();

  if (!user) return null;

  return null; // We'll move the header content to CreditBalance component
} 