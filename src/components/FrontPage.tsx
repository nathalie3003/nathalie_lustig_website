import Image from "next/image";
import Link from "next/link";
import type { ReactNode } from "react";
import { TypedTopics } from "@/components/TypedTopics";
import { HomeNotes, type HomeNote } from "@/components/HomeNotes";
import { CATEGORIES } from "@/lib/noteCat";
import type { LeadExtras } from "@/lib/queries";

export type FrontStory = {
  slug: string;
  title: string;
  excerpt?: string;
  cat: string;
  date: string;
  read: string;
  image?: string;
};

// Design exploration: the homepage set as a publication front page. Shown only
// under html[data-hero="frontpage"] (src/lib/look.ts). The lead note carries the
// page, with its own figures pulled out of the body, so the first screen shows
// how she thinks rather than describing it.
export function FrontPage({
  today,
  issueNo,
  lead,
  leadExtras,
  leadImage,
  leadImageAlt,
  leadImageCaption,
  secondary,
  more,
  curve,
  rail,
}: {
  today: string;
  issueNo: number;
  lead: FrontStory;
  leadExtras: LeadExtras | null;
  leadImage: string | null;
  leadImageAlt: string;
  leadImageCaption?: string;
  secondary: FrontStory[];
  more: HomeNote[];
  curve: ReactNode;
  rail: ReactNode;
}) {
  const strip = (leadExtras?.strip ?? []).filter((s) => s.value).slice(0, 3);
  const summary = leadExtras?.summary?.trim();

  return (
    <div className="fp">
      <header className="fp-mast">
        <p className="fp-name">
          The Basis Point<span className="bp-point">.</span>
        </p>
        <div className="fp-ears">
          <span className="fp-ear">
            <span className="fp-issue-no">No. {issueNo} · </span>
            {today}
          </span>
          <TypedTopics
            lead="Notes on"
            words={CATEGORIES.map((c) => c.label.toLowerCase().replace("&", "and"))}
          />
          <span className="fp-ear fp-ear-end">By Nathalie Lustig</span>
        </div>
      </header>

      <div className="fp-top">
        <article className="fp-lead">
          <h1 className="fp-lead-title">
            <Link href={`/notes/${lead.slug}`}>{lead.title}</Link>
          </h1>
          {lead.excerpt ? <p className="fp-lead-deck">{lead.excerpt}</p> : null}
          <p className="fp-dateline">
            <span className="fp-byline">By Nathalie Lustig · </span>
            {lead.cat} · {lead.date} · {lead.read} read
          </p>

          {strip.length > 0 ? (
            <dl className="fp-strip">
              {strip.map((s, i) => (
                <div key={i} className="fp-stat">
                  <dt>{s.label}</dt>
                  <dd>{s.value}</dd>
                </div>
              ))}
            </dl>
          ) : null}

          {leadImage ? (
            <figure className="fp-figure">
              <Image
                src={leadImage}
                alt={leadImageAlt}
                width={1200}
                height={720}
                sizes="(max-width: 920px) 100vw, 700px"
                priority
              />
              {leadImageCaption ? <figcaption>{leadImageCaption}</figcaption> : null}
            </figure>
          ) : null}

          {summary ? <p className="fp-summary">{summary}</p> : null}

          <Link href={`/notes/${lead.slug}`} className="fp-more">
            Read the note →
          </Link>
        </article>

        <aside className="fp-side" aria-label="Markets and about">
          {curve}
          <blockquote className="fp-about">
            <p>
              Bond markets are the most honest real-time read on the economy. I
              write these notes to work out what the market is pricing in, and
              what it might be missing.
            </p>
            <footer>
              <Link href="/about" className="fp-side-link">
                Nathalie Lustig, about me →
              </Link>
            </footer>
          </blockquote>
        </aside>
      </div>

      {secondary.length > 0 ? (
        <section className="fp-row" aria-labelledby="fp-row-head">
          <h2 className="fp-row-head" id="fp-row-head">
            Also in this issue
          </h2>
          {secondary.map((s) => (
            <article key={s.slug} className="fp-story">
              {s.image ? (
                <div className="fp-story-media">
                  <Image src={s.image} alt="" width={720} height={450} sizes="(max-width: 920px) 100vw, 360px" />
                </div>
              ) : null}
              <h2 className="fp-story-title">
                <Link href={`/notes/${s.slug}`}>{s.title}</Link>
              </h2>
              {s.excerpt ? <p className="fp-story-deck">{s.excerpt}</p> : null}
              <p className="fp-dateline">
                {s.cat} · {s.date} · {s.read} read
              </p>
            </article>
          ))}
        </section>
      ) : null}

      <section className="home-grid fp-grid">
        <div className="home-main">
          <div className="home-head">
            <h2 className="home-head-title">From the archive</h2>
            <Link href="/notes" className="home-head-link">
              All notes →
            </Link>
          </div>
          {more.length > 0 ? (
            <HomeNotes notes={more} />
          ) : (
            <p className="home-notes-empty">Older notes will appear here.</p>
          )}
        </div>
        {rail}
      </section>
    </div>
  );
}
