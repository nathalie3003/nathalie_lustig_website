import Link from "next/link";
import { MarqueeTrack } from "./MarqueeTrack";

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
  `https://www.google.com/s2/favicons?domain=${encodeURIComponent(domain)}&sz=128`;

// A scrolling strip of company icons and names. The list is rendered twice
// side by side so the loop is seamless; the second copy is hidden from screen
// readers and taken out of the tab order. MarqueeTrack moves it (and lets it be
// dragged or swiped); with prefers-reduced-motion it is a static wrapped list.
export function LogoMarquee({
  id,
  title,
  items,
  subtitle,
  reverse = false,
}: {
  id: string;
  title: string;
  subtitle?: string;
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
              width={26}
              height={26}
              decoding="async"
              draggable={false}
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
                draggable={false}
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

  return (
    <section className="marquee-section" aria-labelledby={id}>
      <div className="marquee-head">
        <h2 className="marquee-title" id={id}>
          {title}
        </h2>
        {subtitle ? <p className="marquee-sub">{subtitle}</p> : null}
      </div>
      <MarqueeTrack reverse={reverse}>
        {row(false)}
        {row(true)}
      </MarqueeTrack>
    </section>
  );
}
