import Link from "next/link";
import { getAllNotes } from "@/lib/queries";
import { RightRail } from "@/components/RightRail";
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
  const latestHref = latest ? `/notes/${latest.slug}` : "/notes";

  return (
    <div className="scroll-home">
      <HashScroll />
      <div className="home" id="top">
        <div className="home-main">
          <section className="hero">
            <span className="l-kicker hero-kicker">{hero.kicker}</span>
            <h1 className="hero-name">Nathalie Lustig</h1>
            <p className="hero-lead">{hero.lead}</p>
            <span className="l-smallcaps hero-creds">{hero.creds}</span>
            <div className="hero-cta">
              <Link href={latestHref} className="l-btn l-btn-primary">
                {readLatest}
              </Link>
              <Link href="/#about" className="l-btn l-btn-ghost">
                About me →
              </Link>
            </div>
          </section>

          <section className="section" id="notes">
            <div className="section-head">
              <span className="l-eyebrow">Latest note</span>
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
