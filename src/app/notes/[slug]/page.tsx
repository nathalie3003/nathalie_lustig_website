import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";
import { getNoteBySlug, getAllNoteSlugs, getAdjacentNotes } from "@/lib/queries";
import { urlFor } from "@/lib/sanity.client";
import { PortableText } from "@/components/PortableText";
import { noteCat } from "@/lib/noteCat";
import { readTime } from "@/lib/readTime";
import { TradeIdeaArticle } from "@/components/TradeIdeaArticle";

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
  const { prev, next } = await getAdjacentNotes(slug);

  if (note.category === "trade-ideas") {
    return (
      <TradeIdeaArticle
        note={note}
        prev={prev}
        next={next}
        dateLabel={formatDateLong(note.publishedAt)}
        readLabel={`${minutes} read`}
      />
    );
  }

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

      {note.coverImage && (
        <figure className="read-cover">
          <Image
            src={urlFor(note.coverImage).width(1600).height(900).fit("crop").url()}
            alt=""
            width={1600}
            height={900}
            priority
          />
        </figure>
      )}

      <div className="read-body">
        <PortableText value={note.body} />
      </div>

      <footer className="read-foot">
        <div className="read-foot-grid">
          {prev && (
            <Link href={`/notes/${prev.slug}`} className="read-foot-cell read-foot-prev">
              <span className="l-smallcaps">Previous note</span>
              <span className="read-foot-title">← {prev.title}</span>
            </Link>
          )}
          {next && (
            <Link href={`/notes/${next.slug}`} className="read-foot-cell read-foot-next">
              <span className="l-smallcaps">Next note</span>
              <span className="read-foot-title">{next.title} →</span>
            </Link>
          )}
        </div>
      </footer>
    </article>
  );
}
