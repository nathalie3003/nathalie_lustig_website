import Image from "next/image";
import Link from "next/link";
import { dailyReads } from "@/content/dailyReads";
import { books } from "@/content/books";
import { railRole, readLatest, cvLabel, readsHead, readsNote } from "@/content/tone";
import { readHost } from "@/lib/readHost";

export function RightRail({ latestSlug }: { latestSlug?: string | null }) {
  const latestHref = latestSlug ? `/notes/${latestSlug}` : "/#notes";
  return (
    <aside className="home-rail">
      <div className="rail-card">
        <Image
          src="/rail-portrait.jpg"
          alt="Portrait of Nathalie Lustig"
          width={600}
          height={600}
          className="rail-portrait"
          priority
        />
        <p className="rail-role">{railRole}</p>
        <div className="rail-actions">
          <Link href={latestHref} className="l-btn l-btn-primary">
            {readLatest}
          </Link>
          <Link href="/cv" className="l-btn l-btn-ghost">
            {cvLabel}
          </Link>
        </div>

        <div className="rail-block">
          <span className="l-eyebrow rail-block-head">{readsHead}</span>
          <p className="rail-block-note">{readsNote}</p>
          <div className="reads">
            {dailyReads.map((r) => (
              <a
                className="read-link"
                key={r.name}
                href={r.url}
                target="_blank"
                rel="noopener noreferrer"
              >
                <span className="read-name">{r.name.replace(/\s*\(.*\)$/, "")}</span>
                <span className="read-url">{readHost(r.url)}</span>
              </a>
            ))}
          </div>
        </div>

        <div className="rail-block">
          <span className="l-eyebrow rail-block-head">On the bedside table</span>
          <p className="rail-block-note">The books I&apos;m working through right now.</p>
          <div className="books">
            {books.map((b) => (
              <div className="book" key={b.slotId}>
                {b.cover ? (
                  <Image
                    src={b.cover}
                    alt={`${b.title} cover`}
                    width={92}
                    height={136}
                    className="book-cover"
                  />
                ) : (
                  <span className="book-cover" aria-hidden="true" />
                )}
                <div className="book-meta">
                  <span className="book-status">{b.status}</span>
                  <span className="book-title">{b.title}</span>
                  <span className="book-author">{b.author}</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </aside>
  );
}
