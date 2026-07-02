import { sanityClient } from "./sanity.client";

export type BondNoteCard = {
  _id: string;
  title: string;
  slug: string;
  publishedAt: string;
  excerpt?: string;
  category?: string;
  coverImage?: { asset: { _ref: string } };
};

export type BondNote = BondNoteCard & {
  body: unknown[];
};

const CARD_FIELDS = `
  _id,
  title,
  "slug": slug.current,
  publishedAt,
  excerpt,
  category,
  coverImage
`;

export async function getLatestNotes(limit = 3): Promise<BondNoteCard[]> {
  return sanityClient.fetch(
    `*[_type == "bondNote"] | order(publishedAt desc)[0...$limit]{ ${CARD_FIELDS} }`,
    { limit },
    { next: { revalidate: 60, tags: ["bondNote"] } },
  );
}

export async function getAllNotes(): Promise<BondNoteCard[]> {
  return sanityClient.fetch(
    `*[_type == "bondNote"] | order(publishedAt desc){ ${CARD_FIELDS} }`,
    {},
    { next: { revalidate: 60, tags: ["bondNote"] } },
  );
}

export async function getNoteBySlug(slug: string): Promise<BondNote | null> {
  return sanityClient.fetch(
    `*[_type == "bondNote" && slug.current == $slug][0]{ ${CARD_FIELDS}, body }`,
    { slug },
    { next: { revalidate: 60, tags: ["bondNote"] } },
  );
}

export async function getAllNoteSlugs(): Promise<string[]> {
  const slugs: string[] = await sanityClient.fetch(
    `*[_type == "bondNote" && defined(slug.current)].slug.current`,
  );
  return slugs;
}

// --- Books ---------------------------------------------------------------

export type Book = {
  _id: string;
  slotId: string;
  title: string;
  author: string;
  status: string;
  cover?: { asset: { _ref: string } };
};

export async function getBooks(): Promise<Book[]> {
  return sanityClient.fetch(
    `*[_type == "book"] | order(order asc, title asc){
      _id,
      "slotId": slotId.current,
      title,
      author,
      status,
      cover
    }`,
    {},
    { next: { revalidate: 60, tags: ["book"] } },
  );
}

// --- Projects ------------------------------------------------------------

export type Project = {
  _id: string;
  slotId: string;
  title: string;
  url: string;
  href: string;
  live: boolean;
  status: string;
  statusNote: string;
  faviconLabel: string;
  description: string;
  image?: { asset: { _ref: string } };
};

export async function getProjects(): Promise<Project[]> {
  return sanityClient.fetch(
    `*[_type == "project"] | order(order asc, title asc){
      _id,
      "slotId": slotId.current,
      title,
      url,
      href,
      live,
      status,
      statusNote,
      faviconLabel,
      description,
      image
    }`,
    {},
    { next: { revalidate: 60, tags: ["project"] } },
  );
}

// --- Daily Reads ---------------------------------------------------------

export type DailyRead = {
  _id: string;
  name: string;
  url: string;
  short: string;
};

export async function getDailyReads(): Promise<DailyRead[]> {
  return sanityClient.fetch(
    `*[_type == "dailyRead"] | order(order asc, name asc){
      _id,
      name,
      url,
      short
    }`,
    {},
    { next: { revalidate: 60, tags: ["dailyRead"] } },
  );
}

// --- Site Settings -------------------------------------------------------

export type SiteSettings = {
  aboutParagraphs: string[];
  contact: { label: string; value: string; href: string }[];
};

export async function getSiteSettings(): Promise<SiteSettings | null> {
  return sanityClient.fetch(
    `*[_type == "siteSettings"][0]{
      aboutParagraphs,
      contact[]{ label, value, href }
    }`,
    {},
    { next: { revalidate: 60, tags: ["siteSettings"] } },
  );
}

export async function getAdjacentNotes(
  slug: string,
): Promise<{ prev: BondNoteCard | null; next: BondNoteCard | null }> {
  const all = await getAllNotes();
  const idx = all.findIndex((n) => n.slug === slug);
  if (idx === -1) return { prev: null, next: null };
  // Notes are ordered newest-first: "previous" is the older note (idx + 1),
  // "next" is the newer one (idx - 1). No wrap-around at the ends.
  return {
    prev: all[idx + 1] ?? null,
    next: all[idx - 1] ?? null,
  };
}
