import Image from "next/image";
import Link from "next/link";
import { dailyReads as fallbackDailyReads } from "@/content/dailyReads";
import { books as fallbackBooks } from "@/content/books";
import { railRole, readLatest, cvLabel, readsHead, readsNote } from "@/content/tone";
import { readHost } from "@/lib/readHost";
import { getBooks, getDailyReads } from "@/lib/queries";
import { urlFor } from "@/lib/sanity.client";

export async function RightRail({ latestSlug }: { latestSlug?: string | null }) {
  const latestHref = latestSlug ? `/notes/${latestSlug}` : "/#notes";

  const [cmsBooks, cmsReads] = await Promise.all([getBooks(), getDailyReads()]);

  const reads =
    cmsReads.length > 0
      ? cmsReads.map((r) => ({ key: r._id, name: r.name, url: r.url }))
      : fallbackDailyReads.map((r) => ({ key: r.name, name: r.name, url: r.url }));

  const books =
    cmsBooks.length > 0
      ? cmsBooks.map((b) => ({
          key: b._id,
          title: b.title,
          author: b.author,
          status: b.status,
          coverSrc: b.cover ? urlFor(b.cover).width(184).height(272).url() : undefined,
        }))
      : fallbackBooks.map((b) => ({
          key: b.slotId,
          title: b.title,
          author: b.author,
          status: b.status,
          coverSrc: b.cover,
        }));

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
            {reads.map((r) => (
              <a
                className="read-link"
                key={r.key}
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
              <div className="book" key={b.key}>
                {b.coverSrc ? (
                  <Image
                    src={b.coverSrc}
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
