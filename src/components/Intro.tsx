"use client";

import { useEffect, useState } from "react";
import { BasisPointMark } from "@/components/BasisPointMark";
import { INTRO_PAINTINGS } from "@/content/introPaintings";

// Timings, aiming at about 3.5s from first paint to the page. Every painting
// holds for the same STEP_MS, counted from when it actually arrived, so a slow
// network delays the sequence rather than skipping paintings. One that has not
// arrived within its wait is passed over, and MAX_TOTAL_MS caps the whole
// thing so a bad connection never keeps anyone waiting.
const STEP_MS = 800;
// The opening painting may already have been on screen for a while when the
// app hydrates; never cut it shorter than this, so it does not flick away.
const MIN_FIRST_MS = 300;
const FIRST_WAIT_MS = 1500;
const NEXT_WAIT_MS = 1200;
const MAX_TOTAL_MS = 4500;
const EXIT_MS = 600;
const POLL_MS = 50;

export const INTRO_DONE_EVENT = "bp:intro-done";

// The overlay is server-rendered on every page but stays display:none unless
// the head script (lib/introScript.ts) marked this load as a first visit with
// html[data-intro="on"]. By the time this component hydrates, that script has
// already picked the paintings and started downloading them, and the opening
// painting is showing as a CSS background (.intro-first). This component takes
// it from there: it layers the later paintings over the first as each one
// arrives, then lifts the cover.
export function Intro() {
  const [layers, setLayers] = useState<{ src: string; position: string }[] | null>(null);
  // Positions in the plan that have taken their turn. A painting that was
  // passed over never joins, so it can never pop in late.
  const [shown, setShown] = useState<Set<number>>(() => new Set());
  const [leaving, setLeaving] = useState(false);

  useEffect(() => {
    const root = document.documentElement;
    const plan = window.__bpIntro;
    if (root.dataset.intro !== "on" || !plan) return;

    setLayers(
      plan.urls.map((src, i) => ({
        src,
        position: INTRO_PAINTINGS[plan.order[i]]?.position ?? "center",
      })),
    );

    const timers: number[] = [];
    let left = false;
    let anyShown = false;

    const finish = () => {
      delete root.dataset.intro;
      window.dispatchEvent(new Event(INTRO_DONE_EVENT));
      setLayers(null);
    };

    const leave = () => {
      if (left) return;
      left = true;
      timers.forEach(clearTimeout);
      removeSkip();
      setLeaving(true);
      timers.push(window.setTimeout(finish, EXIT_MS));
    };

    // Load state comes from the head script's preloads. They are detached
    // Image objects, so this does not depend on the layers below rendering.
    const arrived = (i: number) => {
      const img = plan.imgs[i];
      return img.complete && img.naturalWidth > 0;
    };

    const step = (i: number, waited: number) => {
      if (left) return;
      if (i >= plan.imgs.length) return leave();
      if (arrived(i)) {
        // The first painting is the CSS background, already visible; only the
        // later ones are layered on.
        if (i > 0) setShown((prev) => new Set(prev).add(i));
        const since =
          i === 0 && window.__bpIntroT !== undefined
            ? performance.now() - window.__bpIntroT
            : 0;
        const hold = i === 0 ? Math.max(MIN_FIRST_MS, STEP_MS - since) : STEP_MS;
        anyShown = true;
        timers.push(window.setTimeout(() => step(i + 1, 0), hold));
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
      <div className="intro-first" />
      {layers?.map((p, i) =>
        i === 0 ? null : (
          // Plain img on purpose: these are pre-sized files the head script has
          // already fetched, and next/image would request different URLs and
          // download them all again.
          // eslint-disable-next-line @next/next/no-img-element
          <img
            key={p.src}
            src={p.src}
            alt=""
            className={`intro-painting${shown.has(i) ? " is-shown" : ""}`}
            style={{ objectPosition: p.position }}
          />
        ),
      )}
      <div className="intro-wash" />
      <div className="intro-lockup">
        <BasisPointMark size={140} decorative />
        <span className="intro-name">The Basis Point<span className="bp-point">.</span></span>
      </div>
    </div>
  );
}
