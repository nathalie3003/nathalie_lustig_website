import Image from "next/image";
import Link from "next/link";
import { about } from "@/content/about";
import { cvLabel } from "@/content/tone";
import { getSiteSettings } from "@/lib/queries";

export async function AboutSection() {
  const settings = await getSiteSettings();
  const paragraphs =
    settings?.aboutParagraphs && settings.aboutParagraphs.length > 0
      ? settings.aboutParagraphs
      : about.paragraphs;

  return (
    <section className="band band-about" id="about">
      <div className="page-wide about">
        <span className="l-kicker">About</span>
        <h2 className="about-title">A bit more about me</h2>
        <div className="about-grid">
          <div className="about-bio">
            {paragraphs.map((p, i) => (
              <p key={i}>{p}</p>
            ))}
            <div className="about-actions">
              <Link href="/cv" className="l-btn l-btn-primary">
                {cvLabel}
              </Link>
              <Link href="/#projects" className="l-btn l-btn-ghost">
                See my projects →
              </Link>
            </div>
          </div>
          <div className="about-portrait-wrap">
            <Image
              src="/about-portrait.jpg"
              alt="Portrait of Nathalie Lustig"
              width={600}
              height={800}
              className="about-portrait"
            />
          </div>
        </div>
      </div>
    </section>
  );
}
