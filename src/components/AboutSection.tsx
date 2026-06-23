import Link from "next/link";
import { about } from "@/content/about";
import { getSiteSettings } from "@/lib/queries";
import { RightNowBlock } from "./RightNowBlock";
import { ScrollReveal } from "./ScrollReveal";

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
        <ScrollReveal as="h2" className="about-title">A bit more about me</ScrollReveal>
        <div className="about-grid">
          <div className="about-bio">
            {paragraphs.map((p, i) => (
              <p key={i}>{p}</p>
            ))}
            <div className="about-actions">
              <Link href="/#projects" className="l-btn l-btn-primary">
                See my projects →
              </Link>
            </div>
          </div>
          <RightNowBlock />
        </div>
      </div>
    </section>
  );
}
