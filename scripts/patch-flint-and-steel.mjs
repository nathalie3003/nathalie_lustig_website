// One-shot follow-up to publish-flint-and-steel.mjs: move the note to Rates &
// Macro, add the cover image, and standardise "neo-clouds"/"neo clouds" to
// "neoclouds" across the body.
//
// Run:  node --env-file=.env.local scripts/patch-flint-and-steel.mjs <cover-image-path>

import { createClient } from "@sanity/client";
import { readFileSync } from "node:fs";
import { basename } from "node:path";

const coverPath = process.argv[2];
if (!coverPath) throw new Error("pass the cover image path");

const client = createClient({
  projectId: process.env.NEXT_PUBLIC_SANITY_PROJECT_ID,
  dataset: process.env.NEXT_PUBLIC_SANITY_DATASET,
  apiVersion: process.env.NEXT_PUBLIC_SANITY_API_VERSION || "2024-01-01",
  token: process.env.SANITY_API_WRITE_TOKEN,
  useCdn: false,
});

const SLUG = "flint-and-steel-ai-debt-boom-bond-market-crisis";
const note = await client.fetch(`*[_type == "bondNote" && slug.current == $s][0]{ _id, body }`, { s: SLUG });
if (!note) throw new Error("note not found");

let fixes = 0;
const body = note.body.map((b) =>
  b._type !== "block"
    ? b
    : {
        ...b,
        children: b.children.map((c) => {
          const text = c.text.replace(/neo[- ]clouds/gi, () => (fixes++, "neoclouds"));
          return { ...c, text };
        }),
      },
);

const asset = await client.assets.upload("image", readFileSync(coverPath), { filename: basename(coverPath) });

await client
  .patch(note._id)
  .set({
    category: "rates-macro",
    body,
    coverImage: { _type: "image", asset: { _type: "reference", _ref: asset._id } },
  })
  .commit();

console.log(`✓ Patched ${note._id}: rates-macro, cover ${asset._id}, ${fixes} neoclouds fixes`);
