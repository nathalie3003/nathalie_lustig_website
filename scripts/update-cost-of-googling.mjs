// One-shot: replace the body of "The Cost of Googling the Future" with
// Nathalie's rewrite (7 Nov 2026), refresh its sources, and add the glossary
// terms the piece leans on.
//
// Body prose is her text verbatim. The note keeps its _id, cover, publish date
// and the two exhibit images already uploaded; only body, excerpt and sources
// are replaced. A backup of the current note is written first.
//
// Run:  node --env-file=.env.local scripts/update-cost-of-googling.mjs [--dry]

import { createClient } from "@sanity/client";
import { writeFileSync, mkdirSync } from "node:fs";
import { randomUUID } from "node:crypto";

const DRY = process.argv.includes("--dry");
const SLUG = "the-cost-of-googling-the-future";

const PARAS = [
  "The Cost of Googling the Future",
  "Big tech hyperscalers are still borrowing billions to finance the AI buildout, bond investors are starting to question the price of financing the AI revolution.",
  "The AI Borrowing Spree",
  "In previous weeks, I reflected on the direction of hyperscaler issuance and whether the scale of AI investment could eventually lead to a crisis. However, continued reliance on leverage has revealed new ways in which investors are balancing the trade-off between participating in the AI buildout and associated credit risks.",
  "What triggered this reassessment? In the last week alone, the big tech hyperscalers returned to the bond market with significant new offerings. The deals reveal differentiated investor responses: steeper credit curves, wider NICs and a growing divergence between the issuers’ official credit ratings and the spreads investors are demanding.",
  "Alphabet issued €6bn across seven tranches, Microsoft entered a $25bn bond deal, and Meta priced $15bn, followed by a €8.25bn transaction. Oracle also raised $10bn in debt alongside ~$9.9bn in equity.",
  "The scale of demand remains extraordinary with Microsoft attracting a $115bn orderbook for its $25bn offering. This deal has attracted significant attention given that it was its first major bond offering since 2017. Meta attracted $58bn against its current ~$15bn dollar issuance.",
  "The dilemma for credit markets going forward is: how much debt big tech can take on to finance the AI buildout before the cost of staying ahead begins to undermine the credit quality that made them so attractive to begin with?",
  "The Price of AI",
  "Arguably, one of the most interesting developments across the recent issuance is the shape of the curves. Short-dated bonds are priced relatively close to credit ratings, spreads widen progressively as maturities extend, suggesting that investors are demanding greater compensation for longer-term exposure.",
  "Alphabet’s second euro deal of 2026 illustrates this clearly. Spreads range from 60bps at the two-year to 207.5bps at the 19-year point, a considerable increase from its May deal. Microsoft’s curve, by comparison, is flatter, with 10 tranches ranging from 34.7bps to 132.5bps across maturities of 2-40 years. Despite substantial oversubscription, its longer-dated tranches still steepens at the long end.",
  "What stands out is how quickly spreads widen with maturity and the pace differs by issuer. Meta’s spread premium rises about 100bps from 5 to 30 years, with the biggest jump between 5-to-7-year tranches (110bps to 145bps). Alphabet’s euro curve is steepest, though euro deals typically carry steeper curves than dollar ones. Oracle’s 5-year implies BBB, a notch above its BBB- rating despite paying a 30-35bp concession.",
  "The broader implication is that markets are not simply pricing the creditworthiness of today’s hyperscalers, but the uncertainty of their cash flows too.",
  "Are Investors Buying the AI Story?",
  "Spread-implied ratings indicate a divergence amongst hyperscalers, and the major players are treated heterogeneously. The rating puts these companies in a clear order, but the new-issue pricing doesn’t follow it. Thus, investors are pricing each company’s ability to finance AI, and more crucially, generate returns from it.",
  "Microsoft offers the strongest credit profile, supported by free cash flow and a cloud business that can directly monetise AI infrastructure. Alphabet retains a strong balance sheet but faces scrutiny over its scale of capital commitments, as well as its ability to monetise its AI-powered search engine (without cannibalising its key advertising business.) For Meta, its 7-30-year tranches priced like BBB- despite an AA- rating. With no external cloud business, its AI return comes back only indirectly through advertising and engagement, thus explaining why it paid the steepest concession relative to its credit rating. Oracle, however, is priced at or inside BBB- rating, the ~$9.9bn of equity raised alongside reads as discipline to bondholders.",
  "None of this is a downgrade. Wider long-dated spreads reflect term premiums, currency differences, and new issue concessions. More notably, they signal a changing credit story: as AI capex absorbs FCF, investors are looking beyond today’s balance sheets to the future trajectory of leverage and the visibility of AI returns.",
  "The Capex Backdrop: Scale and Duration",
  "Investors view the recent spread widening as technical rather than fundamental: a higher supply of bonds requires greater yields for supply absorption. Free cash flow is also a key credit variable to anchor fair value thinking, and the figures are staggering. Gawrelski estimates across the Big-4 (Microsoft, Alphabet, Amazon and Meta), FCF is forecast to reach -$53 billion in 2027, as capex growth averages to 62% YoY, outpacing revenue. Research by Flanagan expects negative FCF to mostly disappear by 2028, with bond supply overhang easing in 2027. The disappearance of negative FCF as well as a slower-than-expected capex pace could allow spreads to tighten – potentially creating a buying opportunity for patient credit investors.",
  "The counterargument is that leverage risks may be understated. In ‘The Gilded Age of Private Credit,’ off-balance sheet leases, JVs and backstop commitments can increase a hyperscalers leverage: “disclosure does not mean visibility.” Other underpriced risks include refinancing requirements, interconnected business models and the risk of obsolescence from single-purpose GPU facilities.",
  "The Return on AI",
  "There’s a bit of a paradox at the heart of the borrowing spree: if hyperscalers continue to expand the buildout, they risk increasing leverage and weakening balance sheets, whereas slowing down could mean surrendering competitive advantage. For bondholders, neither outcome is particularly straightforward.",
  "The real question is whether the returns on AI will justify the enormous amounts of capital being deployed today. If projected returns materialise and free cash flow recovers, then today's concessions could prove attractive. However, if monetisation disappoints, then the debt accumulated could leave a much longer-lasting mark on balance sheets.",
  "For bondholders, the cost of Googling the future may be measured not in computing power, but in the price they are willing to pay to finance it.",
];

const key = () => randomUUID().slice(0, 12);
const span = (text, marks = []) => ({ _type: "span", _key: key(), text, marks });
const block = (style, text) => ({ _type: "block", _key: key(), style, markDefs: [], children: [span(text)] });
const p = (i) => block("normal", PARAS[i]);
const dataStrip = (items) => ({
  _type: "dataStrip",
  _key: key(),
  items: items.map(([value, label]) => ({ _key: key(), value, label })),
});

// ── sources, in order of first citation ──────────────────────────────────────
const S = {
  ft: "Financial Times, reporting on hyperscaler bond issuance (November 2026): https://www.ft.com/content/6c099dc6-1fb3-44fc-b011-70229e3755cb?syn-25a6b1a6=1",
  bbgDeals:
    "Bloomberg News, new-issue coverage of the Alphabet, Microsoft, Meta and Oracle bond sales (3 to 5 November 2026)",
  oas: "Bloomberg, average option-adjusted spreads for US investment-grade corporates by rating, used for the spread-implied ratings (November 2026)",
  sorid: "Daniel Sorid, The High-Grade Beat: Hyperscalers test new wides (research note, 27 October 2026)",
  gawrelski:
    "Ken Gawrelski, Supply Chain Inflation Takes Hyperscaler CapEx to $1.1 Trillion in '27 (research note, 28 July 2026)",
  flanagan: "Christopher Flanagan, US Fixed Income Strategy: The US Fixed Income Weekly (research note, 2 November 2026)",
  gilded:
    "Nathalie Lustig, The Gilded Age of Private Credit, The Basis Point (7 July 2026): https://thebasispoint.finance/notes/the-gilded-age-of-private-credit",
};
const SOURCE_KEYS = Object.fromEntries(Object.keys(S).map((k) => [k, key()]));
const sources = Object.entries(S).map(([k, text]) => ({ _type: "source", _key: SOURCE_KEYS[k], text }));
const usedSources = new Set();

// Mark the first unmarked occurrence of `phrase` in a block as a citation.
function cite(b, phrase, src) {
  const i = b.children.findIndex((c) => !c.marks.length && c.text.includes(phrase));
  if (i < 0) throw new Error(`cannot cite "${phrase}"`);
  const c = b.children[i];
  const at = c.text.indexOf(phrase);
  const mk = key();
  b.markDefs.push({ _type: "citation", _key: mk, sourceKey: SOURCE_KEYS[src] });
  usedSources.add(src);
  b.children.splice(
    i,
    1,
    ...[span(c.text.slice(0, at)), span(phrase, [mk]), span(c.text.slice(at + phrase.length))].filter((s) => s.text),
  );
  return b;
}

// ── glossary terms this piece adds ───────────────────────────────────────────
const TERMS = [
  {
    term: "new issue concession",
    aliases: ["new issue concessions", "new-issue concession", "new-issue concessions", "NIC", "NICs"],
    definition:
      "The extra spread a borrower pays on a new bond over where its existing bonds already trade. It is the price of selling a large deal quickly, and it tends to grow with deal size.",
  },
  {
    term: "orderbook",
    aliases: ["orderbooks", "order book", "order books"],
    definition:
      "The total value of orders investors place for a new bond before it prices. A book several times the deal size means the issuer could have borrowed more, or paid less.",
  },
  {
    term: "oversubscription",
    aliases: ["oversubscribed"],
    definition:
      "When investor orders exceed the amount of debt on offer. Heavy oversubscription usually lets the issuer tighten the price before the deal closes.",
  },
  {
    term: "credit curve",
    aliases: ["credit curves"],
    definition:
      "One borrower's spreads plotted against maturity. A steep credit curve means investors want much more to lend for longer, a sign of doubt about the distant future rather than today.",
  },
  {
    term: "credit rating",
    aliases: ["credit ratings"],
    definition:
      "An agency's grade for how likely a borrower is to repay, from AAA down to D. Anything rated BBB- or above counts as investment grade.",
  },
  {
    term: "spread-implied rating",
    aliases: ["spread-implied ratings"],
    definition:
      "The rating a bond's spread would suggest, found by matching it to the average spread for each rating. When it sits below the official rating, the market is more worried than the agencies.",
  },
  {
    term: "notch",
    aliases: ["notches"],
    definition:
      "One step on the rating scale, such as from A to A-. Gaps between official and market-implied ratings are usually counted in notches.",
  },
  {
    term: "BBB",
    definition:
      "The lowest band of investment grade. BBB- sits one notch above high yield, so a downgrade from there can force some investors to sell.",
  },
  {
    term: "free cash flow",
    aliases: ["FCF"],
    definition:
      "Cash left from operations after paying for capital spending. It is what a company can use to pay down debt, so lenders watch it more closely than profit.",
  },
  {
    term: "fair value",
    definition:
      "An estimate of where a bond's spread should sit given its credit quality, before supply or sentiment push it around. Trading wide of fair value is what makes a bond look cheap.",
  },
  {
    term: "supply overhang",
    aliases: ["bond supply overhang"],
    definition:
      "A large pipeline of new bonds expected to come to market. Investors demand wider spreads to absorb it, so prices can stay weak until the supply clears.",
  },
  {
    term: "leverage",
    definition:
      "How much a company has borrowed relative to what it earns, usually debt divided by EBITDA. Higher leverage leaves less room to absorb a bad year.",
  },
  {
    term: "off-balance sheet",
    aliases: ["off-balance-sheet", "off balance sheet"],
    definition:
      "Obligations a company is committed to that do not appear as debt on its balance sheet, such as some leases or guarantees. They still have to be paid, so analysts add them back.",
  },
  {
    term: "joint venture",
    aliases: ["joint ventures", "JV", "JVs"],
    definition:
      "A company owned by two or more partners to run a shared project. Hyperscalers use them to fund data centres with outside money, keeping much of the debt off their own books.",
  },
  {
    term: "backstop commitment",
    aliases: ["backstop commitments", "backstop", "backstops"],
    definition:
      "A promise to step in and pay if another party cannot, for example guaranteeing a data centre developer's lease or loan. It is not debt today, but it can become debt.",
  },
];
// Existing terms that need another form to match this piece.
const EXTRA_ALIASES = { "term premium": ["term premiums"] };

for (const t of TERMS) {
  if (t.definition.length > 280) throw new Error(`definition too long: ${t.term}`);
}

// ── body ─────────────────────────────────────────────────────────────────────
function buildBody(images) {
  const body = [];
  const push = (...b) => body.push(...b);

  // The AI Borrowing Spree
  push(block("h2", PARAS[2]));
  push(p(3));
  push(cite(p(4), "the big tech hyperscalers returned to the bond market with significant new offerings", "ft"));
  push(cite(p(5), "Oracle also raised $10bn in debt alongside ~$9.9bn in equity", "bbgDeals"));
  push(p(6));
  push(
    dataStrip([
      ["$25bn", "Microsoft, 10 tranches, on a $115bn peak book (4.6x)"],
      ["€6bn", "Alphabet, seven tranches, on more than €17.1bn of orders"],
      ["~$15bn", "Meta's dollar deal, on $58bn of orders (about 3.9x)"],
    ]),
  );
  push({ _type: "callout", _key: key(), label: "The Question", text: PARAS[7] });

  // The Price of AI
  push(block("sectionLabel", "The Curve"), block("h2", PARAS[8]));
  push(p(9));
  push(cite(p(10), "a considerable increase from its May deal", "bbgDeals"));
  push(images[0]);
  push(cite(p(11), "despite paying a 30-35bp concession", "bbgDeals"));
  push(p(12));

  // Are Investors Buying the AI Story?
  push(block("sectionLabel", "The Ratings"), block("h2", PARAS[13]));
  // Cite the pricing claim, not "Spread-implied ratings", so the glossary can
  // still define that phrase.
  push(cite(p(14), "but the new-issue pricing doesn’t follow it", "oas"));
  push(images[1]);
  push(
    dataStrip([
      ["~4 notches", "Microsoft: AAA official, A- implied at the 40-year"],
      ["~5 notches", "Meta: AA- official, BBB- implied from the 7-year out"],
      ["~6 notches", "Alphabet: AA+ official, BBB- implied at the 19-year (euro)"],
    ]),
  );
  push(p(15), p(16));
  push({
    _type: "annotation",
    _key: key(),
    label: "Method",
    text: "Each new-issue spread is matched to the closest average spread for US investment-grade bonds in each rating bucket. That average is not matched by maturity and the new-issue spread includes the concession, so the long-dated gaps overstate the pure credit concern. Alphabet's euro spreads, quoted over mid-swaps, are compared with a dollar ladder.",
  });

  // The Capex Backdrop: Scale and Duration
  push(block("sectionLabel", "Fair Value"), block("h2", PARAS[17]));
  const p18 = p(18);
  cite(p18, "Investors view the recent spread widening as technical rather than fundamental", "sorid");
  cite(p18, "FCF is forecast to reach -$53 billion in 2027, as capex growth averages to 62% YoY, outpacing revenue", "gawrelski");
  cite(p18, "Research by Flanagan expects negative FCF to mostly disappear by 2028", "flanagan");
  push(p18);
  push(cite(p(19), "“disclosure does not mean visibility.”", "gilded"));
  push(
    dataStrip([
      ["-$53bn", "Combined 2027 free cash flow forecast for Microsoft, Alphabet, Amazon and Meta"],
      ["62%", "Average forecast capex growth year on year, outpacing revenue"],
      ["2028", "When negative free cash flow is expected to mostly disappear"],
    ]),
  );

  // The Return on AI
  push(block("sectionLabel", "The Outlook"), block("h2", PARAS[20]));
  push(p(21), p(22));
  push({ _type: "pullQuote", _key: key(), text: PARAS[23] });
  return body;
}

// ── run ──────────────────────────────────────────────────────────────────────
const client = createClient({
  projectId: process.env.NEXT_PUBLIC_SANITY_PROJECT_ID,
  dataset: process.env.NEXT_PUBLIC_SANITY_DATASET,
  apiVersion: process.env.NEXT_PUBLIC_SANITY_API_VERSION || "2024-01-01",
  token: process.env.SANITY_API_WRITE_TOKEN,
  useCdn: false,
});

const current = await client.fetch(`*[_type == "bondNote" && slug.current == $s && !(_id in path("drafts.**"))][0]`, {
  s: SLUG,
});
if (!current) throw new Error("note not found");
const draft = await client.fetch(`*[_id == $id][0]._id`, { id: `drafts.${current._id}` });
if (draft) throw new Error(`An unpublished Studio draft exists (${draft}). Publish or discard it first.`);

const images = current.body.filter((b) => b._type === "image");
if (images.length !== 2) throw new Error(`expected 2 exhibit images, found ${images.length}`);
const body = buildBody(images);

// Checks: no em dashes, every source cited, every paragraph placed once.
if (JSON.stringify({ body, sources, TERMS }).includes("—")) throw new Error("em dash found");
for (const k of Object.keys(S)) if (!usedSources.has(k)) throw new Error(`source never cited: ${k}`);
const texts = body.map((b) => (b._type === "block" ? b.children.map((c) => c.text).join("") : b.text ?? ""));
for (const i of [2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15, 16, 17, 18, 19, 20, 21, 22, 23]) {
  if (texts.filter((t) => t === PARAS[i]).length !== 1) throw new Error(`paragraph ${i} not placed exactly once`);
}

const existingTerms = await client.fetch(`*[_type == "glossaryTerm" && !(_id in path("drafts.**"))]{_id, term, aliases}`);
const known = new Map();
for (const t of existingTerms) for (const ph of [t.term, ...(t.aliases ?? [])]) known.set(ph.toLowerCase(), t.term);
const newTerms = TERMS.filter((t) => {
  const clash = [t.term, ...(t.aliases ?? [])].find((ph) => known.has(ph.toLowerCase()));
  if (clash) console.log(`  skip "${t.term}": "${clash}" already defined under "${known.get(clash.toLowerCase())}"`);
  return !clash;
});

if (DRY) {
  body.forEach((b, i) =>
    console.log(
      String(i).padStart(3),
      (b._type === "block"
        ? `${b.style}: ${b.children.map((c) => (c.marks.length ? `[${c.text}]` : c.text)).join("")}`
        : `${b._type}: ${JSON.stringify(b.caption ?? b.items?.map((x) => x.value) ?? b.text)}`
      ).slice(0, 170),
    ),
  );
  console.log("\nsources:", sources.length, "| new glossary terms:", newTerms.map((t) => t.term).join(", "));
  process.exit(0);
}

mkdirSync("scripts/backups", { recursive: true });
const backup = `scripts/backups/${SLUG}-2026-11-07.json`;
writeFileSync(backup, JSON.stringify(current, null, 2));
console.log(`  backup -> ${backup}`);

const tx = client.transaction();
tx.patch(current._id, (p) => p.set({ body, sources, excerpt: PARAS[1] }));
for (const t of newTerms) {
  const id = `glossary-${t.term.toLowerCase().replace(/[^\w]+/g, "-")}`;
  tx.createIfNotExists({ _id: id, _type: "glossaryTerm", term: t.term, aliases: t.aliases, definition: t.definition });
}
for (const [term, add] of Object.entries(EXTRA_ALIASES)) {
  const doc = existingTerms.find((t) => t.term === term);
  const missing = add.filter((a) => !(doc?.aliases ?? []).includes(a));
  if (doc && missing.length) tx.patch(doc._id, (p) => p.setIfMissing({ aliases: [] }).append("aliases", missing));
}
const res = await tx.commit();
console.log(`✓ Updated /notes/${SLUG} and ${newTerms.length} glossary terms (tx ${res.transactionId})`);
