"use client";

import { useEffect, useRef, useState } from "react";
import Image from "next/image";
import { BasisPointMark } from "@/components/BasisPointMark";
import { INTRO_PAINTINGS } from "@/content/introPaintings";

// Timings. Each painting leads for STEP_MS while the next fades in on top; the
// whole sequence never holds for less than MIN_HOLD_MS so a single painting
// still registers. If the first painting is slow to arrive the sequence starts
// anyway after FIRST_WAIT_MS, over the plain tinted ground.
const STEP_MS = 650;
const MIN_HOLD_MS = 1600;
const FIRST_WAIT_MS = 1200;
const EXIT_MS = 750;

const LAST_KEY = "bp-intro-last";

export const INTRO_DONE_EVENT = "bp:intro-done";

// Starts somewhere new each visit: random, but never the painting the last
// visit opened on.
function pickOrder(n: number): number[] {
  let start = Math.floor(Math.random() * n);
  try {
    const raw = localStorage.getItem(LAST_KEY);
    if (n > 1 && raw !== null && Number(raw) === start) {
      start = (start + 1 + Math.floor(Math.random() * (n - 1))) % n;
    }
    localStorage.setItem(LAST_KEY, String(start));
  } catch {}
  return Array.from({ length: n }, (_, i) => (start + i) % n);
}

// The overlay itself is server-rendered on every page but stays display:none
// unless the head script in layout.tsx marked this load as a first visit with
// html[data-intro="on"]. That way the badge is on screen from the first paint,
// with no flash of the page underneath while this component hydrates. The
// paintings are only mounted once the intro is confirmed, so returning readers
// never download them.
export function Intro() {
  const [order, setOrder] = useState<number[] | null>(null);
  const [shown, setShown] = useState(-1);
  const [loaded, setLoaded] = useState<Set<number>>(() => new Set());
  const [leaving, setLeaving] = useState(false);
  const beginRef = useRef<() => void>(() => {});

  useEffect(() => {
    const root = document.documentElement;
    if (root.dataset.intro !== "on") return;

    const n = INTRO_PAINTINGS.length;
    setOrder(pickOrder(n));

    const timers: number[] = [];
    let begun = false;
    let left = false;

    const finish = () => {
      delete root.dataset.intro;
      window.dispatchEvent(new Event(INTRO_DONE_EVENT));
      setOrder(null);
    };

    const leave = () => {
      if (left) return;
      left = true;
      timers.forEach(clearTimeout);
      removeSkip();
      setLeaving(true);
      timers.push(window.setTimeout(finish, EXIT_MS));
    };

    const begin = () => {
      if (begun || left) return;
      begun = true;
      for (let i = 0; i < n; i++) {
        timers.push(window.setTimeout(() => setShown(i), i * STEP_MS));
      }
      timers.push(window.setTimeout(leave, Math.max(n * STEP_MS, MIN_HOLD_MS)));
    };
    beginRef.current = begin;
    timers.push(window.setTimeout(begin, FIRST_WAIT_MS));

    // Any deliberate input skips straight to the page.
    const skipEvents = ["pointerdown", "keydown", "wheel", "touchmove"] as const;
    function removeSkip() {
      skipEvents.forEach((e) => window.removeEventListener(e, leave));
    }
    skipEvents.forEach((e) => window.addEventListener(e, leave, { passive: true }));

    return () => {
      timers.forEach(clearTimeout);
      removeSkip();
    };
  }, []);

  const onLoad = (idx: number) => {
    setLoaded((prev) => (prev.has(idx) ? prev : new Set(prev).add(idx)));
    if (order && idx === order[0]) beginRef.current();
  };

  // A painting already in the browser cache can finish loading before React
  // attaches onLoad, so the event never arrives. Catch that case on mount.
  const catchCached = (idx: number) => (img: HTMLImageElement | null) => {
    if (img?.complete && img.naturalWidth > 0) onLoad(idx);
  };

  return (
    <div className={`intro${leaving ? " is-leaving" : ""}`} aria-hidden="true">
      {order?.map((idx, i) => {
        const p = INTRO_PAINTINGS[idx];
        const visible = i <= shown && loaded.has(idx);
        return (
          <div key={p.src} className={`intro-painting${visible ? " is-shown" : ""}`}>
            <Image
              src={p.src}
              alt=""
              fill
              sizes="100vw"
              loading="eager"
              style={{ objectPosition: p.position ?? "center" }}
              onLoad={() => onLoad(idx)}
              ref={catchCached(idx)}
            />
          </div>
        );
      })}
      <div className="intro-wash" />
      <div className="intro-lockup">
        <BasisPointMark size={140} decorative />
        <span className="intro-name">The Basis Point</span>
      </div>
    </div>
  );
}
