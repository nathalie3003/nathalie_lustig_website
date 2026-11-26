"use client";

import { useEffect, useRef, useState } from "react";
import Image from "next/image";
import type { LifeShot } from "@/content/life";

// One frame changes per tick, alternating left and right, so each photo stays
// up for two ticks and the pair never swaps at once.
const TICK_MS = 4200;

type Rotation = {
  slots: number[]; // shot index currently shown in each frame
  prev: (number | null)[]; // shot each frame is fading away from
  next: number; // next shot to bring in
  turn: number; // which frame changes on the next tick
};

function start(count: number, frames: number): Rotation {
  return {
    slots: Array.from({ length: frames }, (_, i) => i),
    prev: Array.from({ length: frames }, () => null),
    next: frames % Math.max(count, 1),
    turn: 0,
  };
}

function advance(r: Rotation, count: number, frames: number): Rotation {
  const slots = [...r.slots];
  const prev = r.prev.map(() => null as number | null);
  prev[r.turn] = slots[r.turn];
  slots[r.turn] = r.next;
  return { slots, prev, next: (r.next + 1) % count, turn: (r.turn + 1) % frames };
}

export function LifeCarousel({ shots }: { shots: LifeShot[] }) {
  const count = shots.length;
  // Two frames when there are enough photos to keep both moving; otherwise
  // one, so a short list never shows the same photo twice.
  const frames = count >= 3 ? 2 : 1;
  const rotates = count > frames;

  const [rotation, setRotation] = useState(() => start(count, frames));
  // Motion is decided after mount so server and client markup match, and so
  // anyone who asked for reduced motion starts paused with a Play button.
  const [reduced, setReduced] = useState(true);
  const [paused, setPaused] = useState(false); // the visitor's own choice
  const [hovering, setHovering] = useState(false);
  const [visible, setVisible] = useState(true);
  const rootRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const mq = window.matchMedia("(prefers-reduced-motion: reduce)");
    setReduced(mq.matches);
    setPaused(mq.matches);
  }, []);

  // No point turning photos nobody can see.
  useEffect(() => {
    const el = rootRef.current;
    if (!el || typeof IntersectionObserver === "undefined") return;
    const io = new IntersectionObserver(([e]) => setVisible(e.isIntersecting));
    io.observe(el);
    return () => io.disconnect();
  }, []);

  const running = rotates && !paused && !hovering && visible;

  useEffect(() => {
    if (!running) return;
    const id = window.setInterval(
      () => setRotation((r) => advance(r, count, frames)),
      TICK_MS,
    );
    return () => window.clearInterval(id);
  }, [running, count, frames]);

  if (count === 0) return null;

  return (
    <div
      ref={rootRef}
      className={`life${reduced ? " is-still" : ""}`}
      onMouseEnter={() => setHovering(true)}
      onMouseLeave={() => setHovering(false)}
      onFocus={() => setHovering(true)}
      onBlur={(e) => {
        if (!e.currentTarget.contains(e.relatedTarget as Node)) setHovering(false);
      }}
    >
      <div className="life-pair" data-frames={frames}>
        {rotation.slots.map((cur, f) => {
          // Render only what this frame needs: the photo leaving, the photo
          // showing, and the one coming next (so it has loaded by its turn).
          const upcoming = rotates
            ? f === rotation.turn
              ? rotation.next
              : (rotation.next + 1) % count
            : null;
          const layers = [rotation.prev[f], cur, upcoming].filter(
            (v, i, a): v is number => v !== null && a.indexOf(v) === i,
          );
          return (
            <figure key={f} className="life-frame" tabIndex={0}>
              {layers.map((i) => {
                const shot = shots[i];
                const state =
                  i === cur ? "is-on" : i === rotation.prev[f] ? "is-off" : "is-next";
                return (
                  <Image
                    key={shot.src}
                    src={shot.src}
                    alt={i === cur ? shot.caption : ""}
                    aria-hidden={i === cur ? undefined : true}
                    fill
                    sizes="(max-width: 940px) 50vw, 200px"
                    priority={f === 0 && i === cur}
                    loading="eager"
                    className={`life-img ${state}`}
                    style={shot.position ? { objectPosition: shot.position } : undefined}
                  />
                );
              })}
              <figcaption className="life-caption" aria-hidden="true">
                {/* Keyed so the caption rises with the photo it belongs to. */}
                <span key={shots[cur].src}>{shots[cur].caption}</span>
              </figcaption>
            </figure>
          );
        })}
      </div>

      {rotates ? (
        <div className="life-bar">
          <span className="life-hint">Hover a photo for its caption</span>
          <button
            type="button"
            className="life-toggle"
            aria-pressed={paused}
            onClick={() => setPaused((p) => !p)}
          >
            <svg width="9" height="9" viewBox="0 0 12 12" aria-hidden="true">
              {paused ? (
                <path d="M3 1.5v9l7-4.5z" fill="currentColor" />
              ) : (
                <path d="M3 1.5h2v9H3zM7 1.5h2v9H7z" fill="currentColor" />
              )}
            </svg>
            {paused ? "Play" : "Pause"}
          </button>
        </div>
      ) : null}
    </div>
  );
}
