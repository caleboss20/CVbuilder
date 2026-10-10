"use client";

import { useEffect, useRef, useState, type ReactNode } from "react";

/**
 * Renders its children only once they come near the screen. The parent should
 * already have a fixed size, so nothing moves when the content appears.
 */
export function LazyMount({ children, margin = "800px" }: { children: ReactNode; margin?: string }) {
  const ref = useRef<HTMLDivElement>(null);
  const [shown, setShown] = useState(false);

  useEffect(() => {
    const el = ref.current;
    if (!el || shown) return;
    const io = new IntersectionObserver(
      ([e]) => {
        if (e.isIntersecting) {
          setShown(true);
          io.disconnect();
        }
      },
      { rootMargin: `${margin} 0px` },
    );
    io.observe(el);
    return () => io.disconnect();
  }, [shown, margin]);

  return (
    <div ref={ref} className="size-full">
      {shown ? children : <span className="block size-full" aria-hidden="true" />}
    </div>
  );
}
