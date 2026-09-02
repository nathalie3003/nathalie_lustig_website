"use client";

import { useEffect, useRef, useState } from "react";
import Image from "next/image";
import { about } from "@/content/about";

const EMAIL = about.contact.find((c) => c.label === "Email")?.value ?? "";
const LINKEDIN = about.contact.find((c) => c.label === "LinkedIn");

export function ContactSection() {
  const [copied, setCopied] = useState(false);
  const sectionRef = useRef<HTMLElement>(null);

  // One observer for the whole band: when it scrolls into view every
  // [data-fold] child starts its animation, staggered by inline delay.
  useEffect(() => {
    const root = sectionRef.current;
    if (!root) return;
    const items = Array.from(
      root.querySelectorAll<HTMLElement>("[data-fold]"),
    );
    if (!items.length) return;

    const io = new IntersectionObserver(
      (entries) => {
        if (!entries.some((e) => e.isIntersecting)) return;
        items.forEach((el) => el.classList.add("fold-in"));
        io.disconnect();
      },
      { rootMargin: "0px 0px -12% 0px", threshold: 0.15 },
    );
    io.observe(root);
    return () => io.disconnect();
  }, []);

  const onCopy = async () => {
    try {
      await navigator.clipboard.writeText(EMAIL);
      setCopied(true);
      window.setTimeout(() => setCopied(false), 1600);
    } catch {
      // Clipboard unavailable — fall back to opening the mail client.
      window.location.href = `mailto:${EMAIL}`;
    }
  };

  return (
    <section className="band band-contact" id="contact" ref={sectionRef}>
      <Image
        src="/sky-lilies.jpeg"
        alt=""
        fill
        sizes="100vw"
        className="contact-sky"
      />
      <div className="contact-wash" />
      <div className="contact-inner">
        <div className="contact-grid">
          <div>
            <span
              className="contact-eyebrow fold"
              data-fold
              style={{ animationDelay: "0ms" }}
            >
              Get in touch
            </span>
            <h2
              className="contact-title fold"
              data-fold
              style={{ animationDelay: "90ms" }}
            >
              Happy to talk bonds, books, or anything in between.
            </h2>
            <p
              className="contact-lede fold"
              data-fold
              style={{ animationDelay: "190ms" }}
            >
              If something here resonates, I&apos;d like to hear from you.
            </p>
          </div>

          <div
            className="contact-direct fold"
            data-fold
            style={{ animationDelay: "280ms" }}
          >
            <div className="contact-row">
              <div>
                <span className="cl-label">Email</span>
                <span className="cl-value">{EMAIL}</span>
              </div>
              <button
                type="button"
                className="contact-copy"
                onClick={onCopy}
                aria-label={`Copy email address ${EMAIL}`}
              >
                {copied ? "Copied" : "Copy"}
              </button>
            </div>

            {LINKEDIN ? (
              <a
                className="contact-row"
                href={LINKEDIN.href}
                target="_blank"
                rel="noopener noreferrer"
              >
                <div>
                  <span className="cl-label">LinkedIn</span>
                  <span className="cl-value">{LINKEDIN.value}</span>
                </div>
                <span className="contact-arrow" aria-hidden="true">
                  ↗
                </span>
              </a>
            ) : null}
          </div>
        </div>
      </div>
    </section>
  );
}
