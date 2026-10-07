"use client";

import { useEffect, useRef, useState } from "react";
import Image from "next/image";
import { BasisPointMark } from "@/components/BasisPointMark";
import { INTRO_PAINTINGS } from "@/content/introPaintings";

// Timings, aiming at about 3.5s from first paint to the page. Each visit shows
// PER_VISIT of the paintings, every one held for the same STEP_MS, so the
// opening painting gets no more time than the rest. A painting only takes its
// turn once it has actually loaded, and its hold is counted from that moment,
// so a slow network delays the sequence rather than skipping paintings. One
// that has not arrived within its wait is passed over, and MAX_TOTAL_MS caps
// the whole thing so a bad connection never keeps anyone waiting.
const PER_VISIT = 3;
const STEP_MS = 800;
const FIRST_WAIT_MS = 1000;
const NEXT_WAIT_MS = 700;
const MAX_TOTAL_MS = 4500;
const EXIT_MS = 600;
const POLL_MS = 100;

const LAST_KEY = "bp-intro-last";

export const INTRO_DONE_EVENT = "bp:intro-done";

// Starts somewhere new each visit: random, but never the painting the last
// visit opened on. Runs on in list order from there, so across visits every
// painting comes round.
function pickOrder(n: number): number[] {
  let start = Math.floor(Math.random() * n);
  try {
    const raw = localStorage.getItem(LAST_KEY);
    if (n > 1 && raw !== null && Number(raw) === start) {
      start = (start + 1 + Math.floor(Math.random() * (n - 1))) % n;
    }
    localStorage.setItem(LAST_KEY, String(start));
  } catch {}
  return Array.from({ length: Math.min(n, PER_VISIT) }, (_, i) => (start + i) % n);
}

// The overlay itself is server-rendered on every page but stays display:none
// unless the head script in layout.tsx marked this load as a first visit with
// html[data-intro="on"]. That way the badge is on screen from the first paint,
// with no flash of the page underneath while this component hydrates. The
// paintings are only mounted once the intro is confirmed, so returning readers
// never download them.
export function Intro() {
  const [order, setOrder] = useState<number[] | null>(null);
  // Positions in `order` that have taken their turn. A painting that was
  // passed over never joins, so it can never pop in late.
  const [shown, setShown] = useState<Set<number>>(() => new Set());
  const [leaving, setLeaving] = useState(false);
  const imgs = useRef<Map<number, HTMLImageElement>>(new Map());

  useEffect(() => {
    const root = document.documentElement;
    if (root.dataset.intro !== "on") return;

    const ord = pickOrder(INTRO_PAINTINGS.length);
    setOrder(ord);

    const timers: number[] = [];
    let left = false;
    let anyShown = false;

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

    const step = (i: number, waited: number) => {
      if (left) return;
      if (i >= ord.length) return leave();
      // Read the image itself rather than waiting on onLoad: a painting
      // already in the browser cache can finish before React attaches the
      // handler, and that event never arrives.
      const img = imgs.current.get(ord[i]);
      if (img?.complete && img.naturalWidth > 0) {
        setShown((prev) => new Set(prev).add(i));
        anyShown = true;
        timers.push(window.setTimeout(() => step(i + 1, 0), STEP_MS));
        return;
      }
      if (waited >= (anyShown ? NEXT_WAIT_MS : FIRST_WAIT_MS)) return step(i + 1, 0);
      timers.push(window.setTimeout(() => step(i, waited + POLL_MS), POLL_MS));
    };
    step(0, 0);
    timers.push(window.setTimeout(leave, MAX_TOTAL_MS));

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

  return (
    <div className={`intro${leaving ? " is-leaving" : ""}`} aria-hidden="true">
      {order?.map((idx, i) => {
        const p = INTRO_PAINTINGS[idx];
        return (
          <div key={p.src} className={`intro-painting${shown.has(i) ? " is-shown" : ""}`}>
            <Image
              src={p.src}
              alt=""
              fill
              sizes="100vw"
              loading="eager"
              // Under the wash the difference from the default 75 is invisible,
              // and a lighter file means the opening painting arrives sooner.
              quality={60}
              // The opening painting is the one the reader waits on, so it
              // goes first in the queue; the rest load behind it.
              fetchPriority={i === 0 ? "high" : "low"}
              style={{ objectPosition: p.position ?? "center" }}
              ref={(el) => {
                if (el) imgs.current.set(idx, el);
                else imgs.current.delete(idx);
              }}
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
