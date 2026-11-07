import type { MetadataRoute } from "next";
import { getAllNotes } from "@/lib/queries";

const SITE_URL = "https://thebasispoint.finance";

// Refresh at most once a minute, matching the notes' revalidate window.
export const revalidate = 60;

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const notes = await getAllNotes();
  const latest = notes[0] ? new Date(notes[0].publishedAt) : new Date();

  const pages: MetadataRoute.Sitemap = [
    { url: SITE_URL, lastModified: latest, changeFrequency: "weekly", priority: 1 },
    { url: `${SITE_URL}/notes`, lastModified: latest, changeFrequency: "weekly", priority: 0.9 },
    { url: `${SITE_URL}/projects`, changeFrequency: "monthly", priority: 0.6 },
    { url: `${SITE_URL}/about`, changeFrequency: "monthly", priority: 0.6 },
  ];

  const notePages: MetadataRoute.Sitemap = notes
    .filter((n) => n.slug)
    .map((n) => ({
      url: `${SITE_URL}/notes/${n.slug}`,
      lastModified: new Date(n.publishedAt),
      changeFrequency: "monthly",
      priority: 0.8,
    }));

  return [...pages, ...notePages];
}
