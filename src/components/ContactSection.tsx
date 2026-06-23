"use client";

import { useState } from "react";
import { about } from "@/content/about";
import { ScrollReveal } from "./ScrollReveal";

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
      // Clipboard unavailable — fall back to opening mail client.
      window.location.href = `mailto:${EMAIL}`;
    }
  };

  const onSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const subject = name ? `Hello from ${name}` : "Hello";
    const replyLine = email ? `\n\nReply to: ${email}` : "";
    const body = (message || "") + replyLine;
    window.location.href = `mailto:${EMAIL}?subject=${encodeURIComponent(
      subject,
    )}&body=${encodeURIComponent(body)}`;
  };

  const linkedIn = about.contact.find((c) => c.label === "LinkedIn");

  return (
    <section className="band band-contact" id="contact">
      <div className="page-wide contact">
        <div className="contact-head">
          <span className="l-kicker">Get in touch</span>
          <ScrollReveal as="h2" className="contact-title">
            {"Happy to talk bonds, books, or anything in between."}
          </ScrollReveal>
          <p className="contact-lede">
            Reach me directly, or send a note from here. Both land in the same inbox.
          </p>
        </div>

        <div className="contact-grid">
          <div className="contact-direct">
            <div className="contact-elsewhere">
              <button
                type="button"
                className="contact-link contact-link-btn"
                onClick={onCopy}
                aria-label={`Copy email address ${EMAIL}`}
              >
                <span className="cl-label">Email</span>
                <span className="cl-value">
                  {EMAIL} {copied ? "Copied ✓" : "Copy →"}
                </span>
              </button>
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
                rows={5}
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
              <span className="cf-hint">
                Opens your email client with the note pre-filled.
              </span>
            </div>
          </form>
        </div>
      </div>
    </section>
  );
}
