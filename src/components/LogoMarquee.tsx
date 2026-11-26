import type { CSSProperties } from "react";
import Link from "next/link";

export type MarqueeItem = {
  name: string;
  domain: string;
  href?: string;
  /** Shown as a tooltip, e.g. the title of the note that covers a company. */
  hint?: string;
};

// Company icons come from Google's favicon service (the same source
// preipomedia.com uses), so there are no logo files to keep in the repo.
const iconUrl = (domain: string) =>
  `https://www.google.com/s2/favicons?domain=${encodeURIComponent(domain)}&sz=64`;

// A slowly scrolling strip of company icons and names. The list is rendered
// twice side by side and the track slides left by exactly one copy, so the
// loop is seamless. The second copy is hidden from screen readers and taken
// out of the tab order. Hover or keyboard focus pauses it, and with
// prefers-reduced-motion it becomes a static wrapped list.
export function LogoMarquee({
  id,
  title,
  items,
  reverse = false,
}: {
  id: string;
  title: string;
  items: MarqueeItem[];
  reverse?: boolean;
}) {
  if (items.length === 0) return null;

  const row = (copy: boolean) => (
    <ul className="marquee-row" aria-hidden={copy || undefined}>
      {items.map((item) => {
        const inner = (
          <>
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={iconUrl(item.domain)}
              alt=""
              width={28}
              height={28}
              loading="lazy"
              className="marquee-icon"
            />
            <span className="marquee-name">{item.name}</span>
          </>
        );
        return (
          <li key={item.name}>
            {item.href ? (
              <Link
                href={item.href}
                className="marquee-item"
                title={item.hint}
                tabIndex={copy ? -1 : undefined}
              >
                {inner}
              </Link>
            ) : (
              <span className="marquee-item">{inner}</span>
            )}
          </li>
        );
      })}
    </ul>
  );

  // Roughly constant speed whatever the list length: ~4.5s per item.
  const style = { "--marquee-duration": `${items.length * 4.5}s` } as CSSProperties;

  return (
    <section className="marquee-section" aria-labelledby={id}>
      <div className="home-head">
        <h2 className="home-head-title" id={id}>
          {title}
        </h2>
      </div>
      <div className={`marquee${reverse ? " marquee-reverse" : ""}`} style={style}>
        <div className="marquee-track">
          {row(false)}
          {row(true)}
        </div>
      </div>
    </section>
  );
}
