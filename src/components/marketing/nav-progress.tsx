"use client";

import { usePathname } from "next/navigation";
import { useEffect, useRef, useState } from "react";

/**
 * A thin bar across the top of the screen that starts the instant a student taps a link to another
 * page of CV11, and finishes when that page appears. It does not make the next page arrive sooner,
 * but it answers the tap immediately, so the site never feels frozen while the page loads.
 */
export function NavProgress() {
  const pathname = usePathname();
  // 0 means hidden. While loading it creeps towards 90 and then waits for the page to arrive.
  const [progress, setProgress] = useState(0);
  const ticker = useRef<ReturnType<typeof setInterval> | null>(null);
  const loading = useRef(false);

  function stopTicker() {
    if (ticker.current) clearInterval(ticker.current);
    ticker.current = null;
  }

  // A tap on a link to a different page of this site starts the bar
  useEffect(() => {
    function onClick(e: MouseEvent) {
      if (e.defaultPrevented || e.button !== 0 || e.metaKey || e.ctrlKey || e.shiftKey || e.altKey) return;
      const link = (e.target as Element | null)?.closest?.("a[href]") as HTMLAnchorElement | null;
      if (!link || link.target === "_blank" || link.hasAttribute("download")) return;

      const url = new URL(link.href, window.location.href);
      const sameSite = url.origin === window.location.origin;
      const samePage = url.pathname === window.location.pathname && url.search === window.location.search;
      if (!sameSite || samePage) return;

      loading.current = true;
      setProgress(8);
      stopTicker();
      // Each step covers a share of what is left, so it slows down and never reaches the end by itself
      ticker.current = setInterval(() => setProgress((p) => (p < 90 ? p + (90 - p) * 0.12 : p)), 150);
      // If the page never arrives (offline, for example), do not leave the bar stuck on screen
      setTimeout(() => {
        if (loading.current) {
          loading.current = false;
          stopTicker();
          setProgress(0);
        }
      }, 15000);
    }
    document.addEventListener("click", onClick, true);
    return () => {
      document.removeEventListener("click", onClick, true);
      stopTicker();
    };
  }, []);

  // The new page has arrived: fill the bar, then fade it out
  useEffect(() => {
    if (!loading.current) return;
    loading.current = false;
    stopTicker();
    setProgress(100);
    const done = setTimeout(() => setProgress(0), 300);
    return () => clearTimeout(done);
  }, [pathname]);

  return (
    <div
      aria-hidden="true"
      className="pointer-events-none fixed inset-x-0 top-0 z-[100] h-[3px] print:hidden"
      style={{ opacity: progress > 0 ? 1 : 0, transition: "opacity 200ms ease" }}
    >
      <div className="h-full bg-brand-400 shadow-[0_0_10px_rgb(124_128_255/0.8)]" style={{ width: `${progress}%`, transition: "width 200ms ease-out" }} />
    </div>
  );
}
