import type { Metadata } from "next";
import { Footer } from "@/components/marketing/footer";
import { Navbar } from "@/components/marketing/navbar";
import { NotFoundScene } from "@/components/marketing/not-found-scene";

export const metadata: Metadata = {
  title: "Page not found",
  robots: { index: false },
};

export default function NotFound() {
  return (
    <>
      <Navbar />
      <main className="flex-1">
        <NotFoundScene />
      </main>
      <Footer />
    </>
  );
}
