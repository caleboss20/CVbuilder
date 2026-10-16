"use client";

import { useEffect, useRef, useState } from "react";

type Point = { label: string; value: number };

const H = 240;
const PAD = { left: 34, right: 8, top: 12, bottom: 26 };

/** A tidy top value for the chart, like 4, 10, 20, 50, 100, so the grid lines read well. */
function niceMax(max: number): number {
  if (max <= 4) return 4;
  const pow = 10 ** Math.floor(Math.log10(max));
  const n = max / pow;
  return (n <= 1 ? 1 : n <= 2 ? 2 : n <= 5 ? 5 : 10) * pow;
}

/** "2026-10-16" as "16 Oct". */
export const shortDate = (iso: string) => new Date(`${iso}T00:00:00`).toLocaleDateString("en-GB", { day: "numeric", month: "short" });

/**
 * A simple area chart in the style of the Vercel dashboard: faint grid, a single line with a soft
 * fill, and a hover guide with the day and the number. Drawn in plain SVG, so it needs no library.
 * Colours come from the dashboard's own black-and-white variables, so it works in light and dark mode.
 */
export function AreaChart({ id, points, color }: { id: string; points: Point[]; color: string }) {
  const boxRef = useRef<HTMLDivElement>(null);
  const [hover, setHover] = useState<number | null>(null);
  // The chart is drawn at its real on-screen width, so its text stays the same size on a phone
  const [W, setW] = useState(640);

  useEffect(() => {
    const el = boxRef.current;
    if (!el) return;
    const measure = () => setW(Math.max(240, Math.round(el.clientWidth)));
    measure();
    const observer = new ResizeObserver(measure);
    observer.observe(el);
    return () => observer.disconnect();
  }, []);

  const top = niceMax(Math.max(0, ...points.map((p) => p.value)));
  const innerW = W - PAD.left - PAD.right;
  const innerH = H - PAD.top - PAD.bottom;
  const x = (i: number) => PAD.left + (points.length <= 1 ? innerW / 2 : (i / (points.length - 1)) * innerW);
  const y = (v: number) => PAD.top + innerH - (v / top) * innerH;

  const line = points.map((p, i) => `${i === 0 ? "M" : "L"}${x(i).toFixed(1)},${y(p.value).toFixed(1)}`).join(" ");
  const area = points.length ? `${line} L${x(points.length - 1).toFixed(1)},${PAD.top + innerH} L${x(0).toFixed(1)},${PAD.top + innerH} Z` : "";
  const gridValues = [0, top / 2, top];
  // Date labels at the start, middle and end, so they never crowd each other
  const labelIdx = points.length > 2 ? [0, Math.floor((points.length - 1) / 2), points.length - 1] : points.map((_, i) => i);

  function onMove(e: React.PointerEvent) {
    const box = boxRef.current?.getBoundingClientRect();
    if (!box || !points.length) return;
    const fx = ((e.clientX - box.left) / box.width) * W;
    const i = Math.round(((fx - PAD.left) / innerW) * (points.length - 1));
    setHover(Math.min(points.length - 1, Math.max(0, i)));
  }

  const active = hover !== null ? points[hover] : null;

  return (
    <div ref={boxRef} className="relative w-full select-none" onPointerMove={onMove} onPointerLeave={() => setHover(null)} style={{ touchAction: "pan-y" }}>
      <svg width={W} height={H} viewBox={`0 0 ${W} ${H}`} className="block w-full" role="img" aria-label="Chart of the numbers day by day">
        <defs>
          <linearGradient id={`fill-${id}`} x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" style={{ stopColor: color }} stopOpacity="0.22" />
            <stop offset="100%" style={{ stopColor: color }} stopOpacity="0" />
          </linearGradient>
        </defs>

        {gridValues.map((v) => (
          <g key={v}>
            <line x1={PAD.left} x2={W - PAD.right} y1={y(v)} y2={y(v)} className="stroke-afg" strokeOpacity="0.1" strokeDasharray={v === 0 ? undefined : "3 4"} />
            <text x={PAD.left - 8} y={y(v) + 4} textAnchor="end" fontSize="11" className="fill-afg" fillOpacity="0.45">
              {Math.round(v)}
            </text>
          </g>
        ))}

        {area && <path d={area} fill={`url(#fill-${id})`} />}
        {line && <path d={line} fill="none" style={{ stroke: color }} strokeWidth="2" strokeLinejoin="round" strokeLinecap="round" />}

        {labelIdx.map((i) => (
          <text key={i} x={x(i)} y={H - 6} textAnchor={i === 0 ? "start" : i === points.length - 1 ? "end" : "middle"} fontSize="11" className="fill-afg" fillOpacity="0.45">
            {points[i].label}
          </text>
        ))}

        {hover !== null && active && (
          <g>
            <line x1={x(hover)} x2={x(hover)} y1={PAD.top} y2={PAD.top + innerH} className="stroke-afg" strokeOpacity="0.25" />
            <circle cx={x(hover)} cy={y(active.value)} r="4" style={{ fill: color }} className="stroke-abg" strokeWidth="2" />
          </g>
        )}
      </svg>

      {hover !== null && active && (
        <div
          className="pointer-events-none absolute top-2 z-10 -translate-x-1/2 rounded-md border border-afg/15 bg-acard px-3 py-2 text-xs"
          // Keep the tip inside the card at both ends of the chart
          style={{ left: `${Math.min(88, Math.max(12, (x(hover) / W) * 100))}%` }}
        >
          <p className="text-afg/50">{active.label}</p>
          <p className="mt-0.5 flex items-center gap-2 font-medium text-afg">
            <span className="size-2 rounded-full" style={{ background: color }} />
            {active.value.toLocaleString("en-GB")}
          </p>
        </div>
      )}
    </div>
  );
}
