"use client";

import { useEffect, useRef, useState, type ReactNode } from "react";

// Idle drift speed (px/s).
const IDLE_SPEED = 38;
// Fastest a flick can send the strip (px/s).
const MAX_FLING = 2400;
// How quickly a flick eases back into the idle drift; lower glides longer.
const GLIDE = 2.2;
// Movement (px) before a press counts as a drag rather than a click.
const DRAG_THRESHOLD = 6;

// Drives the marquee with requestAnimationFrame so it can be grabbed. It
// drifts on its own; it can be dragged with the mouse, swiped on a touch
// screen, or swiped sideways on a trackpad. Letting go flings it with the
// release speed, which then eases back into the drift. A drag never triggers
// the link underneath it. Keyboard focus inside holds it still so a focused
// link stays put. A Pause button stops it outright (WCAG 2.2.2). With
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
  const pausedRef = useRef(false);
  const [paused, setPaused] = useState(false);

  useEffect(() => {
    const wrap = wrapRef.current;
    const track = trackRef.current;
    if (!wrap || !track) return;
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;

    // Positive speed moves the content right, negative moves it left.
    const idle = reverse ? IDLE_SPEED : -IDLE_SPEED;
    let speed = idle;
    let target = idle;
    let x = 0;
    let last = performance.now();
    let raf = 0;

    let dragging = false;
    let pointerId = -1;
    let lastX = 0;
    let lastT = 0;
    let velocity = 0;
    let moved = 0;

    const render = () => {
      // The track holds the list twice; wrap within one copy's width.
      const loop = track.scrollWidth / 2;
      if (loop <= 0) return;
      x %= loop;
      if (x > 0) x -= loop;
      track.style.transform = `translate3d(${x}px, 0, 0)`;
    };

    const onDown = (e: PointerEvent) => {
      if (e.pointerType === "mouse" && e.button !== 0) return;
      dragging = true;
      pointerId = e.pointerId;
      lastX = e.clientX;
      lastT = e.timeStamp;
      velocity = 0;
      moved = 0;
      wrap.classList.add("is-dragging");
    };
    const onMove = (e: PointerEvent) => {
      if (!dragging || e.pointerId !== pointerId) return;
      const dx = e.clientX - lastX;
      const dt = Math.max(1, e.timeStamp - lastT) / 1000;
      x += dx;
      moved += Math.abs(dx);
      // Smooth the release speed over the last few moves.
      velocity = velocity * 0.6 + (dx / dt) * 0.4;
      lastX = e.clientX;
      lastT = e.timeStamp;
      render();
    };
    const onUp = (e: PointerEvent) => {
      if (!dragging || e.pointerId !== pointerId) return;
      dragging = false;
      wrap.classList.remove("is-dragging");
      // A pause before letting go means no fling.
      const still = e.timeStamp - lastT > 80;
      speed = still ? 0 : Math.max(-MAX_FLING, Math.min(MAX_FLING, velocity));
    };
    // Swallow the click that ends a drag so it does not open a link.
    const onClick = (e: MouseEvent) => {
      if (moved > DRAG_THRESHOLD) {
        e.preventDefault();
        e.stopPropagation();
        moved = 0;
      }
    };
    // Sideways trackpad swipes move the strip; vertical scrolling is left alone.
    const onWheel = (e: WheelEvent) => {
      if (Math.abs(e.deltaX) <= Math.abs(e.deltaY)) return;
      e.preventDefault();
      x -= e.deltaX;
      speed = 0;
      render();
    };
    // Only keyboard focus holds it; a mouse press on a link focuses it too.
    const onFocusIn = (e: FocusEvent) => {
      if ((e.target as Element).matches?.(":focus-visible")) target = 0;
    };
    const onFocusOut = (e: FocusEvent) => {
      if (!wrap.contains(e.relatedTarget as Node | null)) target = idle;
    };
    // The Pause button flips pausedRef; the loop reads it every frame.
    const aim = () => (pausedRef.current ? 0 : target);

    const tick = (now: number) => {
      // Cap the step so returning to a background tab does not jump.
      const dt = Math.min(0.05, (now - last) / 1000);
      last = now;
      if (!dragging) {
        speed += (aim() - speed) * Math.min(1, dt * GLIDE);
        x += speed * dt;
        render();
      }
      raf = requestAnimationFrame(tick);
    };

    wrap.addEventListener("pointerdown", onDown);
    window.addEventListener("pointermove", onMove);
    window.addEventListener("pointerup", onUp);
    window.addEventListener("pointercancel", onUp);
    wrap.addEventListener("click", onClick, true);
    wrap.addEventListener("wheel", onWheel, { passive: false });
    wrap.addEventListener("focusin", onFocusIn);
    wrap.addEventListener("focusout", onFocusOut);
    raf = requestAnimationFrame(tick);
    return () => {
      cancelAnimationFrame(raf);
      wrap.removeEventListener("pointerdown", onDown);
      window.removeEventListener("pointermove", onMove);
      window.removeEventListener("pointerup", onUp);
      window.removeEventListener("pointercancel", onUp);
      wrap.removeEventListener("click", onClick, true);
      wrap.removeEventListener("wheel", onWheel);
      wrap.removeEventListener("focusin", onFocusIn);
      wrap.removeEventListener("focusout", onFocusOut);
    };
  }, [reverse]);

  return (
    <>
      <button
        type="button"
        className="marquee-pause"
        aria-pressed={paused}
        onClick={() => {
          pausedRef.current = !paused;
          setPaused(!paused);
        }}
      >
        {paused ? "Play" : "Pause"}
      </button>
      <div className="marquee" ref={wrapRef}>
        <div className="marquee-track" ref={trackRef}>
          {children}
        </div>
      </div>
    </>
  );
}
