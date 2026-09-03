"use client";

import { useEffect } from "react";

// Drives two things the rail cannot do as a server component, without forcing
// RightRail itself to become a client component:
//
//  1. Once the rail's identity block has been scrolled past, the portrait
//     collapses to a small round avatar. The class goes on <html> so the CSS
//     lives entirely in the stylesheet.
//  2. A rail taller than the viewport would have its bottom permanently
//     unreachable if it stuck at a fixed offset. Setting a negative sticky top
//     in that case lets the rail's own bottom come into view as the page
//     scrolls, then hold there.
const REST_TOP = 92;
const BOTTOM_GAP = 24;

// The collapse used to fire off a fixed page offset, which only lined up with
// the rail on desktop, where it is sticky. Measuring the rail itself makes the
// same gesture work at both widths. On desktop the trigger sits just above the
// sticky rest position, so the portrait shrinks as the rail pins. On a phone
// the rail scrolls with the page, so it fires around the upper third of the
// screen, while the name card is still fully in view.
const STACKED_MAX = 920;
const TIGHT_AT_PINNED = 100;
const TIGHT_AT_STACKED = 0.42;

export function RailScroll() {
  useEffect(() => {
    const rail = document.querySelector<HTMLElement>(".home-rail");
    if (!rail) return;

    let tight: boolean | null = null;

    const measure = () => {
      const top = Math.min(REST_TOP, window.innerHeight - rail.offsetHeight - BOTTOM_GAP);
      rail.style.setProperty("--rail-top", `${top}px`);
    };

    const threshold = () =>
      window.innerWidth <= STACKED_MAX
        ? window.innerHeight * TIGHT_AT_STACKED
        : TIGHT_AT_PINNED;

    const onScroll = () => {
      const next = rail.getBoundingClientRect().top <= threshold();
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
    window.addEventListener("resize", onScroll);

    const ro = typeof ResizeObserver !== "undefined" ? new ResizeObserver(measure) : null;
    ro?.observe(rail);

    return () => {
      window.removeEventListener("scroll", onScroll);
      window.removeEventListener("resize", measure);
      window.removeEventListener("resize", onScroll);
      ro?.disconnect();
      document.documentElement.classList.remove("rail-tight");
    };
  }, []);

  return null;
}
