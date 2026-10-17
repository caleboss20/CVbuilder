import type { Metadata } from "next";
import { AuthForm } from "@/components/auth/auth-form";
import { AuthScreen } from "@/components/auth/auth-screen";

export const metadata: Metadata = {
  title: "Create your account",
  robots: { index: false, follow: true },
};

export default function SignupPage() {
  return (
    <AuthScreen
      title="Create your CV11 account"
      intro="Free. Keep your CV safe and open it on any phone. You can still build a CV without one."
      switchTo={{ label: "Log in", href: "/login" }}
    >
      <AuthForm mode="signup" />
    </AuthScreen>
  );
}
