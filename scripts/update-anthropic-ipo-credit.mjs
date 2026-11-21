// One-shot: replace the Anthropic IPO credit note with Nathalie's revised text
// (21 Nov 2026), retitled "A $1.5tn Valuation. But is Anthropic Investment Grade?".
// Prose is her text verbatim. Layout (labels, strips, callouts, pull quote,
// citations) follows the original; strips updated to her new figures. Keeps
// _id, slug, cover, excerpt and publish date. Backs up the current note first.
//
// Run:  node --env-file=.env.local scripts/update-anthropic-ipo-credit.mjs [--dry]

import { createClient } from "@sanity/client";
import { randomUUID } from "node:crypto";
import { mkdirSync, writeFileSync } from "node:fs";
import { fileURLToPath } from "node:url";

const DRY = process.argv.includes("--dry");
const SLUG = "does-anthropics-ipo-make-them-a-more-attractive-credit";

const PARAS = [
  /* 0 */ "A $1.5tn Valuation. But is Anthropic Investment Grade?",
  /* 1 */ "Everyone’s eyes are on Anthropic’s equity, but what about its debt? A lesser-asked question today, but arguably a more important one tomorrow.",
  /* 2 */ "Anthropic, the company behind Claude, has raised $107.3bn through its IPO and concurrent private placement, at a $1.5tn valuation in what is the largest public offering in history. Founded by former-OpenAI executives and siblings Dario and Daniela Amodei, the company has secured an enormous amount of capital to fund its next phase of growth. Yet, beneath the headline-grabbing valuation lies a different story for debt investors.",
  /* 3 */ "Unsurprisingly oversubscribed, the offering saw 980mn shares priced at $83 per share, alongside a further $26bn in private placements. The raise leaves Anthropic with an enlarged liquidity position, although against that sits $900.9bn in contractual compute and infrastructure commitments extending to 2045. KBRA, a less-followed rating agency, reportedly assigned Anthropic a BB+ issuer rating in June, placing it in speculative-grade territory, while Moody’s, S&P and Fitch have yet to issue formal ratings. Meanwhile, investment banks Morgan Stanley and Goldman Sachs have been negotiating for an investment-grade outcome.",
  /* 4 */ "Whether Anthropic is BB+ or BBB- matters because investment-grade status could broaden its potential investor base, as institutional investors typically face mandates or restrictions limiting their exposure to high-yield debt. Though a rating tells us about credit risk, not whether that risk is priced well. A more interesting question is, therefore, whether Anthropic’s IPO has strengthened its creditworthiness enough to justify investment-grade status, or whether its improving financial position masks an increasingly risky underlying credit profile.",
  /* 5 */ "The Credit Rating Dilemma",
  /* 6 */ "An IPO can improve a company’s standing with creditors. Greater transparency through public financial reporting, alongside a stronger equity base and improved liquidity, can make a business more attractive to banks and lenders. A public listing also broadens access to syndicated loans and public corporate bond markets, diversifying funding sources beyond private financing.",
  /* 7 */ "However, equity market access does not necessarily translate to investment-grade creditworthiness. AI is an industry characterised by considerable uncertainty over its ability to monetise returns and generate sustainable free cash flow. Whilst Microsoft, Amazon and Alphabet benefit from investment-grade credit profiles, Anthropic faces its own challenges: substantial infrastructure commitments, high R&D spending, and strong competition. These companies are not merely peers; Google and Amazon are also Anthropic’s compute suppliers, shareholders, and financing partners. For a creditor, that circularity matters for counterparty and dependency risk.",
  /* 8 */ "Reading the Numbers",
  /* 9 */ "From a credit standpoint, three metrics are most important to explore: liquidity coverage, compute economics, and debt capacity. Together, they show whether Anthropic will be able to meet its near-term funding requirements and generate the sustainable free cash flow needed to support additional borrowing over the longer term.",
  /* 10 */ "Liquidity coverage: can Anthropic meet its obligations?",
  /* 11 */ "Liquidity is exceptionally strong, with total liquidity of $146.6bn as of September 2026, rising to $227.5bn pro forma. Against $70.7bn in commitments falling due within 12 months, this represents a coverage of 2.1x pre-IPO, and 3.2x post-IPO. The enlarged liquidity position provides near-term financial flexibility, although these commitments represent only a fraction of Anthropic’s ongoing funding requirements. Its infrastructure programme will continue to demand significant capital well past the next 12 months.",
  /* 12 */ "Compute economics: can Anthropic make money from its infrastructure?",
  /* 13 */ "Revenue growth was remarkable, Anthropic generated $33.2bn over the first nine months of 2026, representing 1,206% year-on-year growth. For the first time, Anthropic generated positive operating cash flow of $6.6bn, suggesting improving operational efficiency as the business scales. More importantly, compute intensity (total compute spend as a share of revenue), fell from 172.1% in 9M25, to 56.6% in 9M26. In other words, Anthropic generated significantly more revenue from each dollar of compute deployed.",
  /* 14 */ "Gross margins also expanded to 85.5%, which is attributed to low customer-serving compute costs of $4.8bn. However, this figure doesn’t capture the further $14bn Anthropic has spent on compute expenditure, primarily associated with training and developing new models. Whilst Anthropic has undoubtedly become more efficient at monetising its existing infrastructure, maintaining its competitive position also requires considerable ongoing investment. The challenge for creditors is whether the returns generated by today’s models will be sufficient to fund the next generation.",
  /* 15 */ "Debt capacity: how much debt can Anthropic support?",
  /* 16 */ "This is where it gets interesting. Conventional leverage presents a relatively comfortable picture, with lease-adjusted leverage of 1.85x. Moreover, Anthropic’s $1.5tn equity valuation provides a substantial buffer for creditors, reflecting strong investor confidence – though this valuation reflects investor expectations for its future cash generation, which may not materialise. Any shortfall against these expectations could erode equity value, weakening the financial cushion available to creditors.",
  /* 17 */ "The bigger concern is the scale of its future funding requirements. Anthropic has approximately $900.9bn committed to compute and infrastructure through 2045, including $451bn expected before the end of 2030. Whilst Anthropic does retain some flexibility over future investment, existing contractual commitments limit its ability to scale back. This raises questions about whether internally generated cash flows can sustain this expansion, or whether Anthropic will need to continue relying on external financing.",
  /* 18 */ "Indeed, Anthropic has approximately $77bn of potential financing through note purchase agreements with Google, Amazon, and Broadcom. This does not represent existing debt, rather, drawing on these facilities would increase its financial obligations. If fully drawn, my estimates suggest lease-adjusted leverage could rise from 1.85x to approximately 15.2x. Whilst illustrative rather than an expected outcome, it highlights how quickly Anthropic’s future leverage could increase as its investments expand.",
  /* 19 */ "Junk Today, Gold Tomorrow?",
  /* 20 */ "A rating will shape Anthropic’s future costs of borrowing and access to capital. However, a rating alone cannot determine whether its debt will be an attractive investment. There must be a distinction drawn between credit risk and the pricing of credit risk.",
  /* 21 */ "Anthropic's IPO has undeniably strengthened its credit profile. Its strengthened liquidity position, improving cash generation, and access to public capital markets provide meaningful protection for creditors. Yet these improvements should not overshadow the scale of its future obligations. Large infrastructure commitments, continued reliance on external financing and uncertainty surrounding long-term AI monetisation leave considerable downside risk should growth expectations fail to materialise.",
  /* 22 */ "Anthropic presents an interesting credit proposition. Whether it achieves investment-grade or remains high-yield will have implications for its future competitive advantage, particularly given the scale of committed capex required to keep up pace with hyperscaler peers. Its underlying economics are improving, but its capital-intensive business model leaves its long-term debt capacity heavily dependent on its ability to translate growth into sustainable free cash flow.",
  /* 23 */ "Junk today, gold tomorrow? Perhaps. But for creditors, Anthropic’s potential is only as valuable as its ability to turn today’s investment into tomorrow’s cash flows.",
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

// ── sources ──────────────────────────────────────────────────────────────────
const S = {
  yahoo: "Yahoo Finance. Anthropic faces junk rating. https://finance.yahoo.com/technology/ai/articles/anthropic-faces-junk-rating-could-233300695.html",
  twentyfour: "TwentyFour Asset Management. SpaceX: reading between the lines. https://blog.twentyfouram.com/insights/spacex-reading-between-the-lines",
  ft1: "Financial Times. https://www.ft.com/content/5a310aee-f555-4266-874c-b1b4db20186d?syn-25a6b1a6=1",
  ft2: "Financial Times. https://www.ft.com/content/62c0510b-ca65-441e-9baf-675b93903b9e?syn-25a6b1a6=1",
  s1: "Anthropic, PBC. Form S-1/A (Amendment No. 2), SEC EDGAR, November 2026. https://www.sec.gov/Archives/edgar/data/2130357/000162828026072484/anthropicpbc-sx1ax2.htm",
};
const SOURCE_KEYS = Object.fromEntries(Object.keys(S).map((k) => [k, key()]));
const sources = Object.entries(S).map(([k, text]) => ({ _type: "source", _key: SOURCE_KEYS[k], text }));

// Mark the first unmarked occurrence of `phrase` in a block as a citation.
function cite(b, phrase, src) {
  const i = b.children.findIndex((c) => !c.marks.length && c.text.includes(phrase));
  if (i < 0) throw new Error(`cannot cite "${phrase}"`);
  const c = b.children[i];
  const at = c.text.indexOf(phrase);
  const mk = key();
  b.markDefs.push({ _type: "citation", _key: mk, sourceKey: SOURCE_KEYS[src] });
  b.children.splice(
    i,
    1,
    ...[span(c.text.slice(0, at)), span(phrase, [mk]), span(c.text.slice(at + phrase.length))].filter((s) => s.text),
  );
  return b;
}

// ── body ─────────────────────────────────────────────────────────────────────
const body = [];
const push = (...b) => body.push(...b);

push(p(2));
push(
  dataStrip([
    ["$107.3bn", "Raised in the largest public offering in history"],
    ["$1.5tn", "Valuation at listing"],
    ["$900.9bn", "Compute and infrastructure commitments to 2045"],
  ]),
);
push(cite(p(3), "KBRA, a less-followed rating agency, reportedly assigned Anthropic a BB+ issuer rating in June", "yahoo"), p(4));

push(block("sectionLabel", "The Rating"), block("h2", PARAS[5]));
push(p(6), p(7));
push({
  _type: "callout",
  _key: key(),
  label: "The Circularity",
  text: "Google and Amazon are not just Anthropic’s peers. They are also its compute suppliers, its shareholders and its financing partners.",
});

push(block("sectionLabel", "The Numbers"), block("h2", PARAS[8]));
push(p(9));

push(block("h3", PARAS[10]));
push(p(11));
push(
  dataStrip([
    ["$227.5bn", "Total liquidity pro forma, up from $146.6bn"],
    ["3.2x", "Coverage of the next 12 months of commitments, up from 2.1x"],
    ["$70.7bn", "Commitments falling due within 12 months"],
  ]),
);

push(block("h3", PARAS[12]));
push(cite(p(13), "Anthropic generated $33.2bn over the first nine months of 2026", "s1"));
push(
  dataStrip([
    ["$33.2bn", "Nine-month revenue, up 1,206% year on year"],
    ["56.6%", "Compute intensity, down from 172.1%"],
    ["85.5%", "Gross margin"],
  ]),
);
push(p(14));

push(block("h3", PARAS[15]));
push(p(16), p(17), p(18));
push(
  dataStrip([
    ["1.85x", "Lease-adjusted leverage today"],
    ["$451bn", "Commitments expected before the end of 2030"],
    ["15.2x", "Illustrative leverage if all $77bn of note purchase agreements are drawn"],
  ]),
);

push(block("sectionLabel", "The Verdict"), block("h2", PARAS[19]));
push(p(20), p(21));
push({ _type: "callout", _key: key(), label: "The Bottom Line", text: PARAS[22] });
push({ _type: "pullQuote", _key: key(), text: PARAS[23] });

// ── checks ───────────────────────────────────────────────────────────────────
if (JSON.stringify({ body, sources }).includes("—")) {
  console.error("Em dash found. Fix before publishing.");
  process.exit(1);
}
const texts = body.map((b) => (b._type === "block" ? b.children.map((c) => c.text).join("") : b.text ?? ""));
for (let i = 2; i < PARAS.length; i++) {
  if (texts.filter((t) => t === PARAS[i]).length !== 1) throw new Error(`paragraph ${i} not placed exactly once`);
}

if (DRY) {
  const label = (b) =>
    b._type === "block"
      ? `${b.style}: ${b.children.map((c) => (c.marks.length ? `[${c.text}]` : c.text)).join("")}`
      : `${b._type}: ${JSON.stringify(b.items?.map((x) => x.value) ?? b.text)}`;
  body.forEach((b, i) => console.log(String(i).padStart(3), label(b).slice(0, 170)));
  console.log("\ntitle:", PARAS[0], "| blocks:", body.length, "| sources:", sources.length);
  process.exit(0);
}

const client = createClient({
  projectId: process.env.NEXT_PUBLIC_SANITY_PROJECT_ID,
  dataset: process.env.NEXT_PUBLIC_SANITY_DATASET,
  apiVersion: process.env.NEXT_PUBLIC_SANITY_API_VERSION || "2024-01-01",
  token: process.env.SANITY_API_WRITE_TOKEN,
  useCdn: false,
});

// Published note and, if present, its Studio draft. Each is backed up first.
const ID = "62218df9-501a-4fd3-94c4-ee77f8e80cf9";
mkdirSync(fileURLToPath(new URL("./backups/", import.meta.url)), { recursive: true });
const stamp = new Date().toISOString().slice(0, 16).replace(/[:T]/g, "-");
for (const id of [ID, `drafts.${ID}`]) {
  const current = await client.getDocument(id);
  if (!current) continue;
  if (current.slug?.current !== SLUG) throw new Error(`${id} is not /notes/${SLUG}`);
  const backup = fileURLToPath(new URL(`./backups/${SLUG}${id.startsWith("drafts.") ? "-draft" : ""}-${stamp}.json`, import.meta.url));
  writeFileSync(backup, JSON.stringify(current, null, 2));
  console.log(`  backup -> ${backup}`);
  await client.patch(id).set({ title: PARAS[0], body, sources }).commit();
  console.log(`✓ Updated ${id}`);
}
console.log(`/notes/${SLUG}, live within ~60s.`);
process.exit(0);
