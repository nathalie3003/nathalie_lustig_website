"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { CATEGORIES } from "@/lib/noteCat";
import { BasisPointMark } from "@/components/BasisPointMark";

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
  const [notesOpen, setNotesOpen] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const notesRef = useRef<HTMLDivElement>(null);
  const mobileBtnRef = useRef<HTMLDivElement>(null);
  const mobilePanelRef = useRef<HTMLDivElement>(null);
  const pathname = usePathname();
  const router = useRouter();
  const onHome = pathname === "/";

  const [wordmarkPhase, setWordmarkPhase] = useState<"" | "wm-animate" | "wm-instant">("");

  useEffect(() => {
    const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    let seen = false;
    try {
      seen = sessionStorage.getItem("bp-wordmark-seen") === "1";
    } catch {}
    setWordmarkPhase(reduce || seen ? "wm-instant" : "wm-animate");
    try {
      sessionStorage.setItem("bp-wordmark-seen", "1");
    } catch {}
  }, []);

  useEffect(() => {
    function onDoc(e: MouseEvent) {
      if (notesRef.current && !notesRef.current.contains(e.target as Node)) {
        setNotesOpen(false);
      }
      const target = e.target as Node;
      const inBtn = mobileBtnRef.current?.contains(target);
      const inPanel = mobilePanelRef.current?.contains(target);
      if (!inBtn && !inPanel) {
        setMobileOpen(false);
      }
    }
    function onKey(e: KeyboardEvent) {
      if (e.key === "Escape") {
        setNotesOpen(false);
        setMobileOpen(false);
      }
    }
    document.addEventListener("mousedown", onDoc);
    document.addEventListener("keydown", onKey);
    return () => {
      document.removeEventListener("mousedown", onDoc);
      document.removeEventListener("keydown", onKey);
    };
  }, []);

  useEffect(() => {
    setNotesOpen(false);
    setMobileOpen(false);
  }, [pathname]);

  // Section jump for About/Projects: smooth-scroll on home, route otherwise.
  const jump = (id: string) => (e: React.MouseEvent) => {
    setMobileOpen(false);
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
      <div className="top-inner">
        <Link
          href="/#top"
          className={`top-name top-name-mark ${wordmarkPhase}`.trim()}
          onClick={jump("top")}
          aria-label="The Basis Point — home"
        >
          <BasisPointMark size={30} decorative />
          <span className="top-name-word">The Basis Point</span>
        </Link>

        <nav className="top-links">
          <div
            className="notes-menu"
            ref={notesRef}
            onMouseEnter={() => setNotesOpen(true)}
            onMouseLeave={() => setNotesOpen(false)}
          >
            <Link
              href="/notes"
              className="top-link notes-trigger"
              aria-expanded={notesOpen}
              aria-haspopup="true"
              onClick={() => setNotesOpen(false)}
            >
              Notes <span className="notes-caret" aria-hidden="true">▾</span>
            </Link>
            {notesOpen && (
              <div
                className="notes-pop"
                role="menu"
              >
                <Link
                  href="/notes"
                  className="np-row np-all"
                  onClick={() => setNotesOpen(false)}
                >
                  <span className="np-title">All notes</span>
                  <span className="np-sub">Every post, newest first</span>
                </Link>
                <div className="np-rule" />
                {CATEGORIES.map((c) => (
                  <Link
                    key={c.slug}
                    href={`/notes?category=${c.slug}`}
                    className="np-row"
                    onClick={() => setNotesOpen(false)}
                  >
                    <span className="np-title">{c.label}</span>
                    <span className="np-sub">{c.blurb}</span>
                  </Link>
                ))}
              </div>
            )}
          </div>

          <Link href="/about" className="top-link">
            About
          </Link>
          <Link href="/#projects" className="top-link" onClick={jump("projects")}>
            Projects
          </Link>
        </nav>

        <div className="top-right">
          <Link
            href="/#contact"
            className="l-btn l-btn-outline l-btn-sm cv-btn"
            onClick={jump("contact")}
          >
            Get in touch
          </Link>

          <div className="mobile-menu" ref={mobileBtnRef}>
            <button
              className="menu-btn"
              aria-expanded={mobileOpen}
              aria-label="Menu"
              onClick={() => setMobileOpen((o) => !o)}
            >
              <span className="bars"><i></i><i></i><i></i></span>
            </button>
          </div>
        </div>
        {mobileOpen && (
          <div className="menu-pop" role="menu" ref={mobilePanelRef}>
            <Link
              href="/notes"
              className="menu-row"
              onClick={() => setMobileOpen(false)}
            >
              <span className="mr-title">Notes</span>
            </Link>
            <div className="menu-cats">
              {CATEGORIES.map((c) => (
                <Link
                  key={c.slug}
                  href={`/notes?category=${c.slug}`}
                  className="menu-cat"
                  onClick={() => setMobileOpen(false)}
                >
                  <span>{c.label}</span>
                </Link>
              ))}
            </div>
            <Link href="/about" className="menu-row" onClick={() => setMobileOpen(false)}>
              <span className="mr-title">About</span>
            </Link>
            <Link href="/#projects" className="menu-row" onClick={jump("projects")}>
              <span className="mr-title">Projects</span>
            </Link>
            <div className="menu-rule" />
            <Link href="/#contact" className="menu-row" onClick={jump("contact")}>
              <span className="mr-title">Let&apos;s talk more →</span>
            </Link>
          </div>
        )}
      </div>
    </header>
  );
}
