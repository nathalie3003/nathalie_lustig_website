"use client";

import { useEffect, useId, useRef, useState } from "react";

// A glossed term. The word itself carries no colour: colouring every matched
// term would scatter the accent through body copy and cost it its meaning, so
// the affordance is a dotted underline and the raspberry lives in the popover.
export function GlossaryTerm({
  term,
  definition,
  moreHref,
  children,
}: {
  term: string;
  definition: string;
  moreHref?: string;
  children: React.ReactNode;
}) {
  const [open, setOpen] = useState(false);
  const id = useId();
  const wrapRef = useRef<HTMLSpanElement>(null);
  const timer = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") setOpen(false);
    };
    const onDown = (e: MouseEvent) => {
      if (!wrapRef.current?.contains(e.target as Node)) setOpen(false);
    };
    document.addEventListener("keydown", onKey);
    document.addEventListener("mousedown", onDown);
    return () => {
      document.removeEventListener("keydown", onKey);
      document.removeEventListener("mousedown", onDown);
    };
  }, [open]);

  useEffect(() => () => { if (timer.current) clearTimeout(timer.current); }, []);

  const hoverOpen = () => {
    if (!window.matchMedia("(hover: hover)").matches) return;
    timer.current = setTimeout(() => setOpen(true), 120);
  };
  const hoverClose = () => {
    if (timer.current) clearTimeout(timer.current);
    if (!window.matchMedia("(hover: hover)").matches) return;
    setOpen(false);
  };

  return (
    <span className="gloss" ref={wrapRef}>
      <button
        type="button"
        className="gloss-term"
        aria-expanded={open}
        aria-describedby={open ? id : undefined}
        onClick={() => setOpen((v) => !v)}
        onFocus={() => setOpen(true)}
        onMouseEnter={hoverOpen}
        onMouseLeave={hoverClose}
      >
        {children}
      </button>
      {open && (
        <span className="gloss-pop" id={id} role="tooltip">
          <span className="gloss-pop-term">{term}</span>
          <span className="gloss-pop-def">{definition}</span>
          {moreHref && (
            <a className="gloss-pop-more" href={moreHref} target="_blank" rel="noopener noreferrer">
              Read more
            </a>
          )}
        </span>
      )}
    </span>
  );
}
