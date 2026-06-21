"use client";

import { useEffect, useRef } from "react";

type Props = {
  children: string;
  as?: "h1" | "h2" | "h3";
  className?: string;
  /** Stagger between characters, ms. Lower = faster overall. */
  stagger?: number;
};

// Splits text into per-character spans and fades them in on viewport entry.
// Headlines settle into place rather than appear all at once.
// Respects prefers-reduced-motion (no transforms, no transition).
export function ScrollReveal({
  children,
  as = "h2",
  className,
  stagger = 18,
}: Props) {
  const ref = useRef<HTMLHeadingElement>(null);
  const Tag = as;

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    if (reduce) {
      el.classList.add("sr-visible");
      return;
    }
    const io = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            el.classList.add("sr-visible");
            io.disconnect();
          }
        });
      },
      { threshold: 0.2 },
    );
    io.observe(el);
    return () => io.disconnect();
  }, []);

  // Preserve spaces but make them non-animating no-op spans so the layout
  // still wraps naturally.
  const chars = Array.from(children);

  return (
    <Tag ref={ref} className={`scroll-reveal ${className ?? ""}`.trim()}>
      {chars.map((ch, i) => (
        <span
          key={i}
          className="sr-char"
          style={{ transitionDelay: `${i * stagger}ms` }}
          aria-hidden={ch === " "}
        >
          {ch === " " ? " " : ch}
        </span>
      ))}
      <span className="sr-sr-only">{children}</span>
    </Tag>
  );
}
