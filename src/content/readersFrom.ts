// Firms whose people read the notes, taken from LinkedIn post and follower
// analytics (company breakdown). Only list a firm that actually appears in
// those analytics. People at these firms are subscribers, which is how the
// section's subtitle words it. `domain` is the firm's website, used to fetch
// its icon.
export type ReaderFirm = { name: string; domain: string };

export const readersFrom: ReaderFirm[] = [
  { name: "J.P. Morgan", domain: "jpmorgan.com" },
  { name: "Goldman Sachs", domain: "goldmansachs.com" },
  { name: "BlackRock", domain: "blackrock.com" },
  { name: "Bank of America", domain: "bankofamerica.com" },
  { name: "Barclays", domain: "barclays.com" },
  { name: "Lazard", domain: "lazard.com" },
  { name: "Bloomberg", domain: "bloomberg.com" },
  { name: "McKinsey & Company", domain: "www.mckinsey.com" },
  { name: "Legal & General", domain: "legalandgeneral.com" },
  { name: "Berenberg", domain: "berenberg.com" },
  { name: "WTW", domain: "wtwco.com" },
  { name: "Dell Technologies", domain: "dell.com" },
  { name: "Davies", domain: "davies-group.com" },
  { name: "Plural Strategy", domain: "pluralstrategy.com" },
];
