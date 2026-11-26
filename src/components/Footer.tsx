"use client";

import Link from "next/link";
import { useEffect, useRef, useState } from "react";
import { about } from "@/content/about";

const EMAIL = about.contact.find((c) => c.label === "Email")?.value ?? "";
const LINKEDIN = about.contact.find((c) => c.label === "LinkedIn");

/** Sizes the wordmark so its text exactly fills the footer column, and wipes
 *  it in once when it first scrolls into view. The CSS sets a vw-based size
 *  as the server-rendered fallback, so the measure only corrects it. */
function useFittedWordmark() {
  const boxRef = useRef<HTMLDivElement>(null);
  const textRef = useRef<HTMLSpanElement>(null);

  useEffect(() => {
    const box = boxRef.current;
    const text = textRef.current;
    if (!box || !text) return;

    const fit = () => {
      text.style.fontSize = "100px";
      const natural = text.scrollWidth;
      if (natural > 0) {
        text.style.fontSize = `${(100 * box.clientWidth) / natural}px`;
      }
    };
    fit();
    document.fonts?.ready.then(fit);
    const ro = new ResizeObserver(fit);
    ro.observe(box);

    const io = new IntersectionObserver(
      (entries) => {
        if (!entries.some((e) => e.isIntersecting)) return;
        box.classList.add("is-in");
        io.disconnect();
      },
      { threshold: 0.3 },
    );
    io.observe(box);

    return () => {
      ro.disconnect();
      io.disconnect();
    };
  }, []);

  return { boxRef, textRef };
}

export function ContactFooter() {
  const [copied, setCopied] = useState(false);
  const { boxRef, textRef } = useFittedWordmark();

  const onCopy = async () => {
    try {
      await navigator.clipboard.writeText(EMAIL);
      setCopied(true);
      window.setTimeout(() => setCopied(false), 1600);
    } catch {
      // Clipboard unavailable: fall back to opening the mail client.
      window.location.href = `mailto:${EMAIL}`;
    }
  };

  return (
    <footer className="foot" id="contact">
      <div className="foot-inner">
        <div className="foot-cols">
          <div className="foot-contact">
            <h2 className="foot-h">Get in touch</h2>
            <p className="foot-lede">
              Happy to talk bonds, books, or anything in between.
            </p>
            <button
              type="button"
              className="foot-copy"
              onClick={onCopy}
              aria-label={`Copy email address ${EMAIL}`}
            >
              <span>{copied ? "Copied to clipboard" : EMAIL}</span>
              <span className="foot-copy-cue" aria-hidden="true">
                {copied ? "✓" : "Copy"}
              </span>
            </button>
          </div>

          <nav className="foot-col" aria-label="Notes">
            <h2 className="foot-h">Notes</h2>
            <ul className="foot-list">
              <li><Link href="/notes">All notes</Link></li>
              <li><a href="/rss.xml">RSS feed</a></li>
            </ul>
          </nav>

          <nav className="foot-col" aria-label="About">
            <h2 className="foot-h">About</h2>
            <ul className="foot-list">
              <li><Link href="/about">About me</Link></li>
              <li><Link href="/about#projects">Projects</Link></li>
            </ul>
          </nav>

          <div className="foot-col">
            <h2 className="foot-h">Connect</h2>
            <ul className="foot-list">
              <li><a href={`mailto:${EMAIL}`}>Email</a></li>
              {LINKEDIN ? (
                <li>
                  <a href={LINKEDIN.href} target="_blank" rel="noopener noreferrer">
                    LinkedIn
                  </a>
                </li>
              ) : null}
            </ul>
          </div>
        </div>

        <div className="foot-mark" ref={boxRef} aria-hidden="true">
          <span className="foot-mark-text" ref={textRef}>
            The Basis Point<span className="foot-mark-dot">.</span>
          </span>
        </div>

        <div className="foot-base">
          <span>© 2026 Nathalie Lustig · Notes on the fixed income market</span>
        </div>
      </div>
    </footer>
  );
}
