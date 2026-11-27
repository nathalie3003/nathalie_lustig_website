import Link from "next/link";

type Company = { name: string; logo: string; note: string };
type Reader = { name: string; logo: string };

// Issuers and borrowers the notes have taken apart. `note` is the title of the
// note each one opens; it is matched against the published notes at render, so
// a renamed or unpublished note falls back to the archive instead of 404ing.
export const COVERED: Company[] = [
  { name: "Anthropic", logo: "anthropic.png", note: "A $1.5tn Valuation. But is Anthropic Investment Grade?" },
  { name: "Alphabet", logo: "alphabet.png", note: "The Cost of Googling the Future" },
  { name: "Meta", logo: "meta.jpg", note: "The Cost of Googling the Future" },
  { name: "Microsoft", logo: "microsoft.png", note: "The Cost of Googling the Future" },
  { name: "CoreWeave", logo: "coreweave.png", note: "The Cost of Computing the Future" },
  { name: "Nebius", logo: "nebius.png", note: "AI is Getting More Efficient. What Does That Mean for Lenders?" },
  { name: "Cloudflare", logo: "cloudflare.png", note: "Why Does a 0% Bond Cost So Much?" },
  { name: "Nvidia", logo: "nvidia.png", note: "Tech Giants and the New Logic of Bond Issuance" },
  { name: "Blue Owl", logo: "blue-owl.png", note: "The Gilded Age of Private Credit" },
];

// Firms whose people read the notes, from LinkedIn analytics.
export const READERS: Reader[] = [
  { name: "J.P. Morgan", logo: "jpmorgan.png" },
  { name: "Goldman Sachs", logo: "goldman-sachs.png" },
  { name: "BlackRock", logo: "blackrock.png" },
  { name: "Bank of America", logo: "bank-of-america.png" },
  { name: "Barclays", logo: "barclays.png" },
  { name: "Lazard", logo: "lazard.png" },
  { name: "Bloomberg", logo: "bloomberg.png" },
  { name: "McKinsey & Company", logo: "mckinsey.jpg" },
  { name: "Legal & General", logo: "legal-general.png" },
  { name: "Berenberg", logo: "berenberg.png" },
  { name: "WTW", logo: "wtw.png" },
  { name: "Dell Technologies", logo: "dell.png" },
  { name: "Davies", logo: "davies.png" },
  { name: "Plural Strategy", logo: "plural-strategy.png" },
];

const norm = (s: string) => s.toLowerCase().replace(/[^a-z0-9]/g, "");

function Pill({ name, logo }: { name: string; logo: string }) {
  return (
    <>
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img src={`/logos/${logo}`} alt="" width={26} height={26} className="logo-pill-img" />
      <span>{name}</span>
    </>
  );
}

/**
 * A row that drifts sideways forever. The list is rendered twice and the track
 * slides by exactly half its width, so the loop has no seam. The second copy is
 * hidden from assistive tech and the keyboard.
 */
function Marquee({
  children,
  reverse,
  label,
}: {
  children: (copy: 0 | 1) => React.ReactNode;
  reverse?: boolean;
  label: string;
}) {
  return (
    <div className="logo-marquee" role="region" aria-label={label}>
      <div className={`logo-track${reverse ? " is-reverse" : ""}`}>
        <div className="logo-set">{children(0)}</div>
        <div className="logo-set" aria-hidden="true">
          {children(1)}
        </div>
      </div>
    </div>
  );
}

export function LogoBand({ notes }: { notes: { slug: string; title: string }[] }) {
  const slugFor = new Map(notes.map((n) => [norm(n.title), n.slug]));
  const hrefFor = (title: string) => {
    const slug = slugFor.get(norm(title));
    return slug ? `/notes/${slug}` : "/notes";
  };

  return (
    <section className="logo-band" aria-labelledby="covered-title">
      <div className="logo-band-inner">
        <div className="logo-head">
          <h2 id="covered-title" className="logo-title">Companies covered</h2>
          <p className="logo-sub">Issuers and borrowers the notes have taken apart. Each opens its note.</p>
        </div>
        <Marquee label="Companies covered">
          {(copy) =>
            COVERED.map((c) => (
              <Link
                key={c.name}
                href={hrefFor(c.note)}
                className="logo-pill is-link"
                title={c.note}
                aria-label={`${c.name}: read ${c.note}`}
                tabIndex={copy ? -1 : undefined}
              >
                <Pill name={c.name} logo={c.logo} />
              </Link>
            ))
          }
        </Marquee>

        <div className="logo-rule" aria-hidden="true" />

        <div className="logo-head">
          <h2 className="logo-title">Readers from</h2>
          <p className="logo-sub">People at these firms read the notes, from LinkedIn analytics.</p>
        </div>
        <Marquee label="Readers from" reverse>
          {() =>
            READERS.map((r) => (
              <span key={r.name} className="logo-pill">
                <Pill name={r.name} logo={r.logo} />
              </span>
            ))
          }
        </Marquee>
      </div>
    </section>
  );
}
