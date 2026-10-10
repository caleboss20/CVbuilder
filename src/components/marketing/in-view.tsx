"use client";

import { useEffect, useRef, useState, type ReactNode } from "react";

/**
 * Sets data-inview="true" once the element is mostly on screen, so touch users
 * (who can't hover) still see hover-style effects as they scroll.
 */
export function InView({ children, className = "" }: { children: ReactNode; className?: string }) {
  const ref = useRef<HTMLDivElement>(null);
  const [inView, setInView] = useState(false);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const io = new IntersectionObserver(([e]) => setInView(e.isIntersecting), { threshold: 0.6 });
    io.observe(el);
    return () => io.disconnect();
  }, []);

  return (
    <div ref={ref} data-inview={inView} className={className}>
      {children}
    </div>
  );
}
