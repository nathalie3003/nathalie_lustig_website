import Link from "next/link";
import type { BondNoteCard } from "@/lib/queries";

function formatDate(iso: string) {
  return new Date(iso).toLocaleDateString("en-GB", {
    day: "numeric", month: "short", year: "numeric",
  });
}

export function NoteCard({ note }: { note: BondNoteCard }) {
  return (
    <article className="py-6 border-b border-rule">
      <div className="smallcaps text-xs text-ink/60 mb-2">{formatDate(note.publishedAt)}</div>
      <h3 className="font-serif text-2xl">
        <Link href={`/notes/${note.slug}`}>{note.title}</Link>
      </h3>
      {note.excerpt && <p className="mt-2 text-ink/80">{note.excerpt}</p>}
    </article>
  );
}
