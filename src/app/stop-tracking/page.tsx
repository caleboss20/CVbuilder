import type { Metadata } from "next";
import { StopTracking } from "./stop-tracking";

// A private utility page for the site owner, so it stays out of search results
export const metadata: Metadata = {
  title: "Analytics on this device",
  robots: { index: false, follow: false },
};

export default function StopTrackingPage() {
  return (
    <div className="mx-auto flex min-h-screen max-w-md flex-col justify-center px-6 py-16">
      <StopTracking />
    </div>
  );
}
