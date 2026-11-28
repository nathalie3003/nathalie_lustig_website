"use client";

import Link from "next/link";
import { useEffect, useRef, useState } from "react";
import { about } from "@/content/about";

const EMAIL = about.contact.find((c) => c.label === "Email")?.value ?? "";
const LINKEDIN = about.contact.find((c) => c.label === "LinkedIn");
const SUGGEST_HREF = `mailto:${EMAIL}?subject=${encodeURIComponent("Topic suggestion")}`;

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

/** The wordmark's full stop arrives as a splash of ink: it lands, throws a
 *  few droplets, then the droplets are drawn back in and the splash settles
 *  into the round raspberry point. A goo filter keeps the merge liquid. */
const SPLAT_BODY =
  "M69.0 50.0C69.1 52.2 72.9 54.8 72.6 56.6C72.3 58.5 67.8 58.5 67.2 61.1C66.6 63.6 70.3 70.4 69.0 72.0C67.7 73.6 62.1 70.7 59.4 70.6C56.7 70.5 55.1 71.5 53.1 71.4C51.0 71.4 49.2 70.6 47.1 70.4C45.0 70.3 42.5 71.2 40.5 70.7C38.5 70.2 37.5 68.1 35.1 67.2C32.7 66.3 27.4 67.1 26.3 65.3C25.2 63.4 28.2 58.9 28.5 56.3C28.7 53.8 27.9 52.1 27.8 50.0C27.7 47.9 27.0 45.3 27.9 43.5C28.7 41.7 31.6 40.6 33.0 39.1C34.4 37.5 35.9 37.7 36.3 34.2C36.7 30.8 33.7 19.3 35.5 18.2C37.2 17.1 43.9 25.6 46.8 27.7C49.7 29.9 50.7 30.6 52.7 30.9C54.8 31.2 56.9 29.8 59.3 29.6C61.8 29.4 65.7 28.6 67.5 29.8C69.2 31.1 69.1 35.0 69.9 37.2C70.6 39.5 72.2 41.4 72.1 43.5C72.0 45.6 68.9 47.8 69.0 50.0Z";
const SPLAT_DROPS = [
  { cx: 84, cy: 34, r: 5 },
  { cx: 92, cy: 54, r: 3.2 },
  { cx: 78, cy: 78, r: 4 },
  { cx: 22, cy: 22, r: 3.6 },
  { cx: 11, cy: 58, r: 4.4 },
  { cx: 56, cy: 9, r: 3 },
];

function InkPoint() {
  return (
    <svg className="foot-mark-dot" viewBox="0 0 100 100" aria-hidden="true">
      <defs>
        <filter id="ink-goo" x="-50%" y="-50%" width="200%" height="200%">
          <feGaussianBlur in="SourceGraphic" stdDeviation="2.6" />
          <feColorMatrix values="1 0 0 0 0  0 1 0 0 0  0 0 1 0 0  0 0 0 22 -9" />
        </filter>
      </defs>
      <g filter="url(#ink-goo)">
        <path className="ink-body" d={SPLAT_BODY} />
        {SPLAT_DROPS.map((d, i) => (
          <circle
            key={i}
            className="ink-drop"
            cx={d.cx}
            cy={d.cy}
            r={d.r}
            style={
              {
                "--dx": `${50 - d.cx}px`,
                "--dy": `${50 - d.cy}px`,
                animationDelay: `${820 + i * 25}ms`,
              } as React.CSSProperties
            }
          />
        ))}
        <circle className="ink-point" cx="50" cy="50" r="27" />
      </g>
    </svg>
  );
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
        <div className="foot-suggest">
          <h2 className="foot-suggest-q">Want a market story explained?</h2>
          <a href={SUGGEST_HREF} className="foot-suggest-pill">
            Suggest a topic
          </a>
        </div>

        <div className="foot-cols">
          <div className="foot-contact">
            <h2 className="foot-h">Get in touch</h2>
            <a href={`mailto:${EMAIL}`} className="foot-pill">
              {EMAIL}
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                <path d="M7 17L17 7" />
                <path d="M8 7h9v9" />
              </svg>
            </a>
            <button
              type="button"
              className="foot-copy"
              onClick={onCopy}
              aria-label={copied ? "Email address copied" : `Copy email address ${EMAIL}`}
            >
              <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                {copied ? (
                  <path d="M5 12l5 5L20 7" />
                ) : (
                  <>
                    <rect x="9" y="9" width="12" height="12" rx="2" />
                    <path d="M5 15V5a2 2 0 0 1 2-2h10" />
                  </>
                )}
              </svg>
              <span aria-live="polite">{copied ? "Copied to clipboard" : "Or copy the address"}</span>
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
            The Basis Point<InkPoint />
          </span>
        </div>

        <div className="foot-base">
          <span>© 2026 Nathalie Lustig · Notes on the fixed income market</span>
        </div>
      </div>
    </footer>
  );
}
