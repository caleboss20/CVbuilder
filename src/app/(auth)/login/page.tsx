import type { Metadata } from "next";
import { AuthForm } from "@/components/auth/auth-form";
import { AuthScreen } from "@/components/auth/auth-screen";

export const metadata: Metadata = {
  title: "Log in",
  robots: { index: false, follow: true },
};

export default function LoginPage() {
  return (
    <AuthScreen
      title="Log in to CV11"
      intro="Open your CV on any phone. You never need an account to build or download a CV."
      switchTo={{ label: "Sign Up", href: "/signup" }}
    >
      <AuthForm mode="login" />
    </AuthScreen>
  );
}
