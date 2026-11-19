import type { CategorySlug } from "@/lib/noteCat";

// Small line icons for the note categories. Drawn on a 20px grid with a single
// stroke weight so they sit quietly beside the serif labels; colour comes from
// currentColor, so each menu decides how loud they are.
const PATHS: Record<CategorySlug | "all", React.ReactNode> = {
  // An upward-sloping yield curve over an axis.
  "rates-macro": (
    <>
      <path d="M3 3.5v13h14" />
      <path d="M5.5 14c2.5-1 4-3.5 6-6.5S15 4.5 16.5 4.5" />
    </>
  ),
  // Two lines with the gap between them: the spread.
  credit: (
    <>
      <path d="M3 7.5c3-1.5 5.5-2 8-1.5s4 .5 6-.5" />
      <path d="M3 13.5c3-.5 5.5 0 8 .5s4 0 6-1" />
      <path d="M10 7v6" strokeDasharray="1.2 1.6" />
    </>
  ),
  // A fresh term sheet with a plus: something coming to market.
  "new-issues": (
    <>
      <path d="M5 2.5h6.5L15 6v11.5H5z" />
      <path d="M11.5 2.5V6H15" />
      <path d="M10 9v5.5M7.25 11.75h5.5" />
    </>
  ),
  // A padlock: privately placed, held to maturity.
  "private-credit": (
    <>
      <rect x="4" y="8.5" width="12" height="9" rx="1.5" />
      <path d="M6.75 8.5V6a3.25 3.25 0 0 1 6.5 0v2.5" />
      <path d="M10 12v2.5" />
    </>
  ),
  // A crosshair: a view taken, a level picked.
  "trade-ideas": (
    <>
      <circle cx="10" cy="10" r="6" />
      <circle cx="10" cy="10" r="1.6" />
      <path d="M10 1.5v3M10 15.5v3M1.5 10h3M15.5 10h3" />
    </>
  ),
  // A short stack of pages.
  all: (
    <>
      <path d="M6 2.5h9.5v12" />
      <rect x="3.5" y="5" width="9.5" height="12.5" rx="0.5" />
      <path d="M6 9h4.5M6 12h4.5" />
    </>
  ),
};

export function CategoryIcon({
  slug,
  className,
}: {
  slug: CategorySlug | "all";
  className?: string;
}) {
  return (
    <svg
      viewBox="0 0 20 20"
      width="18"
      height="18"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.4"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
      focusable="false"
      className={className}
    >
      {PATHS[slug]}
    </svg>
  );
}
