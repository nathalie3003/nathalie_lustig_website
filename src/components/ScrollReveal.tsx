"use client";

import { useEffect, useRef, Fragment, type ElementType } from "react";

type Props = {
  children: string;
  as?: "h1" | "h2" | "h3" | "span" | "p";
  className?: string;
  /** Stagger between characters, in ms. */
  stagger?: number;
  /** "scroll" (default) reveals on viewport entry; "mount" reveals on load. */
  trigger?: "scroll" | "mount";
  /** Base delay before the first character animates, in ms. */
  delay?: number;
};

// Headline scroll-reveal: words rise from behind a horizon line.
// Each character lives inside an overflow-hidden mask, translated
// below by default and slid into place once the headline enters the
// viewport. Once only.
//
// Word boundaries are preserved as real spaces between word spans, so
// lines wrap correctly. Each word's characters share a nowrap context.
//
// Respects prefers-reduced-motion (no transform, no transition).
export function ScrollReveal({
  children,
  as = "h2",
  className,
  stagger = 25,
  trigger = "scroll",
  delay = 0,
}: Props) {
  const ref = useRef<HTMLElement | null>(null);
  const Tag = as as ElementType;

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    if (reduce) {
      el.classList.add("sr-visible");
      return;
    }
    if (trigger === "mount") {
      // Reveal on load. rAF ensures the hidden start state paints first,
      // so the transition actually animates.
      const raf = requestAnimationFrame(() => el.classList.add("sr-visible"));
      return () => cancelAnimationFrame(raf);
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
      { threshold: 0.25 },
    );
    io.observe(el);
    return () => io.disconnect();
  }, [trigger]);

  const words = children.split(" ");
  let charIdx = 0;

  return (
    <Tag
      ref={ref as unknown as React.Ref<HTMLHeadingElement>}
      className={`scroll-reveal ${className ?? ""}`.trim()}
    >
      {words.map((word, wi) => {
        const wordChars = Array.from(word);
        const node = (
          <span className="sr-word" key={`w-${wi}`} aria-hidden="true">
            {wordChars.map((ch, ci) => {
              const charDelay = delay + charIdx * stagger;
              charIdx += 1;
              return (
                <span className="sr-mask" key={ci}>
                  <span
                    className="sr-char"
                    style={{ transitionDelay: `${charDelay}ms` }}
                  >
                    {ch}
                  </span>
                </span>
              );
            })}
          </span>
        );
        return (
          <Fragment key={wi}>
            {node}
            {wi < words.length - 1 ? " " : null}
          </Fragment>
        );
      })}
      {/* Accessible plain-text fallback for screen readers. */}
      <span className="sr-sr-only">{children}</span>
    </Tag>
  );
}
