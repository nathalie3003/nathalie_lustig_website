"use client";

import { useState } from "react";

type Status = "idle" | "submitting" | "success" | "error";

// Email capture for the hero. Posts to /api/subscribe, which talks to
// Buttondown server-side so the API key never reaches the browser.
export function SubscribeForm() {
  const [email, setEmail] = useState("");
  const [status, setStatus] = useState<Status>("idle");
  const [message, setMessage] = useState("");

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (status === "submitting") return;
    setStatus("submitting");
    setMessage("");
    try {
      const res = await fetch("/api/subscribe", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email }),
      });
      const data = await res.json().catch(() => ({}));
      if (res.ok && data.ok) {
        setStatus("success");
        setMessage(data.message ?? "You are on the list.");
      } else {
        setStatus("error");
        setMessage(data.message ?? "Something went wrong. Please try again.");
      }
    } catch {
      setStatus("error");
      setMessage("Something went wrong. Please try again.");
    }
  };

  if (status === "success") {
    return (
      <div className="hero-subscribe">
        <p className="subscribe-success" role="status">
          {message}
        </p>
      </div>
    );
  }

  return (
    <div className="hero-subscribe">
      <label className="subscribe-label" htmlFor="subscribe-email">
        Get each note in your inbox.
      </label>
      <form className="subscribe-form" onSubmit={onSubmit} noValidate>
        <input
          id="subscribe-email"
          className="subscribe-input"
          type="email"
          inputMode="email"
          autoComplete="email"
          placeholder="you@example.com"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required
          aria-invalid={status === "error"}
          aria-describedby={status === "error" && message ? "subscribe-msg" : undefined}
          disabled={status === "submitting"}
        />
        <button
          type="submit"
          className="l-btn l-btn-primary subscribe-btn"
          disabled={status === "submitting"}
        >
          {status === "submitting" ? "Subscribing…" : "Subscribe"}
        </button>
      </form>
      {status === "error" && message ? (
        <p id="subscribe-msg" className="subscribe-error" role="alert">
          {message}
        </p>
      ) : null}
    </div>
  );
}
