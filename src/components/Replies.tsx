"use client";

import { useEffect, useMemo, useState } from "react";
import type { Reply } from "@/lib/queries";

type Props = {
  noteId: string;
  initial: Reply[];
};

const MAX_TEXT = 2000;
const MAX_NAME = 80;

function initialOf(name?: string) {
  const trimmed = name?.trim();
  return trimmed ? trimmed.charAt(0).toUpperCase() : "?";
}

function absolute(iso: string) {
  return new Date(iso).toLocaleDateString("en-GB", {
    day: "numeric",
    month: "short",
    year: "numeric",
  });
}

function relative(iso: string) {
  const mins = Math.round((Date.now() - new Date(iso).getTime()) / 60000);
  if (mins < 1) return "just now";
  if (mins < 60) return `${mins} min ago`;
  const hours = Math.round(mins / 60);
  if (hours < 24) return `${hours}h ago`;
  const days = Math.round(hours / 24);
  if (days < 30) return `${days}d ago`;
  return absolute(iso);
}

export function Replies({ noteId, initial }: Props) {
  const [replies, setReplies] = useState<Reply[]>(initial);
  const [name, setName] = useState("");
  const [text, setText] = useState("");
  const [website, setWebsite] = useState(""); // honeypot
  const [sending, setSending] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Relative times differ between the server render and the client, which would
  // be a hydration mismatch. Render absolute dates until mounted, then switch.
  const [mounted, setMounted] = useState(false);
  useEffect(() => setMounted(true), []);

  const count = useMemo(
    () => (replies.length === 1 ? "1 reply" : `${replies.length} replies`),
    [replies.length],
  );

  const canPost = text.trim().length > 0 && !sending;

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!canPost) return;
    setSending(true);
    setError(null);

    try {
      const res = await fetch("/api/replies", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ noteId, name, text, website }),
      });
      const data = await res.json().catch(() => ({}));

      if (!res.ok || data?.ok === false) {
        setError(data?.message ?? "Something went wrong. Please try again.");
        return;
      }

      // Show it straight away rather than waiting on a refetch. The write has
      // already succeeded, so this is not an optimistic guess; the id is
      // temporary only until the next full load.
      setReplies((prev) => [
        ...prev,
        {
          _id: `local-${Date.now()}`,
          name: name.trim() || undefined,
          text: text.trim(),
          createdAt: new Date().toISOString(),
        },
      ]);
      setText("");
      setName("");
    } catch {
      setError("Something went wrong. Please try again.");
    } finally {
      setSending(false);
    }
  }

  return (
    <section className="replies" id="replies">
      <div className="replies-inner">
        <div className="replies-head">
          <h2 className="replies-title">Replies</h2>
          <span className="replies-count">{count}</span>
        </div>
        <p className="replies-note">
          No account needed. Leave a name or stay anonymous. I read everything
          that comes in.
        </p>

        <form className="reply-form" onSubmit={onSubmit}>
          <input
            className="reply-name"
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="Name (optional)"
            maxLength={MAX_NAME}
            aria-label="Your name, optional"
          />
          <div className="reply-divider" />
          <textarea
            className="reply-text"
            value={text}
            onChange={(e) => setText(e.target.value)}
            placeholder="Add a reply. Pushback welcome."
            rows={3}
            maxLength={MAX_TEXT}
            aria-label="Your reply"
          />

          {/* Honeypot: hidden from people, filled in by bots. Never remove the
              label or it stops being invisible to screen readers too. */}
          <div className="reply-hp" aria-hidden="true">
            <label htmlFor="website">Website</label>
            <input
              id="website"
              name="website"
              type="text"
              tabIndex={-1}
              autoComplete="off"
              value={website}
              onChange={(e) => setWebsite(e.target.value)}
            />
          </div>

          <div className="reply-actions">
            <span className="reply-as">
              Posting as {name.trim() || "Anonymous"}
            </span>
            <button
              type="submit"
              className="reply-post"
              disabled={!canPost}
              aria-disabled={!canPost}
            >
              {sending ? "Posting…" : "Post reply"}
            </button>
          </div>
          {error ? (
            <p className="reply-error" role="alert">
              {error}
            </p>
          ) : null}
        </form>

        {replies.length > 0 ? (
          <div className="reply-list">
            {replies.map((r) => (
              <article className="reply" key={r._id}>
                <div className="reply-avatar" aria-hidden="true">
                  {initialOf(r.name)}
                </div>
                <div>
                  <div className="reply-meta">
                    <span className="reply-author">
                      {r.name?.trim() || "Anonymous"}
                    </span>
                    <time className="reply-when" dateTime={r.createdAt}>
                      {mounted ? relative(r.createdAt) : absolute(r.createdAt)}
                    </time>
                  </div>
                  <p className="reply-body">{r.text}</p>
                </div>
              </article>
            ))}
          </div>
        ) : null}
      </div>
    </section>
  );
}
