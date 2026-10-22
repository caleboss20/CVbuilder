import type { Metadata } from "next";
import { AffiliateAuthScreen } from "@/components/affiliates/affiliate-auth-screen";
import { ResetPasswordForm } from "@/components/auth/reset-password-form";

export const metadata: Metadata = {
  title: "Choose a new password",
  robots: { index: false, follow: false },
};

export default function AffiliateResetPasswordPage() {
  return (
    <AffiliateAuthScreen title="Choose a new password" intro="Pick a password you will remember.">
      <ResetPasswordForm affiliate />
    </AffiliateAuthScreen>
  );
}
