import type { Metadata } from "next";
import { AuthForm } from "@/components/auth/auth-form";
import { AuthShell } from "@/components/auth/auth-shell";

export const metadata: Metadata = {
  title: "Create your account",
  robots: { index: false, follow: true },
};

export default function SignupPage() {
  return (
    <AuthShell title="Create your account" intro="Free. An account lets you keep your CV safe and open it on any phone. You can still build a CV without one.">
      <AuthForm mode="signup" />
    </AuthShell>
  );
}
