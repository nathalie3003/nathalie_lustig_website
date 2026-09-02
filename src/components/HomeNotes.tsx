"use client";

import { useMemo, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { CATEGORIES } from "@/lib/noteCat";

export type HomeNote = {
  id: string;
  slug: string;
  title: string;
  excerpt?: string;
  category: string;
  catLabel: string;
  date: string;
  read: string;
  thumbUrl?: string;
};

export function HomeNotes({ notes }: { notes: HomeNote[] }) {
  const [cat, setCat] = useState("all");

  // Only offer a filter that leads somewhere. A tab that always resolves to the
  // empty state is a dead control, and with a handful of notes most categories
  // would be exactly that.
  const tabs = useMemo(() => {
    const present = new Set(notes.map((n) => n.category));
    return [
      { slug: "all", label: "All" },
      ...CATEGORIES.filter((c) => present.has(c.slug)).map((c) => ({
        slug: c.slug,
        label: c.label,
      })),
    ];
  }, [notes]);

  const visible = useMemo(
    () => (cat === "all" ? notes : notes.filter((n) => n.category === cat)),
    [notes, cat],
  );

  return (
    <>
      {tabs.length > 2 && (
        <div className="home-tabs">
          {tabs.map((t) => (
            <button
              type="button"
              key={t.slug}
              className={`home-tab${t.slug === cat ? " is-active" : ""}`}
              aria-pressed={t.slug === cat}
              onClick={() => setCat(t.slug)}
            >
              {t.label}
            </button>
          ))}
        </div>
      )}

      <div className="home-notes">
        {visible.map((n, i) => (
          <Link
            key={n.id}
            href={`/notes/${n.slug}`}
            className="home-note"
            style={{ animationDelay: `${i * 70}ms` }}
          >
            {n.thumbUrl ? (
              <Image
                src={n.thumbUrl}
                alt=""
                width={192}
                height={192}
                className="home-note-thumb"
              />
            ) : (
              <span className="home-note-thumb" aria-hidden="true" />
            )}
            <div className="home-note-body">
              <div className="home-note-meta">
                <span className="home-note-cat">
                  {n.catLabel}
                  <span className="home-note-sep" aria-hidden="true" />
                  <span className="home-note-read">{n.read} read</span>
                </span>
                <span className="home-note-date">{n.date}</span>
              </div>
              <span className="home-note-title">{n.title}</span>
              {n.excerpt ? <span className="home-note-deck">{n.excerpt}</span> : null}
            </div>
          </Link>
        ))}
      </div>

      {visible.length === 0 && (
        <p className="home-notes-empty">
          Nothing filed under this category yet. It is on the list.
        </p>
      )}
    </>
  );
}
