#!/usr/bin/env node
/**
 * One-time seed: uploads the hardcoded fallback content in src/content/*
 * into Sanity as real documents. Idempotent — uses createOrReplace keyed
 * by stable _id. Re-running just overwrites.
 *
 * Usage:
 *   SANITY_WRITE_TOKEN=sk... node scripts/seed-sanity.mjs
 *
 * Get a token: https://sanity.io/manage → your project → API → Tokens
 *   → Add API token → Editor permissions.
 *
 * Reads NEXT_PUBLIC_SANITY_PROJECT_ID / _DATASET / _API_VERSION from env
 * (same vars the app uses). Loads .env.local if present.
 */
import { createClient } from "@sanity/client";
import { readFileSync, existsSync } from "node:fs";
import { resolve, dirname } from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = dirname(fileURLToPath(import.meta.url));
const repoRoot = resolve(__dirname, "..");

// Tiny .env.local loader (no dotenv dep)
const envFile = resolve(repoRoot, ".env.local");
if (existsSync(envFile)) {
  for (const line of readFileSync(envFile, "utf8").split("\n")) {
    const m = line.match(/^\s*([A-Z0-9_]+)\s*=\s*(.*)\s*$/);
    if (!m) continue;
    const [, k, v] = m;
    if (!process.env[k]) process.env[k] = v.replace(/^['"]|['"]$/g, "");
  }
}

const projectId = process.env.NEXT_PUBLIC_SANITY_PROJECT_ID;
const dataset = process.env.NEXT_PUBLIC_SANITY_DATASET;
const apiVersion = process.env.NEXT_PUBLIC_SANITY_API_VERSION || "2024-01-01";
const token = process.env.SANITY_WRITE_TOKEN;

if (!token) {
  console.error(`
Missing SANITY_WRITE_TOKEN.

Steps:
  1. Open https://sanity.io/manage and pick this project (${projectId || "msoznebi"}).
  2. API → Tokens → Add API token. Name it "seed", permissions Editor.
  3. Copy the token, then run:

       SANITY_WRITE_TOKEN=sk... node scripts/seed-sanity.mjs
`);
  process.exit(1);
}

if (!projectId || !dataset) {
  console.error("Missing NEXT_PUBLIC_SANITY_PROJECT_ID or _DATASET. Check .env.local.");
  process.exit(1);
}

const client = createClient({
  projectId,
  dataset,
  apiVersion,
  token,
  useCdn: false,
});

const kebab = (s) =>
  s
    .toLowerCase()
    .replace(/[()'"]/g, "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");

// --- Data (mirrors src/content/*) ----------------------------------------

const books = [
  {
    slotId: "book-age-of-innocence",
    title: "The Age of Innocence",
    author: "Edith Wharton",
    status: "Reading now",
  },
  {
    slotId: "book-investors-handbook",
    title: "The Investor's Handbook",
    author: "Graham Wallas",
    status: "Next up, back in London",
  },
];

const projects = [
  {
    slotId: "proj-lml",
    title: "Little Miss London Jewellery",
    url: "littlemisslondonjewellery.com",
    href: "https://littlemisslondonjewellery.com/",
    live: true,
    status: "Live",
    statusNote: "Updated as the brand grows",
    faviconLabel: "LML",
    description:
      "The jewellery label I founded as a teenager — handmade pieces, a soft relaunch in progress.",
  },
  {
    slotId: "proj-books",
    title: "Book Portfolio",
    url: "myportfolio.base44.app/Reviews",
    href: "https://myportfolio.base44.app/Reviews",
    live: true,
    status: "Live",
    statusNote: "Updated as I read",
    faviconLabel: "BP",
    description:
      "Short reviews of what I'm reading — behavioural finance, value investing, and the occasional novel.",
  },
];

const dailyReads = [
  { name: "Financial Times", url: "https://www.ft.com", short: "FT" },
  { name: "Bloomberg", url: "https://www.bloomberg.com", short: "BB" },
  {
    name: "Points of Return (John Authers)",
    url: "https://www.bloomberg.com/account/newsletters/points-of-return",
    short: "PoR",
  },
  { name: "Wall Street Journal", url: "https://www.wsj.com", short: "WSJ" },
  {
    name: "Eye on the Market (Michael Cembalest)",
    url: "https://privatebank.jpmorgan.com/nam/en/insights/markets-and-investing/eye-on-the-market",
    short: "EoM",
  },
];

const siteSettings = {
  aboutParagraphs: [
    "Hi, I'm Nathalie. I recently graduated from the London School of Economics with a BSc in Economics and Social Policy, and passed CFA Level I earlier this year. Last summer I worked at J.P. Morgan's Global Private Bank as a Summer Analyst — supporting bankers and investors on client portfolios, market analysis, and weekly updates for senior management. That's where the habit of writing this kind of thing started.",
    "What I keep coming back to are bonds — rates, credit, sovereign issuance, restructuring — the way these moving parts price the economy in real time. I write these notes whenever something in the market is worth thinking through, to put what I'm reading into my own words and stay close to a market I find genuinely interesting. On the side I'm building bond pricing models in Excel to make the theory click.",
    "Outside finance, I founded Little Miss London Jewellery during the pandemic — turned £40 of pocket money into over £7,000 in annual revenue at sixteen, and raised more than £1,300 for a domestic-abuse charity through it. I swam competitively for over twelve years, won eleven international medals (a Team GB record at the Maccabi European Games), and still coach part-time. When I'm not writing here, I'm usually reading — behavioural finance, value investing, fiction — and reviewing books on my portfolio.",
  ],
  contact: [
    { label: "Email", value: "nathalie.lustig03@gmail.com", href: "mailto:nathalie.lustig03@gmail.com" },
    { label: "LinkedIn", value: "linkedin.com/in/nathalielustig", href: "https://www.linkedin.com/in/nathalielustig/" },
    { label: "Phone", value: "+44 7741 467690", href: "tel:+447741467690" },
  ],
};

// --- Build docs ----------------------------------------------------------

const docs = [
  ...books.map((b, i) => ({
    _id: `book.${b.slotId}`,
    _type: "book",
    title: b.title,
    author: b.author,
    status: b.status,
    order: i,
    slotId: { _type: "slug", current: b.slotId },
  })),
  ...projects.map((p, i) => ({
    _id: `project.${p.slotId}`,
    _type: "project",
    slotId: { _type: "slug", current: p.slotId },
    title: p.title,
    url: p.url,
    href: p.href,
    live: p.live,
    status: p.status,
    statusNote: p.statusNote,
    faviconLabel: p.faviconLabel,
    description: p.description,
    order: i,
  })),
  ...dailyReads.map((r, i) => ({
    _id: `dailyRead.${kebab(r.name)}`,
    _type: "dailyRead",
    name: r.name,
    url: r.url,
    short: r.short,
    order: i,
  })),
  {
    _id: "siteSettings.main",
    _type: "siteSettings",
    aboutParagraphs: siteSettings.aboutParagraphs,
    contact: siteSettings.contact.map((c, i) => ({
      _key: `contact-${i}`,
      _type: "contactItem",
      ...c,
    })),
  },
];

// --- Upload --------------------------------------------------------------

console.log(`Seeding ${docs.length} documents to ${projectId}/${dataset}...`);

let tx = client.transaction();
for (const doc of docs) {
  tx = tx.createOrReplace(doc);
}

try {
  const result = await tx.commit();
  console.log(`✓ Committed transaction ${result.transactionId}`);
  for (const doc of docs) {
    console.log(`  - ${doc._id}`);
  }
  console.log(
    "\nDone. Open /studio and you'll see all four content types populated.",
  );
} catch (err) {
  console.error("Seed failed:", err.message || err);
  process.exit(1);
}
