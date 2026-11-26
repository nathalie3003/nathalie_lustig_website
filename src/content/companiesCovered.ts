// Companies the notes have actually written about, each pointing at the note
// that covers it. A company belongs here only when a note is substantially
// about its balance sheet, borrowing or credit, not when it is mentioned in
// passing. Order is the order shown on the homepage.
//
// If a slug stops matching a published note, the homepage drops that entry
// rather than linking to a 404.
export type CoveredCompany = { name: string; slug: string };

export const companiesCovered: CoveredCompany[] = [
  { name: "Anthropic", slug: "does-anthropics-ipo-make-them-a-more-attractive-credit" },
  { name: "Alphabet", slug: "the-cost-of-googling-the-future" },
  { name: "Meta", slug: "the-cost-of-googling-the-future" },
  { name: "Microsoft", slug: "the-cost-of-googling-the-future" },
  { name: "CoreWeave", slug: "the-cost-of-computing-the-future" },
  { name: "Nebius", slug: "ai-is-getting-more-efficient-what-does-that-mean-for-lenders" },
  { name: "Cloudflare", slug: "why-does-a-0-bond-cost-so-much" },
  { name: "Nvidia", slug: "tech-giants-and-the-new-logic-of-bond-issuance" },
  { name: "Blue Owl", slug: "the-gilded-age-of-private-credit" },
];
