import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";
import {
  getNoteBySlug,
  getAllNoteSlugs,
  getAdjacentNotes,
  getReplies,
  getGlossaryTerms,
  type BondNoteCard,
} from "@/lib/queries";
import { urlFor, imageDimensions } from "@/lib/sanity.client";
import { PortableText } from "@/components/PortableText";
import { applyGlossary } from "@/lib/glossary";
import { about } from "@/content/about";
import { noteCat } from "@/lib/noteCat";
import { readTime } from "@/lib/readTime";
import { TradeIdeaArticle } from "@/components/TradeIdeaArticle";
import { ArticleShell } from "@/components/ArticleShell";
import { ArticleToc } from "@/components/ArticleToc";
import { extractHeadings } from "@/lib/toc";
import { ArticleReveal } from "@/components/ArticleReveal";
import { ScrollReveal } from "@/components/ScrollReveal";
import { Replies } from "@/components/Replies";

export async function generateStaticParams() {
  const slugs = await getAllNoteSlugs();
  return slugs.map((slug) => ({ slug }));
}

const SITE_DESCRIPTION =
  "Notes on rates, credit, and sovereign issuance by Nathalie Lustig.";

// Per-article share metadata: gives LinkedIn/X/Slack this note's own title,
// summary, and cover image. Notes without a cover fall back to the branded
// default card from src/app/opengraph-image.tsx.
export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const note = await getNoteBySlug(slug);
  if (!note) return {};

  const url = `https://thebasispoint.finance/notes/${slug}`;
  const description = note.excerpt ?? SITE_DESCRIPTION;
  const coverUrl = note.coverImage
    ? urlFor(note.coverImage).width(1200).height(630).fit("crop").url()
    : undefined;

  return {
    title: `${note.title} — The Basis Point`,
    description,
    alternates: { canonical: url },
    openGraph: {
      title: note.title,
      description,
      url,
      siteName: "The Basis Point",
      type: "article",
      publishedTime: note.publishedAt,
      ...(coverUrl
        ? { images: [{ url: coverUrl, width: 1200, height: 630, alt: note.title }] }
        : {}),
    },
    twitter: {
      card: "summary_large_image",
      title: note.title,
      description,
      ...(coverUrl ? { images: [coverUrl] } : {}),
    },
  };
}

function formatDateLong(iso: string) {
  return new Date(iso).toLocaleDateString("en-GB", {
    day: "numeric",
    month: "long",
    year: "numeric",
  });
}

function formatDateShort(iso: string) {
  return new Date(iso).toLocaleDateString("en-GB", {
    day: "numeric",
    month: "short",
    year: "numeric",
  });
}

// One keep-reading section for both article layouts. Previously each layout
// carried its own prev/next nav, which meant a trade idea and a standard note
// ended a reader's journey differently for no reason.
function KeepReading({
  prev,
  next,
}: {
  prev: BondNoteCard | null;
  next: BondNoteCard | null;
}) {
  if (!prev && !next) return null;
  const cards: { note: BondNoteCard; dir: string }[] = [];
  if (prev) cards.push({ note: prev, dir: "← Previous note" });
  if (next) cards.push({ note: next, dir: "Next note →" });

  return (
    <section className="keep-reading" aria-label="Keep reading">
      <div className="keep-reading-inner">
        <span className="keep-reading-label">Keep reading</span>
        <div className="keep-reading-grid">
          {cards.map(({ note, dir }) => (
            <Link key={note._id} href={`/notes/${note.slug}`} className="keep-card">
              <span className="keep-card-dir">{dir}</span>
              <span className="keep-card-kicker">
                {noteCat(note.category).cat} · {formatDateShort(note.publishedAt)}
              </span>
              <span className="keep-card-title">{note.title}</span>
            </Link>
          ))}
        </div>
      </div>
    </section>
  );
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
  const headings = extractHeadings(note.body);
  const [{ prev, next }, replies, glossary] = await Promise.all([
    getAdjacentNotes(slug),
    getReplies(note._id),
    getGlossaryTerms(),
  ]);

  const body = note.disableGlossary
    ? note.body
    : applyGlossary(note.body, glossary);

  const article =
    note.category === "trade-ideas" ? (
      <TradeIdeaArticle
        note={{ ...note, body }}
        dateLabel={formatDateLong(note.publishedAt)}
        readLabel={`${minutes} read`}
        resetKey={slug}
      />
    ) : (
      <ArticleShell className="article-page">
        <ArticleToc items={headings} />
        <ArticleReveal resetKey={slug}>
          <header className="ap-head col-wide">
            <Link href="/notes" className="ap-back">
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
            <p className="ap-byline">
              By <Link href="/about">{about.author}</Link>
            </p>
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
              <PortableText value={body} />

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
            </div>
          </article>
        </ArticleReveal>
      </ArticleShell>
    );

  return (
    <>
      {article}
      <Replies noteId={note._id} initial={replies} />
      <KeepReading prev={prev} next={next} />
    </>
  );
}
