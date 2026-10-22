import type { Metadata } from "next";
import { AffiliateAuthScreen } from "@/components/affiliates/affiliate-auth-screen";
import { AuthForm } from "@/components/auth/auth-form";

export const metadata: Metadata = {
  title: "Create your CV11 Affiliates account",
  robots: { index: false, follow: true },
};

export default function AffiliateSignupPage() {
  return (
    <AffiliateAuthScreen title="Create your free account" intro="One CV11 account is all you need. After this, you apply to become an affiliate.">
      <AuthForm mode="signup" light after="/affiliates/dashboard" confirmTo="/affiliates/dashboard" loginHref="/affiliates/login" signupHref="/affiliates/signup" />
    </AffiliateAuthScreen>
  );
}
