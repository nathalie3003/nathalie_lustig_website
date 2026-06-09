import { sanityClient } from "./sanity.client";

export type BondNoteCard = {
  _id: string;
  title: string;
  slug: string;
  publishedAt: string;
  excerpt?: string;
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
