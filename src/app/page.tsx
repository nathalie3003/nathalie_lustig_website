import Link from "next/link";
import { getAllNotes } from "@/lib/queries";
import { RightRail } from "@/components/RightRail";
import { CredentialStrip } from "@/components/CredentialStrip";
import { MarketTicker } from "@/components/MarketTicker";
import { AboutSection } from "@/components/AboutSection";
import { ProjectsSection } from "@/components/ProjectsSection";
import { ContactSection } from "@/components/ContactSection";
import { HashScroll } from "@/components/HashScroll";
import { hero, readLatest } from "@/content/tone";
import { noteCat } from "@/lib/noteCat";

function formatDateShort(iso: string) {
  return new Date(iso).toLocaleDateString("en-GB", {
    day: "numeric",
    month: "short",
    year: "numeric",
  });
}

export default async function HomePage() {
  const notes = await getAllNotes();
  const latest = notes[0];
  const recent = notes.slice(1, 3); // up to 2 more recent
  const latestHref = latest ? `/notes/${latest.slug}` : "/notes";

  return (
    <div className="scroll-home">
      <HashScroll />
      <CredentialStrip />

      <div className="home" id="top">
        <div className="home-main">
          <section className="hero hero-compact">
            <span className="l-kicker hero-kicker">{hero.kicker}</span>
            <h1 className="hero-name">Nathalie Lustig</h1>
            <p className="hero-lead">{hero.lead}</p>
            <div className="hero-cta">
              <Link href={latestHref} className="l-btn l-btn-primary">
                {readLatest}
              </Link>
              <Link href="/cv" className="l-btn l-btn-cv">
                Download CV →
              </Link>
            </div>
          </section>

          <MarketTicker />

          <section className="section section-notes" id="notes">
            <div className="section-head">
              <span className="l-eyebrow">Recent commentary</span>
            </div>
            {latest ? (
              <>
                <Link
                  href={`/notes/${latest.slug}`}
                  className="latest-feature"
                >
                  <div className="latest-feature-row">
                    <span className="latest-feature-cat">
                      {noteCat(latest.category).cat}
                    </span>
                    <span className="latest-feature-date">
                      {formatDateShort(latest.publishedAt)}
                    </span>
                  </div>
                  <h2 className="latest-feature-title">{latest.title}</h2>
                  {latest.excerpt ? (
                    <p className="latest-feature-excerpt">{latest.excerpt}</p>
                  ) : null}
                  <span className="latest-feature-more">
                    Read this note →
                  </span>
                </Link>

                {recent.length > 0 ? (
                  <ul className="recent-list">
                    {recent.map((n) => (
                      <li key={n._id} className="recent-row">
                        <Link
                          href={`/notes/${n.slug}`}
                          className="recent-link"
                        >
                          <span className="recent-cat">
                            {noteCat(n.category).cat}
                          </span>
                          <span className="recent-title">{n.title}</span>
                          <span className="recent-date">
                            {formatDateShort(n.publishedAt)}
                          </span>
                        </Link>
                      </li>
                    ))}
                  </ul>
                ) : null}

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
        </div>

        <RightRail latestSlug={latest?.slug ?? null} />
      </div>

      <AboutSection />
      <ProjectsSection />
      <ContactSection />
    </div>
  );
}
