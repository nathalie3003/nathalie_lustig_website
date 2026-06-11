"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { menu, cvLabel } from "@/content/tone";

const CATEGORIES = [
  { name: "Rates", sub: "Curves & central banks" },
  { name: "Credit", sub: "Spreads & new issues" },
  { name: "Sovereigns", sub: "Issuance & restructuring" },
];

function scrollToId(id: string) {
  const el = document.getElementById(id);
  if (!el) {
    window.scrollTo({ top: 0, behavior: "smooth" });
    return;
  }
  const top = el.getBoundingClientRect().top + window.scrollY - 70;
  window.scrollTo({ top: Math.max(0, top), behavior: "smooth" });
}

export function TopBar() {
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);
  const pathname = usePathname();
  const router = useRouter();
  const onHome = pathname === "/";

  useEffect(() => {
    function onDoc(e: MouseEvent) {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
    }
    function onKey(e: KeyboardEvent) {
      if (e.key === "Escape") setOpen(false);
    }
    document.addEventListener("mousedown", onDoc);
    document.addEventListener("keydown", onKey);
    return () => {
      document.removeEventListener("mousedown", onDoc);
      document.removeEventListener("keydown", onKey);
    };
  }, []);

  // Section jump: smooth-scroll on home, else route to home with the hash.
  const jump = (id: string) => (e: React.MouseEvent) => {
    setOpen(false);
    e.preventDefault();
    if (onHome) {
      scrollToId(id);
      history.replaceState(null, "", id === "top" ? "/" : `/#${id}`);
    } else {
      router.push(id === "top" ? "/" : `/#${id}`);
    }
  };

  return (
    <header className="top">
      <div className="top-inner" ref={ref}>
        <Link href="/#top" className="top-name" onClick={jump("top")}>
          Nathalie Lustig
        </Link>
        <div className="top-right">
          <nav className="top-links">
            <Link href="/#notes" className="top-link" onClick={jump("notes")}>Notes</Link>
            <Link href="/#about" className="top-link" onClick={jump("about")}>About</Link>
            <Link href="/#projects" className="top-link" onClick={jump("projects")}>Projects</Link>
          </nav>
          <button
            className="menu-btn"
            aria-expanded={open}
            aria-label="Menu"
            onClick={() => setOpen((o) => !o)}
          >
            <span className="bars"><i></i><i></i><i></i></span>
            Menu
          </button>
          <Link href="/cv" className="l-btn l-btn-primary l-btn-sm">
            {cvLabel}
          </Link>

          {open && (
            <div className="menu-pop" role="menu">
              <Link href="/#notes" className="menu-row" onClick={jump("notes")}>
                <span className="mr-title">Notes</span>
                <span className="mr-sub">{menu.notes}</span>
              </Link>
              <div className="menu-cats">
                {CATEGORIES.map((c) => (
                  <Link
                    href="/#notes"
                    className="menu-cat"
                    key={c.name}
                    onClick={jump("notes")}
                  >
                    <span>{c.name}</span>
                    <span className="mc-sub">{c.sub}</span>
                  </Link>
                ))}
              </div>
              <div className="menu-rule"></div>
              <Link href="/#about" className="menu-row" onClick={jump("about")}>
                <span className="mr-title">About</span>
                <span className="mr-sub">{menu.about}</span>
              </Link>
              <Link href="/#projects" className="menu-row" onClick={jump("projects")}>
                <span className="mr-title">Projects</span>
                <span className="mr-sub">{menu.projects}</span>
              </Link>
            </div>
          )}
        </div>
      </div>
    </header>
  );
}
