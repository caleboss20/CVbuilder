"use client";

import { useState } from "react";
import { AuthForm } from "@/components/auth/auth-form";
import { useUser } from "@/components/auth/use-user";
import { industries } from "@/lib/industries";

type Reply = { improved?: string; why?: string; suggestion?: null; error?: string };

/**
 * Owner-only test bench for the AI: paste a messy bullet, pick a field, see what comes back.
 * Used to judge quality before any AI button is shown to students.
 */
export function AiLab() {
  const { user, session, loading } = useUser({ eager: true });
  const [text, setText] = useState("");
  const [role, setRole] = useState("");
  const [field, setField] = useState("");
  const [busy, setBusy] = useState(false);
  const [reply, setReply] = useState<Reply | null>(null);

  async function run() {
    setBusy(true);
    setReply(null);
    try {
      const res = await fetch("/api/ai/improve-bullet", {
        method: "POST",
        headers: { "content-type": "application/json", authorization: `Bearer ${session?.access_token ?? ""}` },
        body: JSON.stringify({ text, role, field }),
      });
      setReply((await res.json()) as Reply);
    } catch {
      setReply({ error: "Could not reach the server." });
    } finally {
      setBusy(false);
    }
  }

  const box = "w-full rounded-md border border-afg/15 bg-afg/[0.03] px-3 py-2 text-sm text-afg focus:border-afg/60 focus:outline-none";

  if (loading) return <main className="min-h-screen bg-abg" />;
  if (!user) {
    return (
      <main className="grid min-h-screen place-items-center bg-abg p-6">
        <div className="w-full max-w-sm"><AuthForm mode="login" after="/admin/ai-lab" allowSignup={false} neutral /></div>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-abg p-6 text-afg">
      <div className="mx-auto max-w-xl space-y-4">
        <h1 className="text-2xl">AI lab</h1>
        <textarea className={box} rows={3} value={text} onChange={(e) => setText(e.target.value)} placeholder="A messy bullet, e.g. i was selling things in shop for my aunty and helping customers" />
        <div className="grid gap-3 sm:grid-cols-2">
          <input className={box} value={role} onChange={(e) => setRole(e.target.value)} placeholder="Role (optional)" />
          <select className={box} value={field} onChange={(e) => setField(e.target.value)}>
            <option value="">Field (optional)</option>
            {industries.map((i) => <option key={i.id} value={i.id}>{i.label}</option>)}
          </select>
        </div>
        <button onClick={run} disabled={busy || !text.trim()} className="h-11 rounded-md bg-afg px-5 text-sm font-medium text-abg disabled:opacity-50">
          {busy ? "Thinking…" : "Improve"}
        </button>
        {reply && (
          <div className="rounded-lg border border-afg/10 bg-acard p-4 text-sm">
            {reply.error && <p className="text-adown">{reply.error}</p>}
            {reply.improved && <><p className="text-base">{reply.improved}</p><p className="mt-2 text-afg/60">{reply.why}</p></>}
            {reply.suggestion === null && <p className="text-afg/60">No safe suggestion (the AI added facts that were not in your text).</p>}
          </div>
        )}
      </div>
    </main>
  );
}
