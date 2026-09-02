import Image from "next/image";
import Link from "next/link";
import { getAllNotes } from "@/lib/queries";
import { urlFor } from "@/lib/sanity.client";
import { RightRail } from "@/components/RightRail";
import { RailScroll } from "@/components/RailScroll";
import { ProjectsSection } from "@/components/ProjectsSection";
import { HashScroll } from "@/components/HashScroll";
import { CATEGORIES, noteCat } from "@/lib/noteCat";
import { DeskNotesRotator } from "@/components/DeskNotesRotator";
import { CurveCard } from "@/components/CurveCard";
import { HomeNotes, type HomeNote } from "@/components/HomeNotes";
import { getYieldCurve, getAllTenorHistories } from "@/lib/marketData";
import { readTimeFromChars } from "@/lib/readTime";
import { FALLBACK_CURVE } from "@/content/yieldCurveFallback";

function formatDateShort(iso: string) {
  return new Date(iso).toLocaleDateString("en-GB", {
    day: "numeric",
    month: "short",
    year: "numeric",
  });
}

export default async function HomePage() {
  const [notes, liveCurve, histories] = await Promise.all([
    getAllNotes(),
    getYieldCurve(),
    getAllTenorHistories(),
  ]);

  const curve = liveCurve ?? FALLBACK_CURVE;
  const latest = notes[0];

  // The latest note already leads the page as the featured card, so it is not
  // repeated in the list directly beneath it. The rest are capped: the homepage
  // is a front page, not the archive, and "All notes" is one click away. Six is
  // the count that leaves the list a little taller than the rail beside it, so
  // the rail never ends up setting the section height and stranding empty space
  // under the notes. The category tabs are built from whatever lands in this
  // slice, so a tab never offers a filter the visible rows cannot satisfy.
  const rows: HomeNote[] = notes.slice(1, 7).map((n) => ({
    id: n._id,
    slug: n.slug,
    title: n.title,
    excerpt: n.excerpt,
    category: n.category ?? "",
    catLabel: noteCat(n.category).cat,
    date: formatDateShort(n.publishedAt),
    read: readTimeFromChars(n.readChars),
    thumbUrl: n.coverImage
      ? urlFor(n.coverImage).width(192).height(192).url()
      : undefined,
  }));

  const latestCover = latest?.coverImage
    ? urlFor(latest.coverImage).width(900).height(760).url()
    : null;

  return (
    <div className="scroll-home">
      <HashScroll />
      <RailScroll />

      <section className="hero-grid" id="top">
        <div className="hero-copy">
          <span className="hero-eyebrow">
            <span className="hero-eyebrow-rule" aria-hidden="true" />
            Bond notes since 2026
          </span>
          <h1 className="hero-display">The Basis Point</h1>
          <p className="hero-standfirst">
            Bond markets are the most honest real-time read on the economy. I
            write these notes to work out what the market is pricing in, and
            what it might be missing.
          </p>
          <DeskNotesRotator words={CATEGORIES.map((c) => c.label.toLowerCase())} />
          <div className="hero-cta">
            {latest ? (
              <Link href={`/notes/${latest.slug}`} className="l-btn l-btn-primary">
                Read the latest note
              </Link>
            ) : null}
            <Link href="/notes" className="l-btn l-btn-ghost">
              Browse all notes
            </Link>
          </div>
        </div>

        <CurveCard snapshot={curve.points} asOf={curve.asOf} histories={histories} />
      </section>

      {latest ? (
        <section className="featured-wrap">
          <Link href={`/notes/${latest.slug}`} className="featured">
            <div className="featured-copy">
              <span className="featured-kicker">
                Latest note · {noteCat(latest.category).cat} ·{" "}
                {formatDateShort(latest.publishedAt)}
              </span>
              <h2 className="featured-title">{latest.title}</h2>
              {latest.excerpt ? (
                <p className="featured-deck">{latest.excerpt}</p>
              ) : null}
              <span className="featured-more">Read the note →</span>
            </div>
            <div className="featured-media">
              {latestCover ? (
                <Image src={latestCover} alt="" width={900} height={760} />
              ) : null}
            </div>
          </Link>
        </section>
      ) : null}

      <section className="home-grid" id="notes">
        <div className="home-main">
          <div className="home-head">
            <h2 className="home-head-title">Recent writing</h2>
            <Link href="/notes" className="home-head-link">
              All notes →
            </Link>
          </div>
          {rows.length > 0 ? (
            <HomeNotes notes={rows} />
          ) : (
            <p className="home-notes-empty">No other notes published yet.</p>
          )}
        </div>

        <RightRail />
      </section>

      <ProjectsSection />
    </div>
  );
}
