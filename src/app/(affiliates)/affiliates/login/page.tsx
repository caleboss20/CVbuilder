import type { Metadata } from "next";
import { AffiliateAuthScreen } from "@/components/affiliates/affiliate-auth-screen";
import { AuthForm } from "@/components/auth/auth-form";

export const metadata: Metadata = {
  title: "Log in to CV11 Affiliates",
  robots: { index: false, follow: true },
};

export default function AffiliateLoginPage() {
  return (
    <AffiliateAuthScreen title="Log in to your affiliate account" intro="See your code, your link and what you have earned.">
      <AuthForm mode="login" light after="/affiliates/dashboard" confirmTo="/affiliates/dashboard" loginHref="/affiliates/login" signupHref="/affiliates/signup" />
    </AffiliateAuthScreen>
  );
}
