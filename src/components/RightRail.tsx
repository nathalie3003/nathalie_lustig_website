import Image from "next/image";
import { dailyReads as fallbackDailyReads } from "@/content/dailyReads";
import { books as fallbackBooks } from "@/content/books";
import { readsHead, readsNote } from "@/content/tone";
import { rightNow, rightNowMeta } from "@/content/rightNow";
import { getBooks, getDailyReads } from "@/lib/queries";
import { urlFor } from "@/lib/sanity.client";

// The rail sits beside the note list, and a grid row is as tall as its taller
// column. "Right now" is the tallest block in the rail, so showing all of it
// here would leave dead space under the notes. The homepage takes the first
// few rows and the About page carries the full set, which is where the
// personal detail belongs anyway. Ordering in content/rightNow.ts therefore
// decides what surfaces on the homepage.
const HOME_RIGHT_NOW_ROWS = 4;

export async function RightRail() {
  const [cmsBooks, cmsReads] = await Promise.all([getBooks(), getDailyReads()]);

  const reads =
    cmsReads.length > 0
      ? cmsReads.map((r) => ({ key: r._id, name: r.name, url: r.url, short: r.short }))
      : fallbackDailyReads.map((r) => ({ key: r.name, name: r.name, url: r.url, short: r.short }));

  const books =
    cmsBooks.length > 0
      ? cmsBooks.map((b) => ({
          key: b._id,
          title: b.title,
          author: b.author,
          status: b.status,
          coverSrc: b.cover ? urlFor(b.cover).width(288).height(432).url() : undefined,
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
        <div className="rail-id">
          <Image
            src="/rail-portrait.jpg"
            alt="Nathalie Lustig"
            width={176}
            height={176}
            className="rail-portrait"
          />
          <div>
            <div className="rail-name">Nathalie Lustig</div>
            <div className="rail-cred">
              LSE Economics · CFA Level I
              <br />
              London
            </div>
          </div>
        </div>
        <div className="rail-divider" aria-hidden="true" />
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
                <span className="read-url">{r.short}</span>
              </a>
            ))}
          </div>
        </div>

        <div className="rail-block">
          <span className="l-eyebrow rail-block-head">{rightNowMeta.eyebrow}</span>
          <div className="rail-now">
            {rightNow.slice(0, HOME_RIGHT_NOW_ROWS).map((r) => (
              <div className="rail-now-row" key={r.label}>
                <div className="rail-now-label">{r.label}</div>
                <div className="rail-now-value">{r.value}</div>
              </div>
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
                    width={192}
                    height={288}
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
