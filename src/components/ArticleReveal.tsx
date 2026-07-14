"use client";

import { useEffect, useState, type ReactNode } from "react";

// Wraps a note's content and drives the article-open choreography. Renders a
// display:contents element (no layout box — verified safe: no direct-child
// selectors exist on the article roots), toggling `is-ready` on mount to
// trigger the staggered CSS transitions in globals.css. `resetKey` (the note
// slug) re-runs the reveal when navigating between notes, since App Router may
// reconcile rather than remount the [slug] page.
export function ArticleReveal({
  children,
  resetKey,
}: {
  children: ReactNode;
  resetKey?: string;
}) {
  const [ready, setReady] = useState(false);
  useEffect(() => {
    setReady(false);
    const raf = requestAnimationFrame(() => setReady(true));
    return () => cancelAnimationFrame(raf);
  }, [resetKey]);
  return (
    <div className={`article-reveal${ready ? " is-ready" : ""}`}>{children}</div>
  );
}
