// One-shot: insert the interactive stress test into "Flint and Steel", at the
// very end of the body, after "Who Gets Burned?" and before the Sources list.
// Idempotent.
//
// Run:  node --env-file=.env.local scripts/add-stress-test-flint-and-steel.mjs

import { createClient } from "@sanity/client";
import { randomUUID } from "node:crypto";

const client = createClient({
  projectId: process.env.NEXT_PUBLIC_SANITY_PROJECT_ID,
  dataset: process.env.NEXT_PUBLIC_SANITY_DATASET,
  apiVersion: process.env.NEXT_PUBLIC_SANITY_API_VERSION || "2024-01-01",
  token: process.env.SANITY_API_WRITE_TOKEN,
  useCdn: false,
});

const note = await client.fetch(
  `*[_type == "bondNote" && slug.current == "flint-and-steel-ai-debt-boom-bond-market-crisis"][0]{ _id, body }`,
);
if (note.body.some((b) => b._type === "stressTest")) {
  console.log("Stress test already present. Nothing to do.");
  process.exit(0);
}

const block = {
  _type: "stressTest",
  _key: randomUUID().slice(0, 12),
  title: "Strike the flint and the steel",
  intro:
    "Raise Treasury yields, widen AI credit spreads, or both, and see what happens to an AI infrastructure bond and to the cost of borrowing again.",
  treasuryShock: 100,
  spreadShock: 100,
  duration: 5,
  startYield: 6.5,
  caveat:
    "A first-order estimate using modified duration (ΔP/P ≈ −D × Δy), before convexity, assuming the full shock passes through to the bond's yield. The price falls straight away; the higher borrowing cost only bites when the company issues new debt or refinances, since existing fixed-rate debt does not become more expensive to service. Illustrative, not a forecast.",
};
if (JSON.stringify(block).includes("—")) throw new Error("em dash in copy");

await client
  .patch(note._id)
  .append("body", [block])
  .commit();
console.log(`✓ Appended stress test to the end of ${note._id}`);
