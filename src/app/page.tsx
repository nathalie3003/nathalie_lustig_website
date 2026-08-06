import Image from "next/image";
import Link from "next/link";
import { getAllNotes } from "@/lib/queries";
import { urlFor } from "@/lib/sanity.client";
import { RightRail } from "@/components/RightRail";
import { AboutSection } from "@/components/AboutSection";
import { ProjectsSection } from "@/components/ProjectsSection";
import { ContactSection } from "@/components/ContactSection";
import { HashScroll } from "@/components/HashScroll";
import { readLatest } from "@/content/tone";
import { CATEGORIES, noteCat } from "@/lib/noteCat";
import { DeskNotesRotator } from "@/components/DeskNotesRotator";
import { YieldCurve } from "@/components/YieldCurve";
import { getYieldCurve } from "@/lib/marketData";
import { FALLBACK_CURVE } from "@/content/yieldCurveFallback";

function formatDateShort(iso: string) {
  return new Date(iso).toLocaleDateString("en-GB", {
    day: "numeric",
    month: "short",
    year: "numeric",
  });
}

export default async function HomePage() {
  const [notes, liveCurve] = await Promise.all([getAllNotes(), getYieldCurve()]);
  const latest = notes[0];
  const recent = notes.slice(0, 4);
  const latestHref = latest ? `/notes/${latest.slug}` : "/#notes";

  const curve = liveCurve ?? FALLBACK_CURVE;
  const curveSource: "Treasury" | "snapshot" = liveCurve ? "Treasury" : "snapshot";

  return (
    <div className="scroll-home">
      <HashScroll />
      <div className="home" id="top">
        <div className="home-main">
          <section className="hero hero-slim">
            <span className="hero-eyebrow">
              <span>Bond Notes</span>
            </span>
            <h1 className="hero-name">The Basis Point</h1>
            <p className="hero-byline">Notes by Nathalie Lustig</p>
            <p className="hero-standfirst">
              Bond markets are the most honest real-time read on the economy.
              I write these notes to work out what the market is pricing in,
              and what it might be missing.
            </p>
            <div className="hero-cta">
              <Link href={latestHref} className="l-btn l-btn-primary">
                {readLatest}
              </Link>
            </div>
          </section>

          <section className="section" id="notes">
            <span className="l-kicker">Notes</span>
            <div className="section-head">
              <DeskNotesRotator
                words={CATEGORIES.map((c) => c.label.toLowerCase())}
              />
            </div>
            {recent.length > 0 ? (
              <>
                <ul className="recent-list">
                  {recent.map((n) => {
                    const thumbUrl = n.coverImage
                      ? urlFor(n.coverImage).width(160).height(160).url()
                      : null;
                    return (
                      <li key={n._id} className="recent-row">
                        <Link
                          href={`/notes/${n.slug}`}
                          className="recent-link"
                        >
                          {thumbUrl ? (
                            <Image
                              src={thumbUrl}
                              alt=""
                              width={80}
                              height={80}
                              className="recent-thumb"
                            />
                          ) : null}
                          <div className="recent-body">
                            <div className="recent-top">
                              <span className="recent-cat">
                                {noteCat(n.category).cat}
                              </span>
                              <span className="recent-date">
                                {formatDateShort(n.publishedAt)}
                              </span>
                            </div>
                            <span className="recent-title">{n.title}</span>
                            {n.excerpt ? (
                              <span className="recent-excerpt">{n.excerpt}</span>
                            ) : null}
                          </div>
                        </Link>
                      </li>
                    );
                  })}
                </ul>

                <Link href="/notes" className="view-all-notes">
                  View all notes →
                </Link>
              </>
            ) : (
              <p className="rail-block-note" style={{ padding: "20px 0" }}>
                No notes published yet.
              </p>
            )}
          </section>

          <YieldCurve
            points={curve.points}
            asOf={curve.asOf}
            source={curveSource}
          />
        </div>

        <RightRail />
      </div>

      <AboutSection />
      <ProjectsSection />
      <ContactSection />
    </div>
  );
}
