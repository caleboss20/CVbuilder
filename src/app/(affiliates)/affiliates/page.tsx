import type { Metadata } from "next";
import { AffiliateFaq } from "@/components/affiliates/affiliate-faq";
import { CelebrateCta } from "@/components/affiliates/celebrate-cta";
import { AffiliatesHero } from "@/components/affiliates/affiliates-hero";
import { FoundingAffiliates } from "@/components/affiliates/founding-affiliates";
import { WhoCanJoin } from "@/components/affiliates/who-can-join";
import { WhyJoin } from "@/components/affiliates/why-join";
import { siteConfig } from "@/lib/site";

export const metadata: Metadata = {
  title: "CV11 Affiliates: Earn by Helping People Get Their CV Done",
  description: `Help people build a CV on CV11 and earn ${siteConfig.affiliates.commission} of every CV payment made with your code. Free to join, paid by mobile money.`,
};

export default function AffiliatesPage() {
  return (
    <>
      <AffiliatesHero />
      <WhyJoin />
      <FoundingAffiliates />
      <WhoCanJoin />

      <CelebrateCta />
      <AffiliateFaq />
    </>
  );
}
