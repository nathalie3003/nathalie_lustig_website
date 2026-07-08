"use client";

import { useEffect, useState } from "react";

export function TradeToc({
  items,
}: {
  items: { id: string; title: string }[];
}) {
  const [active, setActive] = useState(0);

  useEffect(() => {
    const onScroll = () => {
      let current = 0;
      items.forEach((item, i) => {
        const el = document.getElementById(item.id);
        if (el && el.getBoundingClientRect().top < 160) current = i;
      });
      setActive(current);
    };
    window.addEventListener("scroll", onScroll, { passive: true });
    onScroll();
    return () => window.removeEventListener("scroll", onScroll);
  }, [items]);

  if (items.length < 2) return null;

  return (
    <nav className="toc" aria-label="In this note">
      <span className="toc-label">In this note</span>
      <ul className="toc-list">
        {items.map((item, i) => (
          <li key={item.id}>
            <a href={`#${item.id}`} className={i === active ? "active" : undefined}>
              {item.title}
            </a>
          </li>
        ))}
      </ul>
    </nav>
  );
}
