"use client";

import Link from "next/link";
import { authConfigured } from "@/lib/auth-config";
import { useUser } from "./use-user";

/**
 * The "Log in" or "Account" link in the navbar. It shows nothing until sign-in is set up and the
 * saved session has been checked, so the bar never flashes the wrong state.
 */
export function AuthNav({ className = "", onNavigate }: { className?: string; onNavigate?: () => void }) {
  const { user, loading } = useUser();
  if (!authConfigured || loading) return null;

  return (
    <Link href={user ? "/account" : "/login"} onClick={onNavigate} className={className}>
      {user ? "Account" : "Log in"}
    </Link>
  );
}
