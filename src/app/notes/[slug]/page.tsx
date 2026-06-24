import Link from "next/link";
import { notFound } from "next/navigation";
import { getNoteBySlug, getAllNoteSlugs, getAdjacentNote } from "@/lib/queries";
import { PortableText } from "@/components/PortableText";
import { noteCat } from "@/lib/noteCat";
import { readTime } from "@/lib/readTime";

export async function generateStaticParams() {
  const slugs = await getAllNoteSlugs();
  return slugs.map((slug) => ({ slug }));
}

function formatDateLong(iso: string) {
  return new Date(iso).toLocaleDateString("en-GB", {
    day: "numeric",
    month: "long",
    year: "numeric",
  });
}

export default async function NotePage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const note = await getNoteBySlug(slug);
  if (!note) notFound();

  const { cat } = noteCat(note.category);
  const minutes = readTime(note.body);
  const next = await getAdjacentNote(slug);

  return (
    <article className="page-full read">
      <Link href="/#notes" className="read-back">← All notes</Link>

      <header className="read-head">
        <div className="read-meta-top">
          <span className="l-tag">{cat}</span>
          <span className="l-smallcaps">
            {formatDateLong(note.publishedAt)} · {minutes} read
          </span>
        </div>
        <h1 className="read-title">{note.title}</h1>
        {note.excerpt && <p className="read-excerpt">{note.excerpt}</p>}
      </header>

      <div className="read-body">
        <PortableText value={note.body} />
      </div>

      {next && next.slug !== slug && (
        <footer className="read-foot">
          <span className="l-smallcaps">Next note</span>
          <Link href={`/notes/${next.slug}`} className="l-btn l-btn-ghost l-btn-sm">
            {next.title} →
          </Link>
        </footer>
      )}
    </article>
  );
}
