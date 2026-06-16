// Single source of truth for note categories.
// `slug` is the value stored in Sanity and used in URLs.
// `label` is the display string.

export type CategorySlug =
  | "rates-macro"
  | "credit"
  | "new-issues"
  | "private-credit"
  | "trade-ideas";

export type Category = {
  slug: CategorySlug;
  label: string;
  blurb: string;
};

export const CATEGORIES: Category[] = [
  { slug: "rates-macro", label: "Rates & Macro", blurb: "Curves, central banks, the macro view" },
  { slug: "credit", label: "Credit", blurb: "Spreads, sectors, secondary flows" },
  { slug: "new-issues", label: "New Issues", blurb: "Primary market, books, allocation" },
  { slug: "private-credit", label: "Private Credit", blurb: "Direct lending, funds, structure" },
  { slug: "trade-ideas", label: "Trade Ideas", blurb: "Positioning and convictions" },
];

// Legacy slugs from the old taxonomy → map to closest current category.
// Keeps existing CMS content rendering until it's re-tagged.
const LEGACY: Record<string, CategorySlug> = {
  rates: "rates-macro",
  sovereigns: "credit",
};

export function categoryFromSlug(raw?: string): Category | null {
  if (!raw) return null;
  const key = raw.toLowerCase();
  const slug = (LEGACY[key] ?? key) as CategorySlug;
  return CATEGORIES.find((c) => c.slug === slug) ?? null;
}

// Backwards-compatible shape used by NoteRow.
export function noteCat(category?: string): { cat: string } {
  return { cat: categoryFromSlug(category)?.label ?? "Note" };
}
