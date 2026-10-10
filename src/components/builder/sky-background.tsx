/**
 * Decorative animated sky: soft glowing bubbles that drift and pulse, and a few
 * comets streaking across. Pure CSS, sits behind the content, and switches off
 * for people who prefer reduced motion.
 */

const bubbles = [
  { left: "8%", top: "18%", size: 140, delay: "0s", dur: "14s", color: "124 128 255" },
  { left: "82%", top: "12%", size: 180, delay: "-4s", dur: "18s", color: "165 168 255" },
  { left: "70%", top: "62%", size: 120, delay: "-8s", dur: "16s", color: "90 94 245" },
  { left: "18%", top: "70%", size: 160, delay: "-2s", dur: "20s", color: "124 128 255" },
  { left: "46%", top: "38%", size: 90, delay: "-6s", dur: "12s", color: "196 181 253" },
];

const comets = [
  { top: "6%", left: "60%", delay: "0s", dur: "7s" },
  { top: "22%", left: "90%", delay: "2.5s", dur: "9s" },
  { top: "2%", left: "30%", delay: "5s", dur: "8s" },
  { top: "40%", left: "100%", delay: "7.5s", dur: "10s" },
];

const css = `
@keyframes cv11-drift {
  0%, 100% { transform: translate(0, 0) scale(1); opacity: .55; }
  50% { transform: translate(24px, -30px) scale(1.12); opacity: .9; }
}
@keyframes cv11-comet {
  0% { transform: translate(0, 0) rotate(-35deg); opacity: 0; }
  8% { opacity: 1; }
  60% { opacity: 1; }
  100% { transform: translate(-900px, 630px) rotate(-35deg); opacity: 0; }
}
@keyframes cv11-twinkle {
  0%, 100% { opacity: .2; }
  50% { opacity: .9; }
}
.cv11-bubble { animation: cv11-drift var(--dur) ease-in-out var(--delay) infinite; }
.cv11-comet { animation: cv11-comet var(--dur) linear var(--delay) infinite; }
.cv11-star { animation: cv11-twinkle 3s ease-in-out var(--delay) infinite; }
@media (prefers-reduced-motion: reduce) {
  .cv11-bubble, .cv11-comet, .cv11-star { animation: none; }
  .cv11-comet { opacity: 0; }
}
`;

export function SkyBackground() {
  return (
    <div aria-hidden="true" className="pointer-events-none absolute inset-0 -z-10 overflow-hidden">
      <style>{css}</style>

      {bubbles.map((b, i) => (
        <span
          key={i}
          className="cv11-bubble absolute rounded-full blur-2xl"
          style={
            {
              left: b.left,
              top: b.top,
              width: b.size,
              height: b.size,
              background: `radial-gradient(circle at 35% 35%, rgb(${b.color} / 0.55), rgb(${b.color} / 0.08) 60%, transparent 70%)`,
              "--delay": b.delay,
              "--dur": b.dur,
            } as React.CSSProperties
          }
        />
      ))}

      {comets.map((c, i) => (
        <span
          key={i}
          className="cv11-comet absolute h-px w-40"
          style={
            {
              top: c.top,
              left: c.left,
              background: "linear-gradient(90deg, rgb(255 255 255 / 0.95), rgb(165 168 255 / 0.6) 25%, transparent)",
              boxShadow: "0 0 12px 1px rgb(165 168 255 / 0.7)",
              "--delay": c.delay,
              "--dur": c.dur,
            } as React.CSSProperties
          }
        >
          <span className="absolute -left-0.5 -top-[3px] size-[7px] rounded-full bg-white shadow-[0_0_14px_4px_rgb(165_168_255/0.9)]" />
        </span>
      ))}

      {Array.from({ length: 18 }, (_, i) => (
        <span
          key={i}
          className="cv11-star absolute size-[2px] rounded-full bg-fg"
          style={
            {
              left: `${(i * 53) % 100}%`,
              top: `${(i * 37) % 100}%`,
              "--delay": `${(i % 6) * 0.5}s`,
            } as React.CSSProperties
          }
        />
      ))}
    </div>
  );
}
