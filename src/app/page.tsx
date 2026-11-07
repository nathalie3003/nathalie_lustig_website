import Image from "next/image";
import Link from "next/link";
import { getAllNotes } from "@/lib/queries";
import { urlFor } from "@/lib/sanity.client";
import { HashScroll } from "@/components/HashScroll";
import { CATEGORIES, categoryFromSlug, noteCat } from "@/lib/noteCat";
import { CurveCard } from "@/components/CurveCard";
import { TypedTopics } from "@/components/TypedTopics";
import { getYieldCurve, getAllTenorHistories } from "@/lib/marketData";
import { readTimeFromChars } from "@/lib/readTime";
import { FALLBACK_CURVE } from "@/content/yieldCurveFallback";
import { RightRail } from "@/components/RightRail";
import { RailScroll } from "@/components/RailScroll";

const MONTHS = [
  "Jan",
  "Feb",
  "Mar",
  "Apr",
  "May",
  "Jun",
  "Jul",
  "Aug",
  "Sep",
  "Oct",
  "Nov",
  "Dec",
];

// One date style everywhere on the page ("7 Sep 2026"). toLocaleDateString
// gives "Sept" in some runtimes, so the month comes from a fixed list.
function formatDateShort(iso: string) {
  const d = new Date(iso);
  return `${d.getUTCDate()} ${MONTHS[d.getUTCMonth()]} ${d.getUTCFullYear()}`;
}

// Headlines shown under each desk. Three keeps every column short enough to
// scan at a glance; the full list is one click away on /notes.
const PER_DESK = 3;

export default async function HomePage() {
  const [notes, liveCurve, histories] = await Promise.all([
    getAllNotes(),
    getYieldCurve(),
    getAllTenorHistories(),
  ]);

  const curve = liveCurve ?? FALLBACK_CURVE;
  const latest = notes[0];

  const latestCover = latest?.coverImage
    ? urlFor(latest.coverImage).width(900).height(760).url()
    : null;

  // Recent notes: the three after the lead, which already has its own slot.
  const recent = notes.slice(1, 4);

  // Desks: everything not already shown above, grouped by category in the
  // house order. A desk with nothing left to show is dropped, so no column
  // ever sits empty.
  const shown = new Set([latest?._id, ...recent.map((n) => n._id)]);
  const desks = CATEGORIES.map((c) => ({
    ...c,
    notes: notes
      .filter(
        (n) =>
          !shown.has(n._id) && categoryFromSlug(n.category)?.slug === c.slug,
      )
      .slice(0, PER_DESK),
  })).filter((d) => d.notes.length > 0);

  return (
    <div className="scroll-home">
      <HashScroll />
      <RailScroll />

      <section className="hero-grid" id="top">
        <div className="hero-copy">
          <span className="hero-eyebrow">
            <span className="hero-eyebrow-rule" aria-hidden="true" />
            Bond market notes
          </span>
          <h1 className="hero-display">
            The Basis Point<span className="bp-point">.</span>
          </h1>
          <p className="hero-standfirst">
            Bond markets are the most honest real-time read on the economy. Each
            note works out what the market is pricing in, and what it might be
            missing.
          </p>
          <TypedTopics
            lead="Notes on"
            words={CATEGORIES.map((c) =>
              c.label.toLowerCase().replace("&", "and"),
            )}
          />
          <p className="hero-byline">
            By <Link href="/about">Nathalie Lustig</Link>
            <span className="hero-byline-cred">
              LSE Economics · CFA Level I
            </span>
          </p>
          <div className="hero-cta">
            {latest ? (
              <Link
                href={`/notes/${latest.slug}`}
                className="l-btn l-btn-primary"
              >
                Read the latest note
              </Link>
            ) : null}
            <Link href="/notes" className="l-btn l-btn-ghost">
              Browse all notes
            </Link>
          </div>
        </div>

        <CurveCard
          snapshot={curve.points}
          asOf={curve.asOf}
          histories={histories}
        />
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

      <div className="front-grid">
        <div className="front-main">
          {recent.length > 0 ? (
            <section className="front-section" aria-labelledby="recent-notes">
              <div className="front-head">
                <h2 className="front-head-title" id="recent-notes">
                  Recent notes
                </h2>
                <Link href="/notes" className="front-head-link">
                  All notes →
                </Link>
              </div>
              <div className="start-list">
                {recent.map((n) => (
                  <Link
                    key={n._id}
                    href={`/notes/${n.slug}`}
                    className="start-item"
                  >
                    <span className="front-meta">
                      {noteCat(n.category).cat}
                      <span className="front-meta-sep" aria-hidden="true" />
                      <span className="front-meta-quiet">
                        {readTimeFromChars(n.readChars)} read
                      </span>
                    </span>
                    <span className="start-title">{n.title}</span>
                    {n.excerpt ? (
                      <span className="start-deck">{n.excerpt}</span>
                    ) : null}
                  </Link>
                ))}
              </div>
            </section>
          ) : null}

          {desks.length > 0 ? (
            <section
              className="front-section"
              id="notes"
              aria-labelledby="by-desk"
            >
              <div className="front-head">
                <h2 className="front-head-title" id="by-desk">
                  By desk
                </h2>
              </div>
              <div className="desk-grid">
                {desks.map((d) => (
                  <div className="desk" key={d.slug}>
                    <h3 className="desk-name">
                      <Link href={`/notes?category=${d.slug}`}>{d.label}</Link>
                    </h3>
                    <p className="desk-blurb">{d.blurb}</p>
                    <ul className="desk-list">
                      {d.notes.map((n) => (
                        <li key={n._id}>
                          <Link href={`/notes/${n.slug}`} className="desk-item">
                            <span className="desk-item-title">{n.title}</span>
                            <span className="desk-item-date">
                              {formatDateShort(n.publishedAt)}
                            </span>
                          </Link>
                        </li>
                      ))}
                    </ul>
                  </div>
                ))}
              </div>
            </section>
          ) : null}
        </div>

        <RightRail />
      </div>
    </div>
  );
}
