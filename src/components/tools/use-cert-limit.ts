"use client";

import { useEffect, useState } from "react";
import { useUser } from "@/components/auth/use-user";
import { loadSupabase } from "@/lib/auth-config";
import { FREE_BATCH } from "@/lib/certificate-names";

/**
 * How many certificates this person may make in one batch: the free number, or more when they have
 * bought a bigger batch (a row in cert_grants, read through cert_limit() in supabase/share.sql).
 * Visitors who are not signed in always get the free number.
 */
export function useCertLimit(): number {
  const { user } = useUser();
  const [granted, setGranted] = useState(0);

  useEffect(() => {
    let cancelled = false;
    if (!user) return;
    loadSupabase().then(async (supabase) => {
      const { data } = (await supabase?.rpc("cert_limit")) ?? {};
      if (!cancelled && typeof data === "number") setGranted(data);
    });
    return () => {
      cancelled = true;
    };
  }, [user]);

  // Signed out means no grant, whatever was loaded before
  return user ? Math.max(FREE_BATCH, granted) : FREE_BATCH;
}
