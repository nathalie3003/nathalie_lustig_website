import Link from "next/link";
import { getAllNotes } from "@/lib/queries";
import { RightRail } from "@/components/RightRail";
import { AboutSection } from "@/components/AboutSection";
import { ProjectsSection } from "@/components/ProjectsSection";
import { ContactSection } from "@/components/ContactSection";
import { HashScroll } from "@/components/HashScroll";
import { hero, readLatest } from "@/content/tone";
import { noteCat } from "@/lib/noteCat";
import { ScrollReveal } from "@/components/ScrollReveal";

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
  const recent = notes.slice(0, 3);
  const latestHref = latest ? `/notes/${latest.slug}` : "/#notes";

  return (
    <div className="scroll-home">
      <HashScroll />
      <div className="home" id="top">
        <div className="home-main">
          <section className="hero hero-slim">
            <h1 className="hero-name">Nathalie Lustig</h1>
            <p className="hero-lead">{hero.lead}</p>
            <div className="hero-cta">
              <Link href={latestHref} className="l-btn l-btn-primary">
                {readLatest}
              </Link>
            </div>
          </section>

          <section className="section" id="notes">
            <div className="section-head">
              <ScrollReveal as="span" className="l-eyebrow" stagger={18}>
                Desk notes
              </ScrollReveal>
            </div>
            {recent.length > 0 ? (
              <>
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

        <RightRail />
      </div>

      <AboutSection />
      <ProjectsSection />
      <ContactSection />
    </div>
  );
}
