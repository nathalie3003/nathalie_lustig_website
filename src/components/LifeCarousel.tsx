"use client";

import { useEffect, useRef, useState } from "react";
import Image from "next/image";
import type { LifeShot } from "@/content/life";

// Two frames side by side. Every TICK_MS one frame swaps to the next photo,
// alternating left and right, so something is always changing but never both
// at once. The new photo wipes up from the bottom while settling from a slight
// zoom, the same treatment as alfierees.com/about. Rotation stops while a
// photo is hovered or focused, while the band is off screen, and entirely for
// anyone who has asked for reduced motion.
const TICK_MS = 2400;

export function LifeCarousel({ shots }: { shots: LifeShot[] }) {
  const count = shots.length;
  // Two frames when there are enough photos to keep both moving without ever
  // showing the same one twice; otherwise one.
  const frames = count >= 3 ? 2 : 1;
  const rotates = count > frames;

  const [lit, setLit] = useState(() => [...Array(frames).keys()]);
  const [next, setNext] = useState(frames);
  const [tick, setTick] = useState(0);

  // Motion is decided after mount so server and client markup match.
  const [reduced, setReduced] = useState(true);
  const [hovering, setHovering] = useState(false);
  const [visible, setVisible] = useState(true);
  const rootRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const mq = window.matchMedia("(prefers-reduced-motion: reduce)");
    setReduced(mq.matches);
  }, []);

  // No point turning photos nobody can see.
  useEffect(() => {
    const el = rootRef.current;
    if (!el || typeof IntersectionObserver === "undefined") return;
    const io = new IntersectionObserver(([entry]) => setVisible(entry.isIntersecting));
    io.observe(el);
    return () => io.disconnect();
  }, []);

  const running = rotates && !reduced && !hovering && visible;

  useEffect(() => {
    if (!running) return;
    const id = window.setTimeout(() => {
      const slot = tick % frames;
      setLit((current) => current.map((shot, i) => (i === slot ? next : shot)));
      setNext((n) => (n + 1) % count);
      setTick((t) => t + 1);
    }, TICK_MS);
    return () => window.clearTimeout(id);
  }, [running, tick, next, frames, count]);

  if (count === 0) return null;

  return (
    <div ref={rootRef} className={`life${reduced ? " is-still" : ""}`}>
      <div className="life-pair" data-frames={frames}>
        {lit.map((cur, slot) => (
          <figure
            key={slot}
            className="life-frame"
            tabIndex={0}
            onMouseEnter={() => setHovering(true)}
            onMouseLeave={() => setHovering(false)}
            onFocus={() => setHovering(true)}
            onBlur={() => setHovering(false)}
          >
            {/* Every photo sits in every frame; only the lit one is unclipped.
                Keeps each photo loaded so a swap never waits on the network. */}
            {shots.map((shot, i) => (
              <Image
                key={shot.src}
                src={shot.src}
                alt={i === cur ? shot.caption : ""}
                aria-hidden={i === cur ? undefined : true}
                fill
                sizes="(max-width: 940px) 50vw, 200px"
                priority={i < frames}
                className="life-img"
                data-lit={i === cur}
                style={shot.position ? { objectPosition: shot.position } : undefined}
              />
            ))}
            <figcaption className="life-caption" aria-hidden="true">
              {shots[cur].caption}
            </figcaption>
          </figure>
        ))}
      </div>

      {rotates ? <p className="life-hint">Hover a photo for its caption</p> : null}
    </div>
  );
}
