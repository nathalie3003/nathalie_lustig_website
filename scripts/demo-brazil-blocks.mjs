// One-shot demo: place a few optional design blocks into the Brazil note so the
// editorial palette is visible on the live site. Additive and idempotent —
// inserts nothing if demo blocks are already present, and deletes no prose.
//
// Run:  node --env-file=.env.local scripts/demo-brazil-blocks.mjs
//
// Requires SANITY_API_WRITE_TOKEN in .env.local (Editor/write scope).

import { createClient } from "@sanity/client";

const SLUG = "brazil-s-winning-formation";

const projectId = process.env.NEXT_PUBLIC_SANITY_PROJECT_ID;
const dataset = process.env.NEXT_PUBLIC_SANITY_DATASET;
const apiVersion = process.env.NEXT_PUBLIC_SANITY_API_VERSION || "2024-01-01";
const token =
  process.env.SANITY_API_WRITE_TOKEN || process.env.sanity_api_write_token;

if (!projectId || !dataset) {
  console.error("Missing NEXT_PUBLIC_SANITY_PROJECT_ID / NEXT_PUBLIC_SANITY_DATASET.");
  process.exit(1);
}
if (!token) {
  console.error("Missing SANITY_API_WRITE_TOKEN in .env.local (needs Editor/write scope).");
  process.exit(1);
}

const client = createClient({ projectId, dataset, apiVersion, token, useCdn: false });

const key = () => Math.random().toString(36).slice(2, 12);
const blockText = (b) => (b.children ?? []).map((c) => c.text ?? "").join("");

const label = (text) => ({
  _type: "block",
  _key: key(),
  style: "sectionLabel",
  markDefs: [],
  children: [{ _type: "span", _key: key(), text, marks: [] }],
});

const dataStrip = () => ({
  _type: "dataStrip",
  _key: key(),
  items: [
    { _key: key(), value: "14.25%", label: "Selic rate (Jun 2026)" },
    { _key: key(), value: "4.7%", label: "IPCA inflation" },
    { _key: key(), value: "125bps", label: "5Y CDS spread" },
  ],
});

const doc = await client.fetch(
  `*[_type == "bondNote" && slug.current == $slug][0]{ _id, title, body }`,
  { slug: SLUG },
);
if (!doc) {
  console.error(`No bondNote found with slug "${SLUG}".`);
  process.exit(1);
}

const alreadyDone = doc.body.some(
  (b) => b._type === "dataStrip" || b.style === "sectionLabel",
);
if (alreadyDone) {
  console.log("Demo blocks already present — skipping.");
  process.exit(0);
}

const out = [];
for (const b of doc.body) {
  const t = b._type === "block" ? blockText(b).trim() : "";
  if (b.style === "h2" && t === "The Macro Backdrop") out.push(label("Rates & Policy"));
  if (b.style === "h2" && t === "The Trade") out.push(label("Positioning"));
  out.push(b);
  if (b._type === "block" && b.style === "normal" && blockText(b).startsWith("The Banco Central do Brasil")) {
    out.push(dataStrip());
  }
}

console.log(`Inserting demo blocks into "${doc.title}"…`);
await client.patch(doc._id).set({ body: out }).commit();
console.log("✓ Done. Live within ~60s (ISR revalidate).");
