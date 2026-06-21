"use client";

import { useState } from "react";
import Link from "next/link";
import { about } from "@/content/about";
import { cvLabel } from "@/content/tone";

const EMAIL = "nathalie.lustig03@gmail.com";

export function ContactSection() {
  const [copied, setCopied] = useState(false);
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [message, setMessage] = useState("");

  const onCopy = async () => {
    try {
      await navigator.clipboard.writeText(EMAIL);
      setCopied(true);
      window.setTimeout(() => setCopied(false), 1600);
    } catch {
      // clipboard unavailable — fall through to mailto
      window.location.href = `mailto:${EMAIL}`;
    }
  };

  const onSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const subject = name ? `Hello from ${name}` : "Hello";
    const replyLine = email ? `\n\n— Reply to: ${email}` : "";
    const body = (message || "") + replyLine;
    const href = `mailto:${EMAIL}?subject=${encodeURIComponent(
      subject,
    )}&body=${encodeURIComponent(body)}`;
    window.location.href = href;
  };

  const linkedIn = about.contact.find((c) => c.label === "LinkedIn");

  return (
    <section className="band band-contact" id="contact">
      <div className="page-wide contact">
        <div className="contact-head">
          <span className="l-kicker">Get in touch</span>
          <h2 className="contact-title">
            Happy to talk <em>bonds, books,</em> or anything in between.
          </h2>
          <p className="contact-lede">
            Reach me directly, or send a note from here — both land in the
            same inbox.
          </p>
        </div>

        <div className="contact-grid">
          <div className="contact-direct">
            <button
              type="button"
              className="contact-email"
              onClick={onCopy}
              aria-label={`Copy email address ${EMAIL}`}
            >
              <span className="contact-email-value">{EMAIL}</span>
              <span className="contact-email-action">
                {copied ? "Copied ✓" : "Copy →"}
              </span>
            </button>

            <div className="contact-elsewhere">
              {linkedIn ? (
                <a
                  className="contact-link"
                  href={linkedIn.href}
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  <span className="cl-label">LinkedIn</span>
                  <span className="cl-value">{linkedIn.value} ↗</span>
                </a>
              ) : null}
              <Link href="/cv" className="contact-link">
                <span className="cl-label">CV</span>
                <span className="cl-value">{cvLabel} →</span>
              </Link>
            </div>
          </div>

          <form className="contact-form" onSubmit={onSubmit}>
            <div className="cf-row-pair">
              <label className="cf-row">
                <span className="cf-label">Your name</span>
                <input
                  className="cf-input"
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="Optional"
                />
              </label>
              <label className="cf-row">
                <span className="cf-label">Your email</span>
                <input
                  className="cf-input"
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="So I can reply"
                />
              </label>
            </div>
            <label className="cf-row">
              <span className="cf-label">Message</span>
              <textarea
                className="cf-textarea"
                rows={4}
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                placeholder="What's on your mind?"
                required
              />
            </label>
            <div className="cf-actions">
              <button type="submit" className="l-btn l-btn-primary cf-send">
                Send →
              </button>
              <Link href="/cv" className="l-btn l-btn-cv">
                Download CV →
              </Link>
            </div>
          </form>
        </div>
      </div>
    </section>
  );
}
