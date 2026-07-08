// One-shot: convert the Brazil note's bold "headers" into real Heading 2
// blocks so the sidebar table of contents renders.
//
// Matches target blocks by their text (not array index) so it's safe to
// re-run and won't touch anything else. Prints a before/after plan.
//
// Run:  node --env-file=.env.local scripts/convert-brazil-headers.mjs
//
// Requires SANITY_API_WRITE_TOKEN in .env.local (Editor/write scope).

import { createClient } from "@sanity/client";

const SLUG = "brazil-s-winning-formation";

// Blocks to turn into h2. `match` is the exact current block text; `heading`
// is the text the h2 should carry (TOC label + anchor source).
const CONVERSIONS = [
  { match: "The Macro Backdrop", heading: "The Macro Backdrop" },
  { match: "The trade is simple: control the midfield", heading: "The Trade" },
];

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

const blockText = (b) =>
  (b.children ?? []).map((c) => c.text ?? "").join("");

const doc = await client.fetch(
  `*[_type == "bondNote" && slug.current == $slug][0]{ _id, title, body }`,
  { slug: SLUG },
);

if (!doc) {
  console.error(`No bondNote found with slug "${SLUG}".`);
  process.exit(1);
}

let changed = 0;
const newBody = doc.body.map((b) => {
  if (b._type !== "block") return b;
  const text = blockText(b).trim();
  const conv = CONVERSIONS.find((c) => c.match === text);
  if (!conv) return b;
  if (b.style === "h2" && text === conv.heading) return b; // already done
  changed += 1;
  console.log(`  • "${text}"  →  H2 "${conv.heading}"`);
  return {
    ...b,
    style: "h2",
    // Single clean span; h2 weight comes from the heading style, so drop
    // any inline strong marks.
    children: [
      {
        _type: "span",
        _key: (b.children?.[0]?._key ?? "span") + "-h2",
        text: conv.heading,
        marks: [],
      },
    ],
  };
});

if (changed === 0) {
  console.log(`Nothing to convert on "${doc.title}" — already up to date.`);
  process.exit(0);
}

console.log(`\nConverting ${changed} block(s) on "${doc.title}"…`);
await client.patch(doc._id).set({ body: newBody }).commit();
console.log(`✓ Done. TOC will appear within ~60s (ISR revalidate).`);
