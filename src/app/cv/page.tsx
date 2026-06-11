import Link from "next/link";
import { about } from "@/content/about";
import { hero } from "@/content/tone";

export const metadata = {
  title: "Curriculum Vitae · Nathalie Lustig",
};

export default function CVPage() {
  return (
    <div className="page-full about" style={{ padding: "40px 56px 16px" }}>
      <Link href="/#top" className="read-back">← Back to site</Link>
      <span className="l-kicker">Curriculum Vitae</span>
      <h1 className="about-title">Nathalie Lustig</h1>
      <p className="hero-lead" style={{ marginTop: "10px" }}>{hero.creds}</p>
      <div style={{ marginTop: "22px", display: "flex", gap: "12px", flexWrap: "wrap" }}>
        <a className="l-btn l-btn-primary" href="/cv.pdf" download>
          Download PDF
        </a>
        <Link href="/#about" className="l-btn l-btn-ghost">
          Read the long version →
        </Link>
      </div>
      <div className="about-bio" style={{ marginTop: "34px", maxWidth: "640px" }}>
        {about.paragraphs.map((p, i) => (
          <p key={i}>{p}</p>
        ))}
      </div>
    </div>
  );
}
