import Link from "next/link";
import type { BondNoteCard } from "@/lib/queries";
import { noteCat } from "@/lib/noteCat";

function formatDateShort(iso: string) {
  // e.g. "9 Jun 2026"
  return new Date(iso).toLocaleDateString("en-GB", {
    day: "numeric",
    month: "short",
    year: "numeric",
  });
}

export function NoteRow({ note }: { note: BondNoteCard }) {
  const { cat } = noteCat(note.category);
  return (
    <Link href={`/notes/${note.slug}`} className="note-row">
      <span className="l-smallcaps note-date">{formatDateShort(note.publishedAt)}</span>
      <span>
        <span className="note-title" style={{ display: "block" }}>
          {note.title}
        </span>
        {note.excerpt ? (
          <span className="note-excerpt" style={{ display: "block" }}>
            {note.excerpt}
          </span>
        ) : null}
      </span>
      <span className="l-tag note-tag">{cat}</span>
    </Link>
  );
}
