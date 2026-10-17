"use client";

import { useEffect, useState } from "react";
import { useUser } from "@/components/auth/use-user";
import { loadSupabase } from "@/lib/auth-config";

/**
 * Whether to show AI buttons to this person, and the token to call the AI with.
 * For now only the site owner sees them. The database answers the question, and the server checks
 * again on every request, so hiding a button here is a courtesy, not the lock.
 * When AI opens to everyone, this is the one place to change.
 */
export function useAiAccess(): { allowed: boolean; token: string | undefined } {
  const { user, session } = useUser();
  const [adminId, setAdminId] = useState<string | null>(null);

  useEffect(() => {
    if (!user) return;
    let cancelled = false;
    void loadSupabase().then((supabase) =>
      supabase?.rpc("is_admin").then(({ data }) => {
        if (!cancelled && data === true) setAdminId(user.id);
      }),
    );
    return () => {
      cancelled = true;
    };
  }, [user]);

  return { allowed: Boolean(user) && adminId === user?.id, token: session?.access_token };
}
