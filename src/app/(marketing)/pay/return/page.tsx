import type { Metadata } from "next";
import { PayReturn } from "@/components/builder/pay-return";

export const metadata: Metadata = {
  title: "Confirming your payment",
  robots: { index: false, follow: false },
};

export default function PayReturnPage() {
  return <PayReturn />;
}
