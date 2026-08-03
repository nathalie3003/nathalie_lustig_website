import { getAllNotes } from "@/lib/queries";
import { noteCat } from "@/lib/noteCat";

const SITE_URL = "https://thebasispoint.finance";

// Rebuild the feed at most once a minute, matching the notes' revalidate window.
export const revalidate = 60;

function escapeXml(input: string): string {
  return input
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&apos;");
}

export async function GET() {
  const notes = await getAllNotes();

  const items = notes
    .map((n) => {
      const url = `${SITE_URL}/notes/${n.slug}`;
      const pubDate = new Date(n.publishedAt).toUTCString();
      const category = noteCat(n.category).cat;
      const description = n.excerpt
        ? `\n      <description>${escapeXml(n.excerpt)}</description>`
        : "";
      return `    <item>
      <title>${escapeXml(n.title)}</title>
      <link>${url}</link>
      <guid isPermaLink="true">${url}</guid>
      <pubDate>${pubDate}</pubDate>
      <category>${escapeXml(category)}</category>${description}
    </item>`;
    })
    .join("\n");

  const lastBuildDate = notes[0]
    ? new Date(notes[0].publishedAt).toUTCString()
    : new Date().toUTCString();

  const xml = `<?xml version="1.0" encoding="UTF-8"?>
<rss version="2.0" xmlns:atom="http://www.w3.org/2005/Atom">
  <channel>
    <title>The Basis Point</title>
    <link>${SITE_URL}</link>
    <description>Notes on rates, credit, and sovereign issuance by Nathalie Lustig.</description>
    <language>en</language>
    <atom:link href="${SITE_URL}/rss.xml" rel="self" type="application/rss+xml" />
    <lastBuildDate>${lastBuildDate}</lastBuildDate>
${items}
  </channel>
</rss>`;

  return new Response(xml, {
    headers: {
      "Content-Type": "application/rss+xml; charset=utf-8",
      "Cache-Control": "public, s-maxage=3600, stale-while-revalidate=86400",
    },
  });
}
