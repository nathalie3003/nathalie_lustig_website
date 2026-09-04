import type { Metadata } from "next";
import { about } from "@/content/about";
import { aboutNow, rightNowMeta } from "@/content/rightNow";
import { getSiteSettings } from "@/lib/queries";
import { LifeCarousel } from "@/components/LifeCarousel";

export const metadata: Metadata = {
  title: "About — The Basis Point",
  description:
    "Nathalie Lustig: LSE Economics graduate, CFA Level I, writing notes on rates, credit and sovereign issuance.",
};

export default async function AboutPage() {
  const settings = await getSiteSettings();
  const paragraphs =
    settings?.aboutParagraphs && settings.aboutParagraphs.length > 0
      ? settings.aboutParagraphs
      : about.paragraphs;

  const email = about.contact.find((c) => c.label === "Email");
  const linkedIn = about.contact.find((c) => c.label === "LinkedIn");

  return (
    <div className="about-page">
      <div className="about-bio">
        <span className="about-eyebrow">{about.headline}</span>
        <h1 className="about-heading">A bit more about me</h1>
        <div className="about-bio-text">
          {paragraphs.map((p, i) => (
            <p key={i}>{p}</p>
          ))}
        </div>

        <section className="about-now" aria-label={rightNowMeta.eyebrow}>
          <span className="about-now-label">{rightNowMeta.eyebrow}</span>
          <div className="about-now-grid">
            {aboutNow.map((row) => {
              const inner = (
                <>
                  <span className="about-now-card-label">{row.label}</span>
                  <span className="about-now-card-value">{row.value}</span>
                  {row.note ? (
                    <span className="about-now-hint">{row.note}</span>
                  ) : null}
                </>
              );
              // Rows with an href become the whole card, so the target is a
              // comfortable click rather than a few words of text.
              return row.href ? (
                <a
                  key={row.label}
                  className="about-now-card"
                  href={row.href}
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  {inner}
                </a>
              ) : (
                <div key={row.label} className="about-now-card">
                  {inner}
                </div>
              );
            })}
          </div>
        </section>
      </div>

      <aside className="about-side">
        <LifeCarousel />

        <div className="about-contact">
          <span className="about-contact-label">Get in touch</span>
          {email ? (
            <a className="about-contact-email" href={email.href}>
              {email.value}
            </a>
          ) : null}
          {linkedIn ? (
            <a
              className="about-contact-link"
              href={linkedIn.href}
              target="_blank"
              rel="noopener noreferrer"
            >
              {linkedIn.value} →
            </a>
          ) : null}
        </div>
      </aside>
    </div>
  );
}
