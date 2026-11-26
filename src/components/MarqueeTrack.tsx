"use client";

import { useEffect, useRef, type ReactNode } from "react";

// Idle drift speed, and the top speed with the cursor at either edge (px/s).
const IDLE_SPEED = 38;
const MAX_SPEED = 460;
// The middle of the strip (as a fraction of half its width) where the cursor
// leaves the strip at its idle drift.
const DEAD_ZONE = 0.15;
// How quickly the speed eases toward its target; higher is snappier.
const EASE = 6;

// Drives the marquee with requestAnimationFrame instead of a CSS animation so
// the cursor can steer it. It never stops: at rest it drifts slowly, and with a
// mouse over it the strip speeds toward whichever side the cursor is on,
// faster the nearer the edge. Touch and pen input leave it drifting. Keyboard
// focus inside it holds it still so a focused link stays put. With
// prefers-reduced-motion nothing runs and the CSS shows a static list.
export function MarqueeTrack({
  reverse = false,
  children,
}: {
  reverse?: boolean;
  children: ReactNode;
}) {
  const wrapRef = useRef<HTMLDivElement>(null);
  const trackRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const wrap = wrapRef.current;
    const track = trackRef.current;
    if (!wrap || !track) return;
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;

    // Positive speed moves the content right, negative moves it left.
    const idle = reverse ? IDLE_SPEED : -IDLE_SPEED;
    let speed = idle;
    let target = idle;
    let focused = false;
    let x = 0;
    let last = performance.now();
    let raf = 0;

    const onMove = (e: PointerEvent) => {
      if (e.pointerType !== "mouse" || focused) return;
      const rect = wrap.getBoundingClientRect();
      const pos = ((e.clientX - rect.left) / rect.width) * 2 - 1; // -1 left, 1 right
      const pull = Math.max(0, Math.abs(pos) - DEAD_ZONE) / (1 - DEAD_ZONE);
      target =
        pull === 0
          ? idle
          : Math.sign(pos) * (IDLE_SPEED + pull * (MAX_SPEED - IDLE_SPEED));
    };
    const onLeave = () => {
      if (!focused) target = idle;
    };
    const onFocusIn = () => {
      focused = true;
      target = 0;
    };
    const onFocusOut = (e: FocusEvent) => {
      if (wrap.contains(e.relatedTarget as Node | null)) return;
      focused = false;
      target = idle;
    };

    const tick = (now: number) => {
      // Cap the step so returning to a background tab does not jump.
      const dt = Math.min(0.05, (now - last) / 1000);
      last = now;
      speed += (target - speed) * Math.min(1, dt * EASE);
      // The track holds the list twice; wrap within one copy's width.
      const loop = track.scrollWidth / 2;
      if (loop > 0) {
        x = (x + speed * dt) % loop;
        if (x > 0) x -= loop;
        track.style.transform = `translate3d(${x}px, 0, 0)`;
      }
      raf = requestAnimationFrame(tick);
    };

    wrap.addEventListener("pointermove", onMove);
    wrap.addEventListener("pointerleave", onLeave);
    wrap.addEventListener("focusin", onFocusIn);
    wrap.addEventListener("focusout", onFocusOut);
    raf = requestAnimationFrame(tick);
    return () => {
      cancelAnimationFrame(raf);
      wrap.removeEventListener("pointermove", onMove);
      wrap.removeEventListener("pointerleave", onLeave);
      wrap.removeEventListener("focusin", onFocusIn);
      wrap.removeEventListener("focusout", onFocusOut);
    };
  }, [reverse]);

  return (
    <div className="marquee" ref={wrapRef}>
      <div className="marquee-track" ref={trackRef}>
        {children}
      </div>
    </div>
  );
}
