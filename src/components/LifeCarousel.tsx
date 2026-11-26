"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
import type { LifeShot } from "@/content/life";

// Three photo frames in a row, the middle one larger. Every TICK_MS one frame
// swaps to the next photo, in the order right, left, middle, so something is
// always changing but never more than one frame at a time. The new photo
// wipes up from the bottom while settling from a slight zoom; the old one
// stays underneath until it is covered. Same approach as alfierees.com/about.
const TICK_MS = 2400;
const ORDER = [2, 0, 1];

export function LifeCarousel({ shots }: { shots: LifeShot[] }) {
  const count = shots.length;
  // Three frames need at least four photos to rotate without showing the same
  // one twice. With fewer, show what there is and keep still.
  const frames = Math.min(3, count);
  const rotates = count > frames;

  // Seed the frames so they are replaced oldest first: the frame that changes
  // first holds photo 0, the next holds photo 1, and so on. That keeps the
  // three on screen as a sliding window, never showing one photo twice.
  const [lit, setLit] = useState(() => {
    const order = frames === 3 ? ORDER : [...Array(frames).keys()];
    const seed = Array<number>(frames);
    order.forEach((slot, k) => (seed[slot] = k));
    return seed;
  });
  const [next, setNext] = useState(frames);
  const [tick, setTick] = useState(0);

  const [reduced, setReduced] = useState(true);
  const [paused, setPaused] = useState(false); // the visitor's own choice (WCAG 2.2.2)
  const [hovering, setHovering] = useState(false);

  useEffect(() => {
    const mq = window.matchMedia("(prefers-reduced-motion: reduce)");
    setReduced(mq.matches);
    setPaused(mq.matches);
  }, []);

  const running = rotates && !paused && !hovering;

  useEffect(() => {
    if (!running) return;
    const id = window.setTimeout(() => {
      const order = frames === 3 ? ORDER : [...Array(frames).keys()];
      const slot = order[tick % order.length];
      setLit((l) => l.map((v, i) => (i === slot ? next : v)));
      setNext((n) => (n + 1) % count);
      setTick((t) => t + 1);
    }, TICK_MS);
    return () => window.clearTimeout(id);
  }, [running, tick, next, frames, count]);

  if (count === 0) return null;

  return (
    <div className={`pband${reduced ? " is-still" : ""}`}>
      <div className="pband-row" data-frames={frames}>
        {lit.map((cur, slot) => (
          <figure
            key={slot}
            className="pband-slot"
            data-slot={frames === 3 ? slot : undefined}
            tabIndex={0}
            onMouseEnter={() => setHovering(true)}
            onMouseLeave={() => setHovering(false)}
            onFocus={() => setHovering(true)}
            onBlur={() => setHovering(false)}
          >
            <div className="pband-frame">
              {shots.map((shot, i) => (
                <Image
                  key={shot.src}
                  src={shot.src}
                  alt={i === cur ? shot.caption : ""}
                  aria-hidden={i === cur ? undefined : true}
                  fill
                  // One size for every frame, so each photo is a single
                  // download however many frames it appears in.
                  sizes="(max-width: 767px) 40vw, 300px"
                  priority={i < frames}
                  className="pband-layer"
                  data-lit={i === cur}
                  style={shot.position ? { objectPosition: shot.position } : undefined}
                />
              ))}
            </div>
            <figcaption className="pband-cap" aria-hidden="true">
              {shots[cur].caption}
            </figcaption>
          </figure>
        ))}
      </div>

      {rotates ? (
        <button
          type="button"
          className="pband-toggle"
          aria-pressed={paused}
          aria-label={paused ? "Play photos" : "Pause photos"}
          onClick={() => setPaused((p) => !p)}
        >
          {paused ? "Play" : "Pause"}
        </button>
      ) : null}
    </div>
  );
}
