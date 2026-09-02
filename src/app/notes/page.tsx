import Link from "next/link";
import { getAllNotes } from "@/lib/queries";
import { CATEGORIES, categoryFromSlug, noteCat } from "@/lib/noteCat";
import { readTimeFromChars } from "@/lib/readTime";

export const metadata = {
  title: "Notes — The Basis Point",
  description:
    "Notes on rates, credit, new issues, private credit, and trade ideas.",
};

type SearchParams = Promise<{ category?: string }>;

function formatDateShort(iso: string) {
  return new Date(iso).toLocaleDateString("en-GB", {
    day: "numeric",
    month: "short",
    year: "numeric",
  });
}

export default async function NotesIndexPage({
  searchParams,
}: {
  searchParams: SearchParams;
}) {
  const { category } = await searchParams;
  const active = categoryFromSlug(category);

  const allNotes = await getAllNotes();
  const notes = active
    ? allNotes.filter((n) => categoryFromSlug(n.category)?.slug === active.slug)
    : allNotes;

  return (
    <div className="archive">
      <header>
        <span className="archive-eyebrow">Archive</span>
        <h1 className="archive-title">{active ? active.label : "Notes"}</h1>
        <p className="archive-lede">
          {active
            ? `${active.blurb}.`
            : "Everything I've written, newest first. Filter by what you came for."}
        </p>
      </header>

      <nav className="archive-filters" aria-label="Filter by category">
        <Link
          href="/notes"
          className={`archive-pill${!active ? " is-active" : ""}`}
          aria-current={!active ? "page" : undefined}
        >
          All
        </Link>
        {CATEGORIES.map((c) => (
          <Link
            key={c.slug}
            href={`/notes?category=${c.slug}`}
            className={`archive-pill${active?.slug === c.slug ? " is-active" : ""}`}
            aria-current={active?.slug === c.slug ? "page" : undefined}
          >
            {c.label}
          </Link>
        ))}
      </nav>

      {notes.length === 0 ? (
        <p className="archive-empty">
          Nothing filed under this category yet. It is on the list.{" "}
          <Link href="/notes" className="l-link">
            See all notes →
          </Link>
        </p>
      ) : (
        <div className="archive-list">
          {notes.map((n) => (
            <Link key={n._id} href={`/notes/${n.slug}`} className="archive-row">
              <span className="archive-date">
                {formatDateShort(n.publishedAt)}
              </span>
              <span className="archive-row-body">
                {/* With a filter on, every row would carry the same label, so
                    the heading above already says it. */}
                {active ? null : (
                  <span className="archive-cat">{noteCat(n.category).cat}</span>
                )}
                <span className="archive-row-title">{n.title}</span>
                {n.excerpt ? (
                  <span className="archive-deck">{n.excerpt}</span>
                ) : null}
              </span>
              <span className="archive-read">{readTimeFromChars(n.readChars)}</span>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
