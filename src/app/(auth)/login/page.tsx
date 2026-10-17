import type { Metadata } from "next";
import { AuthForm } from "@/components/auth/auth-form";
import { AuthShell } from "@/components/auth/auth-shell";

export const metadata: Metadata = {
  title: "Log in",
  robots: { index: false, follow: true },
};

export default function LoginPage() {
  return (
    <AuthShell title="Welcome back" intro="Log in to open your CV on any phone. You never need an account to build or download a CV.">
      <AuthForm mode="login" />
    </AuthShell>
  );
}
