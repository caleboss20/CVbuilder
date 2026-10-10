/**
 * A glowing "portal" behind the start page heading: a large circle whose rim
 * shimmers, with light bursting up out of it, so the title feels like it rises
 * out of the ring. Pure CSS; motion stops for reduced-motion users.
 */

const css = `
@keyframes cv11-spin { to { transform: translate(-50%, 0) rotate(360deg); } }
@keyframes cv11-breathe {
  0%, 100% { opacity: .75; transform: translate(-50%, 0) scale(1); }
  50% { opacity: 1; transform: translate(-50%, 0) scale(1.04); }
}
@keyframes cv11-rise {
  from { opacity: 0; transform: translateY(46px) scale(.94); filter: blur(6px); }
  to { opacity: 1; transform: translateY(0) scale(1); filter: blur(0); }
}
.cv11-ring { animation: cv11-spin 18s linear infinite; }
.cv11-burst { animation: cv11-breathe 5s ease-in-out infinite; }
.cv11-rise { animation: cv11-rise 1.1s cubic-bezier(.22,1,.36,1) both; }
@media (prefers-reduced-motion: reduce) {
  .cv11-ring, .cv11-burst, .cv11-rise { animation: none; }
}
`;

export function PortalGlow() {
  return (
    <div
      aria-hidden="true"
      className="pointer-events-none absolute inset-x-0 top-0 -z-10 h-[388px] overflow-hidden sm:h-[406px]"
      style={{
        // Only the top of the arc shows: fade the sides and the bottom away
        maskImage: "radial-gradient(ellipse 58% 100% at 50% 0%, black 88%, transparent 100%)",
        WebkitMaskImage: "radial-gradient(ellipse 58% 100% at 50% 0%, black 88%, transparent 100%)",
      }}
    >
      <style>{css}</style>

      {/* Light bursting upward out of the portal */}
      <div
        className="cv11-burst absolute left-1/2 top-[70px] h-[360px] w-[760px] max-w-[140vw] rounded-full blur-3xl"
        style={{
          background:
            "radial-gradient(ellipse 50% 60% at 50% 70%, rgb(124 128 255 / .28), rgb(90 94 245 / .12) 45%, transparent 75%)",
        }}
      />

      {/* The portal: a big circle, mostly below the fold, with a glowing rim */}
      <div
        className="absolute left-1/2 top-[358px] size-[1100px] sm:top-[372px] max-w-none -translate-x-1/2 rounded-full"
        style={{
          background: "radial-gradient(circle at 50% 0%, rgb(124 128 255 / .22), transparent 40%), var(--ink-950)",
          boxShadow:
            "0 -1px 0 0 rgb(165 168 255 / .55), 0 -8px 30px 0 rgb(124 128 255 / .3), 0 -30px 90px 6px rgb(90 94 245 / .2), inset 0 30px 80px -20px rgb(124 128 255 / .2)",
        }}
      />

      {/* Rotating shimmer travelling around the rim */}
      <div
        className="cv11-ring absolute left-1/2 top-[358px] size-[1100px] sm:top-[372px] rounded-full"
        style={{
          background:
            "conic-gradient(from 0deg, transparent 0deg, rgb(255 255 255 / .5) 18deg, rgb(165 168 255 / .2) 40deg, transparent 70deg, transparent 360deg)",
          WebkitMask: "radial-gradient(circle, transparent 549px, black 550px, black 552px, transparent 553px)",
          mask: "radial-gradient(circle, transparent 549px, black 550px, black 552px, transparent 553px)",
          filter: "blur(1px) drop-shadow(0 0 8px rgb(165 168 255 / .9))",
        }}
      />

    </div>
  );
}
