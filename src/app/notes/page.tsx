import Link from "next/link";
import { getAllNotes } from "@/lib/queries";
import { NoteRow } from "@/components/NoteCard";
import { CATEGORIES, categoryFromSlug } from "@/lib/noteCat";

export const metadata = {
  title: "Notes — Nathalie Lustig",
  description:
    "Notes on rates, credit, new issues, private credit, and trade ideas.",
};

type SearchParams = Promise<{ category?: string }>;

export default async function NotesIndexPage({
  searchParams,
}: {
  searchParams: SearchParams;
}) {
  const { category } = await searchParams;
  const active = categoryFromSlug(category);

  const allNotes = await getAllNotes();
  const notes = active
    ? allNotes.filter(
        (n) => categoryFromSlug(n.category)?.slug === active.slug,
      )
    : allNotes;

  return (
    <div className="page-wide notes-index">
      <header className="notes-index-head">
        <span className="l-kicker">All notes</span>
        <h1 className="notes-index-title">
          {active ? active.label : "Every note, newest first"}
        </h1>
        <p className="notes-index-lede">
          {active
            ? active.blurb + "."
            : "Working notebook on rates, credit, and the markets in between — filter by topic below."}
        </p>
      </header>

      <nav className="cat-strip" aria-label="Filter by category">
        <Link
          href="/notes"
          className={`cat-chip${!active ? " cat-chip-active" : ""}`}
        >
          All
        </Link>
        {CATEGORIES.map((c) => (
          <Link
            key={c.slug}
            href={`/notes?category=${c.slug}`}
            className={`cat-chip${active?.slug === c.slug ? " cat-chip-active" : ""}`}
          >
            {c.label}
          </Link>
        ))}
      </nav>

      <section className="notes notes-index-list">
        {notes.length === 0 ? (
          <p className="rail-block-note notes-empty">
            No notes in this category yet.{" "}
            <Link href="/notes" className="l-link">See all notes →</Link>
          </p>
        ) : (
          notes.map((n) => <NoteRow key={n._id} note={n} />)
        )}
      </section>
    </div>
  );
}
