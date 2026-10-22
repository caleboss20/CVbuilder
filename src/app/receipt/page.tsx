import type { Metadata } from "next";
import { Receipt } from "@/components/receipts/receipt";

// A private page for one person's own receipt: never listed by search engines
export const metadata: Metadata = {
  title: "Receipt",
  robots: { index: false, follow: false },
};

export default function ReceiptPage() {
  return <Receipt />;
}
