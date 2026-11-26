// Companies the notes have actually written about, each pointing at the note
// that covers it. A company belongs here only when a note is substantially
// about its balance sheet, borrowing or credit, not when it is mentioned in
// passing. `domain` is the company's website, used to fetch its icon.
//
// If a slug stops matching a published note, the homepage drops that entry
// rather than linking to a 404.
export type CoveredCompany = { name: string; domain: string; slug: string };

export const companiesCovered: CoveredCompany[] = [
  { name: "Anthropic", domain: "anthropic.com", slug: "does-anthropics-ipo-make-them-a-more-attractive-credit" },
  { name: "Alphabet", domain: "abc.xyz", slug: "the-cost-of-googling-the-future" },
  { name: "Meta", domain: "meta.com", slug: "the-cost-of-googling-the-future" },
  { name: "Microsoft", domain: "microsoft.com", slug: "the-cost-of-googling-the-future" },
  { name: "CoreWeave", domain: "coreweave.com", slug: "the-cost-of-computing-the-future" },
  { name: "Nebius", domain: "nebius.com", slug: "ai-is-getting-more-efficient-what-does-that-mean-for-lenders" },
  { name: "Cloudflare", domain: "cloudflare.com", slug: "why-does-a-0-bond-cost-so-much" },
  { name: "Nvidia", domain: "nvidia.com", slug: "tech-giants-and-the-new-logic-of-bond-issuance" },
  { name: "Blue Owl", domain: "blueowl.com", slug: "the-gilded-age-of-private-credit" },
];
