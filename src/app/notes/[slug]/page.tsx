import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";
import { getNoteBySlug, getAllNoteSlugs, getAdjacentNotes } from "@/lib/queries";
import { urlFor, imageDimensions } from "@/lib/sanity.client";
import { PortableText } from "@/components/PortableText";
import { noteCat } from "@/lib/noteCat";
import { readTime } from "@/lib/readTime";
import { TradeIdeaArticle } from "@/components/TradeIdeaArticle";
import { ReadingProgress } from "@/components/ReadingProgress";
import { ArticleReveal } from "@/components/ArticleReveal";
import { ScrollReveal } from "@/components/ScrollReveal";

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
        resetKey={slug}
      />
    );
  }

  return (
    <div className="article-page">
      <ReadingProgress />

      <ArticleReveal resetKey={slug}>
      <header className="ap-head col-wide">
        <Link href="/#notes" className="ap-back">
          <svg width="15" height="15" viewBox="0 0 15 15" fill="none" aria-hidden="true">
            <path
              d="M9.5 11.5L5.5 7.5L9.5 3.5"
              stroke="currentColor"
              strokeWidth="1.5"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </svg>
          All notes
        </Link>
        <div className="ap-meta">
          {cat && <span className="l-tag">{cat}</span>}
          <span className="l-smallcaps">
            {formatDateLong(note.publishedAt)} · {minutes} read
          </span>
        </div>
        <ScrollReveal key={slug} as="h1" className="ap-title" trigger="mount" delay={520}>
          {note.title}
        </ScrollReveal>
        {note.excerpt && <p className="ap-deck">{note.excerpt}</p>}
      </header>

      {note.coverImage && (
        <div className="ap-hero">
          <Image
            src={urlFor(note.coverImage).width(1600).fit("max").url()}
            alt=""
            width={imageDimensions(note.coverImage)?.width ?? 1600}
            height={imageDimensions(note.coverImage)?.height ?? 900}
            className="ap-hero-img"
            sizes="(max-width: 980px) 100vw, 850px"
            priority
          />
        </div>
      )}

      <article className="ap-body">
        <div className="ap-col">
          <PortableText value={note.body} />

          {note.sources && note.sources.length > 0 && (
            <div className="sources">
              <span className="sources-label">Sources</span>
              <ol>
                {note.sources.map((s, i) => (
                  <li key={i}>{s}</li>
                ))}
              </ol>
            </div>
          )}

          {(prev || next) && (
            <nav className="ap-foot" aria-label="Article navigation">
              <div className="ap-foot-item">
                {prev && (
                  <>
                    <span className="ap-foot-label">← Previous note</span>
                    <Link className="ap-foot-title" href={`/notes/${prev.slug}`}>
                      {prev.title}
                    </Link>
                  </>
                )}
              </div>
              <div className="ap-foot-item">
                {next && (
                  <>
                    <span className="ap-foot-label">Next note →</span>
                    <Link className="ap-foot-title" href={`/notes/${next.slug}`}>
                      {next.title}
                    </Link>
                  </>
                )}
              </div>
            </nav>
          )}
        </div>
      </article>
      </ArticleReveal>
    </div>
  );
}
