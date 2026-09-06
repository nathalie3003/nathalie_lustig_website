"use client";

import { useEffect, useRef, useState } from "react";

type Item = { id: string; title: string };

// Both TOC presentations. Which one is visible is decided entirely in CSS at
// the 1320px breakpoint, so there is no viewport listener here and nothing that
// could differ between the server and client render.
export function ArticleToc({ items }: { items: Item[] }) {
  const [active, setActive] = useState(0);
  const [visible, setVisible] = useState(false);
  const [open, setOpen] = useState(false);
  const wrapRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const onScroll = () => {
      let current = 0;
      items.forEach((item, i) => {
        const el = document.getElementById(item.id);
        if (el && el.getBoundingClientRect().top < 160) current = i;
      });
      setActive(current);
      // Appear only once the reader is past the header, so the rail does not
      // compete with the title on first paint.
      setVisible(window.scrollY > 260);
    };
    window.addEventListener("scroll", onScroll, { passive: true });
    onScroll();
    return () => window.removeEventListener("scroll", onScroll);
  }, [items]);

  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") setOpen(false);
    };
    const onClick = (e: MouseEvent) => {
      if (!wrapRef.current?.contains(e.target as Node)) setOpen(false);
    };
    document.addEventListener("keydown", onKey);
    document.addEventListener("mousedown", onClick);
    return () => {
      document.removeEventListener("keydown", onKey);
      document.removeEventListener("mousedown", onClick);
    };
  }, [open]);

  if (items.length < 2) return null;

  const list = (
    <ul className="atoc-list">
      {items.map((item, i) => (
        <li key={item.id}>
          <a
            href={`#${item.id}`}
            className={i === active ? "active" : undefined}
            onClick={() => setOpen(false)}
          >
            {item.title}
          </a>
        </li>
      ))}
    </ul>
  );

  return (
    <>
      <nav
        className={`atoc-rail${visible ? " is-visible" : ""}`}
        aria-label="In this note"
      >
        <span className="atoc-label">In this note</span>
        {list}
      </nav>

      <div
        className={`atoc-bar${visible ? " is-visible" : ""}`}
        ref={wrapRef}
      >
        <button
          type="button"
          className="atoc-bar-btn"
          aria-expanded={open}
          onClick={() => setOpen((v) => !v)}
        >
          <span className="atoc-bar-label">In this note</span>
          <span className="atoc-bar-current">{items[active]?.title}</span>
          <svg width="11" height="11" viewBox="0 0 11 11" fill="none" aria-hidden="true">
            <path
              d="M2.5 4L5.5 7L8.5 4"
              stroke="currentColor"
              strokeWidth="1.4"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </svg>
        </button>
        {open && <div className="atoc-bar-panel">{list}</div>}
      </div>
    </>
  );
}
