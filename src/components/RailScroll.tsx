"use client";

import { useEffect } from "react";

// Drives two things the rail cannot do as a server component, without forcing
// RightRail itself to become a client component:
//
//  1. Past the hero, the portrait collapses to a small round avatar. The class
//     goes on <html> so the CSS lives entirely in the stylesheet.
//  2. A rail taller than the viewport would have its bottom permanently
//     unreachable if it stuck at a fixed offset. Setting a negative sticky top
//     in that case lets the rail's own bottom come into view as the page
//     scrolls, then hold there.
const TIGHT_AFTER = 520;
const REST_TOP = 92;
const BOTTOM_GAP = 24;

export function RailScroll() {
  useEffect(() => {
    const rail = document.querySelector<HTMLElement>(".home-rail");
    if (!rail) return;

    let tight: boolean | null = null;

    const measure = () => {
      const top = Math.min(REST_TOP, window.innerHeight - rail.offsetHeight - BOTTOM_GAP);
      rail.style.setProperty("--rail-top", `${top}px`);
    };

    const onScroll = () => {
      const next = window.scrollY > TIGHT_AFTER;
      if (next !== tight) {
        tight = next;
        document.documentElement.classList.toggle("rail-tight", next);
        // The portrait's width transition changes the rail's height, so the
        // sticky offset has to be recomputed once the transition settles.
        window.setTimeout(measure, 340);
      }
    };

    measure();
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    window.addEventListener("resize", measure);

    const ro = typeof ResizeObserver !== "undefined" ? new ResizeObserver(measure) : null;
    ro?.observe(rail);

    return () => {
      window.removeEventListener("scroll", onScroll);
      window.removeEventListener("resize", measure);
      ro?.disconnect();
      document.documentElement.classList.remove("rail-tight");
    };
  }, []);

  return null;
}
