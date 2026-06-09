import { about } from "@/content/about";

export const metadata = { title: "About — Nathalie Lustig" };

export default function AboutPage() {
  return (
    <article className="max-w-prose mx-auto px-6 py-16">
      <h1 className="font-serif text-4xl mb-8">{about.headline}</h1>
      {about.paragraphs.map((p, i) => (
        <p key={i} className="mb-5 text-lg leading-relaxed">{p}</p>
      ))}
      <a href="/cv.pdf" className="inline-block mt-6 bg-navy text-background px-4 py-2 rounded hover:no-underline hover:bg-warm">
        Download CV
      </a>
    </article>
  );
}
