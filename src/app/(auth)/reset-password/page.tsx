import type { Metadata } from "next";
import { AuthScreen } from "@/components/auth/auth-screen";
import { ResetPasswordForm } from "@/components/auth/reset-password-form";

export const metadata: Metadata = {
  title: "Choose a new password",
  robots: { index: false, follow: false },
};

export default function ResetPasswordPage() {
  return (
    <AuthScreen title="Choose a new password" switchTo={{ label: "Log in", href: "/login" }}>
      <ResetPasswordForm />
    </AuthScreen>
  );
}
