"use client";

import { useEffect, useRef } from "react";
import { subscribePointer } from "@/lib/pointer";

const SPACING = 28; // aligns with the 56px CSS grid (every intersection + midpoints)
const RADIUS = 150; // how far the cursor influences dots
const PUSH = 18; // max px a dot is pushed away
const STIFFNESS = 0.07;
const DAMPING = 0.82;
const BRAND = [124, 128, 255];

type Dot = { bx: number; by: number; x: number; y: number; vx: number; vy: number };

/**
 * Interactive dot grid + trailing glow for the hero background.
 * Fills its positioned parent and listens to pointer movement on it.
 * Renders nothing on touch devices or when reduced motion is requested.
 */
export function HeroCursorField() {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    const host = canvas?.parentElement;
    if (!canvas || !host) return;

    const finePointer = window.matchMedia("(pointer: fine)").matches;
    const reducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    if (!finePointer || reducedMotion) return;

    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    let width = 0;
    let height = 0;
    let dots: Dot[] = [];
    let frame = 0;
    let visible = true;

    // Pointer target and the lagging glow that chases it
    const pointer = { x: -9999, y: -9999, active: false };
    const glow = { x: -9999, y: -9999, vx: 0, vy: 0, strength: 0 };

    const resize = () => {
      const dpr = Math.min(window.devicePixelRatio || 1, 2);
      width = host.clientWidth;
      height = host.clientHeight;
      canvas.width = width * dpr;
      canvas.height = height * dpr;
      canvas.style.width = `${width}px`;
      canvas.style.height = `${height}px`;
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);

      dots = [];
      for (let y = SPACING; y < height; y += SPACING) {
        for (let x = SPACING; x < width; x += SPACING) {
          dots.push({ bx: x, by: y, x, y, vx: 0, vy: 0 });
        }
      }
      start();
    };

    const step = () => {
      frame = 0;
      ctx.clearRect(0, 0, width, height);

      // Glow follows the pointer with a soft lag
      const tx = pointer.active ? pointer.x : glow.x;
      const ty = pointer.active ? pointer.y : glow.y;
      glow.vx = (tx - glow.x) * 0.09;
      glow.vy = (ty - glow.y) * 0.09;
      glow.x += glow.vx;
      glow.y += glow.vy;
      glow.strength += ((pointer.active ? 1 : 0) - glow.strength) * 0.06;

      if (glow.strength > 0.01) {
        const speed = Math.min(Math.hypot(glow.vx, glow.vy), 40);
        const stretch = 1 + speed / 60;
        ctx.save();
        ctx.translate(glow.x, glow.y);
        ctx.rotate(Math.atan2(glow.vy, glow.vx));
        ctx.scale(stretch, 1 / stretch);
        const g = ctx.createRadialGradient(0, 0, 0, 0, 0, 280);
        g.addColorStop(0, `rgba(90, 94, 245, ${0.28 * glow.strength})`);
        g.addColorStop(0.5, `rgba(90, 94, 245, ${0.08 * glow.strength})`);
        g.addColorStop(1, "rgba(90, 94, 245, 0)");
        ctx.fillStyle = g;
        ctx.fillRect(-280, -280, 560, 560);
        ctx.restore();
      }

      // Theme text colour as "r g b", read each frame so a theme switch applies instantly
      const fg = (getComputedStyle(document.documentElement).getPropertyValue("--fg-rgb").trim() || "255 255 255")
        .split(/\s+/)
        .map(Number);

      // Dots: pushed away from the glow, spring back with a wobble
      const cx = width / 2;
      const cy = height * 0.45;
      let moving = glow.strength > 0.01;

      for (const d of dots) {
        const dx = d.bx - glow.x;
        const dy = d.by - glow.y;
        const dist = Math.hypot(dx, dy);
        let influence = 0;

        if (dist < RADIUS && glow.strength > 0.01) {
          influence = (1 - dist / RADIUS) * glow.strength;
          const ease = influence * influence;
          const tx2 = d.bx + (dx / (dist || 1)) * PUSH * ease;
          const ty2 = d.by + (dy / (dist || 1)) * PUSH * ease;
          d.vx += (tx2 - d.x) * STIFFNESS;
          d.vy += (ty2 - d.y) * STIFFNESS;
        } else {
          d.vx += (d.bx - d.x) * STIFFNESS;
          d.vy += (d.by - d.y) * STIFFNESS;
        }
        d.vx *= DAMPING;
        d.vy *= DAMPING;
        d.x += d.vx;
        d.y += d.vy;

        if (Math.abs(d.vx) > 0.01 || Math.abs(d.vy) > 0.01) moving = true;

        // Fade dots out toward the hero edges, like the CSS grid mask
        const ex = (d.bx - cx) / (width * 0.7);
        const ey = (d.by - cy) / (height * 0.6);
        const edge = Math.max(0, 1 - Math.hypot(ex, ey));
        if (edge <= 0) continue;

        const alpha = (0.1 + influence * 0.8) * edge;
        const size = 0.9 + influence * 1.6;
        // Blend from the theme text colour (white in dark, navy in light) toward brand indigo
        const r = Math.round(fg[0] + (BRAND[0] - fg[0]) * influence);
        const gC = Math.round(fg[1] + (BRAND[1] - fg[1]) * influence);
        const b = Math.round(fg[2] + (BRAND[2] - fg[2]) * influence);
        ctx.fillStyle = `rgba(${r}, ${gC}, ${b}, ${alpha})`;
        ctx.beginPath();
        ctx.arc(d.x, d.y, size, 0, Math.PI * 2);
        ctx.fill();
      }

      // Keep animating while anything is in motion; otherwise idle
      if (visible && (moving || pointer.active)) start();
    };

    const start = () => {
      if (!frame && visible) frame = requestAnimationFrame(step);
    };

    const onPointer = ({ x, y }: { x: number; y: number }) => {
      const rect = host.getBoundingClientRect();
      const inside = x >= rect.left && x <= rect.right && y >= rect.top && y <= rect.bottom;
      if (!inside) {
        // Left the area: let the glow fade out
        if (pointer.active) {
          pointer.active = false;
          start();
        }
        return;
      }
      pointer.x = x - rect.left;
      pointer.y = y - rect.top;
      if (!pointer.active && glow.strength < 0.01) {
        // Start the glow at the cursor instead of flying in from off-screen
        glow.x = pointer.x;
        glow.y = pointer.y;
      }
      pointer.active = true;
      start();
    };

    const ro = new ResizeObserver(resize);
    ro.observe(host);

    const io = new IntersectionObserver(([entry]) => {
      visible = entry.isIntersecting;
      if (visible) start();
    });
    io.observe(host);

    const unsubscribe = subscribePointer(onPointer);

    return () => {
      cancelAnimationFrame(frame);
      ro.disconnect();
      io.disconnect();
      unsubscribe();
    };
  }, []);

  return (
    <canvas
      ref={canvasRef}
      aria-hidden="true"
      className="pointer-events-none absolute inset-0 -z-10"
    />
  );
}
