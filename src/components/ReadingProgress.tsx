"use client";

import { useEffect, useState } from "react";

// Fixed 2px bar at the very top that fills as the reader scrolls the article.
export function ReadingProgress() {
  const [pct, setPct] = useState(0);

  useEffect(() => {
    const update = () => {
      const scrollable =
        document.documentElement.scrollHeight - window.innerHeight;
      setPct(scrollable > 0 ? Math.min((window.scrollY / scrollable) * 100, 100) : 0);
    };
    update();
    window.addEventListener("scroll", update, { passive: true });
    window.addEventListener("resize", update);
    return () => {
      window.removeEventListener("scroll", update);
      window.removeEventListener("resize", update);
    };
  }, []);

  return (
    <div
      className="reading-progress"
      style={{ transform: `scaleX(${pct / 100})` }}
      aria-hidden="true"
    />
  );
}
