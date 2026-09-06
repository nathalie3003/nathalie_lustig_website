"use client";

import { useEffect, useState, type RefObject } from "react";

// A 2px rail pinned to the bottom edge of the sticky nav, filling as the reader
// moves through the article. It measures the article element rather than the
// document, so replies and the keep-reading cards do not count as unread prose
// and the bar actually reaches full at the last line.
export function ReadingProgress({
  target,
}: {
  target: RefObject<HTMLElement | null>;
}) {
  const [pct, setPct] = useState(0);

  useEffect(() => {
    const update = () => {
      const el = target.current;
      if (!el) return;
      const navH = parseFloat(
        getComputedStyle(document.documentElement).getPropertyValue("--nav-h"),
      ) || 70;
      const top = el.getBoundingClientRect().top + window.scrollY;
      // Read from the article clearing the nav to its last line clearing the
      // bottom of the viewport.
      const span = el.offsetHeight - (window.innerHeight - navH);
      if (span <= 0) {
        setPct(100);
        return;
      }
      const travelled = window.scrollY + navH - top;
      setPct(Math.max(0, Math.min((travelled / span) * 100, 100)));
    };
    update();
    window.addEventListener("scroll", update, { passive: true });
    window.addEventListener("resize", update);
    return () => {
      window.removeEventListener("scroll", update);
      window.removeEventListener("resize", update);
    };
  }, [target]);

  return (
    <div
      className="reading-progress"
      style={{ transform: `scaleX(${pct / 100})` }}
      aria-hidden="true"
    />
  );
}
