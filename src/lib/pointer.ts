/**
 * One shared, frame-throttled pointer listener for every cursor effect
 * (dot grid, magnetic buttons, the 404 eye). Instead of each effect running
 * its own window listener, they subscribe here and get at most one update
 * per animation frame.
 */

export type PointerState = { x: number; y: number; type: "move" | "down" };
type Listener = (p: PointerState) => void;

const listeners = new Set<Listener>();
let latest: PointerState | null = null;
let frame = 0;

function flush() {
  frame = 0;
  if (!latest) return;
  const p = latest;
  listeners.forEach((fn) => fn(p));
}

function onPointer(e: PointerEvent) {
  latest = { x: e.clientX, y: e.clientY, type: e.type === "pointerdown" ? "down" : "move" };
  if (!frame) frame = requestAnimationFrame(flush);
}

/** Subscribe to pointer movement. Returns an unsubscribe function. */
export function subscribePointer(fn: Listener): () => void {
  if (listeners.size === 0) {
    window.addEventListener("pointermove", onPointer, { passive: true });
    window.addEventListener("pointerdown", onPointer, { passive: true });
  }
  listeners.add(fn);
  return () => {
    listeners.delete(fn);
    if (listeners.size === 0) {
      window.removeEventListener("pointermove", onPointer);
      window.removeEventListener("pointerdown", onPointer);
      cancelAnimationFrame(frame);
      frame = 0;
      latest = null;
    }
  };
}
