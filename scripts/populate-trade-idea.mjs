// One-shot: fill the Trade Snapshot (sidebar) fields on a Trade Idea note.
//
// It ONLY sets the snapshot fields below — it does NOT touch the article body.
// The VALUES object is placeholder data from the design hand-off; edit it to
// match your actual note before running (or tweak later in /studio).
//
// Run:  node --env-file=.env.local scripts/populate-trade-idea.mjs
//
// Requires SANITY_API_WRITE_TOKEN in .env.local (Editor/write scope). Create one at
// https://www.sanity.io/manage  → your project → API → Tokens → Add API token.

import { createClient } from "@sanity/client";

const SLUG = "brazil-s-winning-formation"; // the note to populate

const VALUES = {
  tradeRecommendation: "BUY / LONG", // BUY / LONG | SELL / SHORT | HOLD
  instrument: "Brazil 2035 Sovereign Bond",
  instrumentSub: "NTN-B · 10Y Benchmark · BRL",
  horizon: "6M", // 3M | 6M | 12M
  nominalYield: "12.4%",
  realYield: "6.2%",
  realYieldSub: "CPI 3.8%",
  view: "Bullish duration",
  conviction: 4, // 1–5
  keyPoints: [
    "Carry attractive at 6.2% real yield",
    "BCB cutting cycle priced to begin Q3",
    "Inflation below 4% ceiling and falling",
    "130bps real yield premium vs EM peers",
  ],
  keyRisks: [
    "Inflation re-acceleration delays BCB",
    "Fiscal slippage ahead of 2026 elections",
    "BRL weakness beyond 5.40",
  ],
  oneLiner:
    "Position for yield compression as Brazil's disinflation unlocks a BCB easing window the market is underpricing.",
};

const projectId = process.env.NEXT_PUBLIC_SANITY_PROJECT_ID;
const dataset = process.env.NEXT_PUBLIC_SANITY_DATASET;
const apiVersion = process.env.NEXT_PUBLIC_SANITY_API_VERSION || "2024-01-01";
const token =
  process.env.SANITY_API_WRITE_TOKEN || process.env.sanity_api_write_token;

if (!projectId || !dataset) {
  console.error("Missing NEXT_PUBLIC_SANITY_PROJECT_ID / NEXT_PUBLIC_SANITY_DATASET. Run with: node --env-file=.env.local scripts/populate-trade-idea.mjs");
  process.exit(1);
}
if (!token) {
  console.error("Missing SANITY_API_WRITE_TOKEN in .env.local (needs Editor/write scope).");
  process.exit(1);
}

const client = createClient({ projectId, dataset, apiVersion, token, useCdn: false });

const doc = await client.fetch(
  `*[_type == "bondNote" && slug.current == $slug][0]{ _id, title, category }`,
  { slug: SLUG },
);

if (!doc) {
  console.error(`No bondNote found with slug "${SLUG}".`);
  process.exit(1);
}
if (doc.category !== "trade-ideas") {
  console.error(`Note "${doc.title}" has category "${doc.category}", not "trade-ideas". Set its category to Trade Ideas in /studio first.`);
  process.exit(1);
}

const res = await client.patch(doc._id).set(VALUES).commit();
console.log(`✓ Populated Trade Snapshot on "${doc.title}" (${res._id}). Live within ~60s (ISR revalidate).`);
