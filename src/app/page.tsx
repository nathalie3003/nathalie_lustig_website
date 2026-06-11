import Link from "next/link";
import { getAllNotes } from "@/lib/queries";
import { NoteRow } from "@/components/NoteCard";
import { RightRail } from "@/components/RightRail";
import { AboutSection } from "@/components/AboutSection";
import { ProjectsSection } from "@/components/ProjectsSection";
import { HashScroll } from "@/components/HashScroll";
import { hero, notesHead, readLatest } from "@/content/tone";

export default async function HomePage() {
  const notes = await getAllNotes();
  const latest = notes[0];
  const latestHref = latest ? `/notes/${latest.slug}` : "/#notes";

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
              <span className="l-eyebrow">{notesHead}</span>
            </div>
            <div className="notes">
              {notes.length === 0 ? (
                <p className="rail-block-note" style={{ padding: "20px 0" }}>
                  No notes published yet.
                </p>
              ) : (
                notes.map((n) => <NoteRow key={n._id} note={n} />)
              )}
            </div>
          </section>
        </div>

        <RightRail latestSlug={latest?.slug ?? null} />
      </div>

      <AboutSection />
      <ProjectsSection />
    </div>
  );
}
