"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import Image from "next/image";
import { lifeShots } from "@/content/life";

const ADVANCE_MS = 4500;

export function LifeCarousel() {
  const [index, setIndex] = useState(0);
  const timer = useRef<number | null>(null);
  const [autoplay, setAutoplay] = useState(false);

  // Autoplay is off during SSR and for anyone who asked for reduced motion.
  // Deciding this after mount also keeps the server and client markup identical.
  useEffect(() => {
    setAutoplay(!window.matchMedia("(prefers-reduced-motion: reduce)").matches);
  }, []);

  const clear = useCallback(() => {
    if (timer.current !== null) {
      window.clearInterval(timer.current);
      timer.current = null;
    }
  }, []);

  useEffect(() => {
    if (!autoplay) return;
    timer.current = window.setInterval(
      () => setIndex((i) => (i + 1) % lifeShots.length),
      ADVANCE_MS,
    );
    return clear;
  }, [autoplay, clear]);

  // Any manual move restarts the clock, so the photo you just chose gets a
  // full turn rather than being replaced a moment later.
  const goTo = useCallback(
    (next: number) => {
      clear();
      setIndex(((next % lifeShots.length) + lifeShots.length) % lifeShots.length);
      if (autoplay) {
        timer.current = window.setInterval(
          () => setIndex((i) => (i + 1) % lifeShots.length),
          ADVANCE_MS,
        );
      }
    },
    [autoplay, clear],
  );

  const current = lifeShots[index];
  const counter = `${String(index + 1).padStart(2, "0")} / ${String(lifeShots.length).padStart(2, "0")}`;

  return (
    <div className="life">
      <div
        className="life-frame"
        onMouseEnter={clear}
        onMouseLeave={() => autoplay && goTo(index)}
      >
        {lifeShots.map((shot, i) => (
          <Image
            key={shot.src}
            src={shot.src}
            alt={i === index ? shot.caption : ""}
            fill
            sizes="(max-width: 940px) 100vw, 340px"
            priority={i === 0}
            // Every shot shares one frame and the set auto-advances within
            // seconds, so lazy loading would risk a blank frame while the next
            // one decodes. They are all in view and all requested anyway, so
            // eager costs nothing and makes the crossfade deterministic.
            loading={i === 0 ? undefined : "eager"}
            className="life-img"
            style={{ opacity: i === index ? 1 : 0 }}
          />
        ))}
      </div>

      <div className="life-bar">
        <div className="life-text">
          <span className="life-count">{counter}</span>
          <p className="life-caption" aria-live="polite">
            {current.caption}
          </p>
        </div>
        <div className="life-nav">
          <button
            type="button"
            className="life-btn"
            aria-label="Previous photo"
            onClick={() => goTo(index - 1)}
          >
            ←
          </button>
          <button
            type="button"
            className="life-btn"
            aria-label="Next photo"
            onClick={() => goTo(index + 1)}
          >
            →
          </button>
        </div>
      </div>

      <div className="life-dots">
        {lifeShots.map((shot, i) => (
          <button
            type="button"
            key={shot.src}
            className={`life-dot${i === index ? " is-active" : ""}`}
            aria-label={`Photo ${i + 1} of ${lifeShots.length}`}
            aria-current={i === index}
            onClick={() => goTo(i)}
          />
        ))}
      </div>
    </div>
  );
}
