"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { CATEGORIES } from "@/lib/noteCat";

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
  const mobileRef = useRef<HTMLDivElement>(null);
  const closeTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const pathname = usePathname();
  const router = useRouter();
  const onHome = pathname === "/";

  const openNotes = () => {
    if (closeTimer.current) {
      clearTimeout(closeTimer.current);
      closeTimer.current = null;
    }
    setNotesOpen(true);
  };
  const scheduleCloseNotes = () => {
    if (closeTimer.current) clearTimeout(closeTimer.current);
    closeTimer.current = setTimeout(() => setNotesOpen(false), 140);
  };

  useEffect(() => {
    function onDoc(e: MouseEvent) {
      if (notesRef.current && !notesRef.current.contains(e.target as Node)) {
        setNotesOpen(false);
      }
      if (mobileRef.current && !mobileRef.current.contains(e.target as Node)) {
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
      if (closeTimer.current) clearTimeout(closeTimer.current);
    };
  }, []);

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
        <div className="top-left">
          <Link href="/#top" className="top-name" onClick={jump("top")}>
            NL
          </Link>

          <nav className="top-links">
            <div
              className="notes-menu"
              ref={notesRef}
              onMouseEnter={openNotes}
              onMouseLeave={scheduleCloseNotes}
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
                  onMouseEnter={openNotes}
                  onMouseLeave={scheduleCloseNotes}
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

            <Link href="/#about" className="top-link" onClick={jump("about")}>
              About
            </Link>
            <Link href="/#projects" className="top-link" onClick={jump("projects")}>
              Projects
            </Link>
          </nav>
        </div>

        <div className="top-right">
          <Link
            href="/#contact"
            className="l-btn l-btn-primary l-btn-sm cv-btn"
            onClick={jump("contact")}
          >
            Let&apos;s talk more →
          </Link>

          <div className="mobile-menu" ref={mobileRef}>
            <button
              className="menu-btn"
              aria-expanded={mobileOpen}
              aria-label="Menu"
              onClick={() => setMobileOpen((o) => !o)}
            >
              <span className="bars"><i></i><i></i><i></i></span>
            </button>
            {mobileOpen && (
              <div className="menu-pop" role="menu">
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
                <Link href="/#about" className="menu-row" onClick={jump("about")}>
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
        </div>
      </div>
    </header>
  );
}
