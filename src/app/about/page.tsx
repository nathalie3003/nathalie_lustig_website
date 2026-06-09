import { about } from "@/content/about";

export const metadata = { title: "About — Nathalie Lustig" };

export default function AboutPage() {
  return (
    <article className="max-w-prose mx-auto px-6 py-16">
      <h1 className="font-serif text-4xl mb-8">{about.headline}</h1>
      {about.paragraphs.map((p, i) => (
        <p key={i} className="mb-5 text-lg leading-relaxed">{p}</p>
      ))}
      <a
        href="/cv.pdf"
        className="inline-block mt-6 bg-navy text-background px-4 py-2 rounded hover:no-underline hover:bg-warm"
      >
        Download CV
      </a>

      <section className="mt-16 pt-10 border-t border-rule">
        <h2 className="font-serif text-2xl mb-4">Get in touch</h2>
        <p className="text-ink/80 mb-6">
          Happy to chat about bonds, books, or anything in between.
        </p>
        <dl className="grid grid-cols-[auto_1fr] gap-x-6 gap-y-3 text-base">
          <dt className="smallcaps text-xs text-ink/60 self-center">Email</dt>
          <dd>
            <a href="mailto:nathalie.lustig03@gmail.com">nathalie.lustig03@gmail.com</a>
          </dd>

          <dt className="smallcaps text-xs text-ink/60 self-center">LinkedIn</dt>
          <dd>
            <a
              href="https://www.linkedin.com/in/nathalielustig/"
              target="_blank"
              rel="noopener noreferrer"
            >
              linkedin.com/in/nathalielustig
            </a>
          </dd>

          <dt className="smallcaps text-xs text-ink/60 self-center">Phone</dt>
          <dd>
            <a href="tel:+447741467690">+44 7741 467690</a>
          </dd>
        </dl>
      </section>
    </article>
  );
}
