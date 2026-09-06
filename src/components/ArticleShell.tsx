"use client";

import { useRef } from "react";
import { ReadingProgress } from "./ReadingProgress";

// Owns the ref that the progress rail (and later the TOC) measure against.
// The note page is a server component, so this boundary is where the DOM
// reference has to be created.
export function ArticleShell({
  className,
  children,
}: {
  className: string;
  children: React.ReactNode;
}) {
  const ref = useRef<HTMLDivElement>(null);
  return (
    <div className={className}>
      <ReadingProgress target={ref} />
      <div ref={ref}>{children}</div>
    </div>
  );
}
