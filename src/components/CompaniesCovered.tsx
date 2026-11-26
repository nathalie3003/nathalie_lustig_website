import Link from "next/link";
import { companiesCovered } from "@/content/companiesCovered";

type NoteRef = { slug: string; title: string };

// An index of the companies the notes cover, set like a publication's
// "companies in this issue" list: names in the display serif, the note that
// covers each one beneath it, hairlines between. Text rather than logos, so it
// stays in the site's typographic register instead of becoming a logo wall.
export function CompaniesCovered({ notes }: { notes: NoteRef[] }) {
  const bySlug = new Map(notes.map((n) => [n.slug, n.title.trim()]));
  const items = companiesCovered.flatMap((c) => {
    const title = bySlug.get(c.slug);
    return title ? [{ ...c, title }] : [];
  });
  if (items.length === 0) return null;

  return (
    <section className="covered" aria-labelledby="covered-title">
      <div className="home-head">
        <h2 className="home-head-title" id="covered-title">
          Companies covered
        </h2>
      </div>
      <ul className="covered-list">
        {items.map((c) => (
          <li key={c.name}>
            <Link href={`/notes/${c.slug}`} className="covered-item">
              <span className="covered-name">{c.name}</span>
              <span className="covered-note">{c.title}</span>
            </Link>
          </li>
        ))}
      </ul>
    </section>
  );
}
