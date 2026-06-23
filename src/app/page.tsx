import Link from "next/link";
import { getAllNotes } from "@/lib/queries";
import { RightRail } from "@/components/RightRail";
import { AboutSection } from "@/components/AboutSection";
import { ProjectsSection } from "@/components/ProjectsSection";
import { ContactSection } from "@/components/ContactSection";
import { HashScroll } from "@/components/HashScroll";
import { Hero } from "@/components/Hero";
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
  const recent = notes.slice(1, 3);
  const latestHref = latest ? `/notes/${latest.slug}` : "/#notes";

  return (
    <>
      <HashScroll />
      <Hero latestHref={latestHref} />
      <RightRail />
      <AboutSection />
      <ProjectsSection />

      <section className="band band-notes" id="notes">
        <div className="page-wide">
          <div className="notes-head">
            <ScrollReveal as="h2" className="notes-head-title" stagger={18}>
              Notes
            </ScrollReveal>
            <p className="notes-head-lede">
              Where I think out loud about the bond market. Written for fun, and to
              keep me sharp.
            </p>
          </div>
          {latest ? (
            <>
              <Link href={`/notes/${latest.slug}`} className="latest-feature">
                <div className="latest-feature-row">
                  <span className="latest-feature-cat">
                    {noteCat(latest.category).cat}
                  </span>
                  <span className="latest-feature-date">
                    {formatDateShort(latest.publishedAt)}
                  </span>
                </div>
                <ScrollReveal as="h2" className="latest-feature-title">
                  {latest.title}
                </ScrollReveal>
                {latest.excerpt ? (
                  <p className="latest-feature-excerpt">{latest.excerpt}</p>
                ) : null}
                <span className="latest-feature-more">Read this note →</span>
              </Link>

              {recent.length > 0 ? (
                <ul className="recent-list">
                  {recent.map((n) => (
                    <li key={n._id} className="recent-row">
                      <Link href={`/notes/${n.slug}`} className="recent-link">
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
        </div>
      </section>

      <ContactSection />
    </>
  );
}
