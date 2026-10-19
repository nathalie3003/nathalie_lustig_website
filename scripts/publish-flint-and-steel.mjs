// One-shot: publish "Flint and Steel: How the AI Debt Boom Could Ignite a Bond
// Market Crisis" as a Credit note.
//
// Body prose is Nathalie's text verbatim; this script only decides structure
// (the bold sub-topics become h2s, the italic standfirst becomes the excerpt).
//
// Run:  node --env-file=.env.local scripts/publish-flint-and-steel.mjs [--dry]

import { createClient } from "@sanity/client";
import { randomUUID } from "node:crypto";

const DRY = process.argv.includes("--dry");
const key = () => randomUUID().slice(0, 12);

const block = (style, text) => ({
  _type: "block",
  _key: key(),
  style,
  markDefs: [],
  children: [{ _type: "span", _key: key(), text, marks: [] }],
});
const h2 = (t) => block("h2", t);
const p = (t) => block("normal", t);

const body = [
  p("Financial crises rarely emerge from a single spark. The risk markets are facing is the collision between rising sovereign yields, and the financing needs of an increasingly leveraged AI buildout. Whilst cash-rich hyperscalers may be able to absorb higher borrowing costs, neo-clouds and debt-funded data centre projects are more exposed. If benchmark yields remain elevated, refinancing could become more expensive, returns harder to justify, and credit losses more likely."),
  p("In 2008, there was a flight-to-quality to US treasuries. But if rising government borrowing and persistent inflation put pressure on the very market that anchors global financing, where does the next flight to safety go?"),

  h2("The Flint: Why the Bond Markets May Not Get Rescued"),
  p("Long-term sovereign yields have risen for three reasons: 1) rising government borrowing; 2) higher inflation expectations; and 3) the term premium, which is the additional compensation investors demand for holding longer-dated bonds. In the US, headline inflation rose to 3.7%, driven by higher Brent crude prices ($108 as of 19/10/2026) and the Iran war, reinforcing concerns about persistent inflationary pressure. If energy prices remain elevated, inflation could prove hard to bring under control, limiting the Fed from cutting rates; markets have already priced in a 25bps rate hike by end of year."),
  p("The difficulty here is that the Fed cannot necessarily extinguish this concern by cutting rates. If inflation remains sticky, easing monetary policy risks undermining efforts to curtail price pressures. The Fed could instead buy long-dated US treasuries through open market operations, putting downwards pressure on yields. But such an intervention would not resolve the underlying inflationary pressures or concerns about the sustainability of government borrowing."),
  p("The flint is not simply a rate hike, but the risk that long-term costs of borrowing remain elevated at a time when the financial system has become more dependent on continued investment and refinancing."),

  h2("The Steel: Financing the AI Race"),
  p("The AI build-out is increasingly being financed through debt. Global AI-debt related issuance is projected to surpass $760bn in 2026, with JP Morgan estimating a further $5.5tn through to 2030. These figures cover the broader financing requirements of the AI buildout, not just hyperscaler borrowing."),
  p("The question is not simply whether these companies can afford to borrow but how much they are willing to pay for capital. For example, Japan’s SoftBank accepted yields as high as 9.75% on a seven-year tranche, illustrating the premium borrowers are willing to pay to secure financing. In a race where falling behind carries a potentially enormous strategic cost, borrowers may accept increasingly expensive financing to secure the capital needed to expand."),
  p("Oracle further illustrates this tension. In September, $18bn of loans linked to an Oracle-leased data centre in New Mexico were quoted below 90 cents on the dollar, as banks struggled to distribute the debt amidst concerns regarding the project’s execution and Oracle’s creditworthiness. Trading below par does not by itself establish distress. However, the difficulty banks faced in distributing the loans highlights how lenders can be left financing projects they expected to syndicate."),
  p("CoreWeave offers another warning sign. It saw 15% of its stock value wiped in one day after its bond fell to near-distressed debt levels, to around 80 cents on the dollar. The bond price signals heightened concern about credit risk, whilst the equity sell-off points to broader doubts about the company's prospects. For neoclouds the combination matters, expansion depends on sustained demand for AI computing and continued access to financing."),
  p("This is the steel: a capital-intensive AI buildout, increasingly expensive financing and calling into question creditworthiness of its more leveraged borrowers."),

  h2("The Collision: From Duration Risk to Credit Risk"),
  p("Sovereign yields are the point of collision. These feed into the cost of financing AI infrastructure. Benchmark yields form the base of many borrowing rates and when they rise new debt and refinancing become more expensive even if a borrower's own credit spread remains unchanged. For projects dependent on future cash flows, the result is a narrower margin for servicing debt and generating acceptable returns."),
  p("The first impact is on valuations. AI equities are particularly sensitive to discount rates because much of their expected value rests on future earnings, meaning spreads could widen, further impacting profitability."),
  p("AI infrastructure also requires substantial upfront investment, whilst revenue may take years to materialise. If construction is delayed or demand disappoints, debt repayments may arrive before expected cash flows do. Higher interest rates compound the problem, weakening debt-service capacity and potentially prompting lenders to demand wider spreads, tighter covenants, or additional collateral."),

  h2("The Fuel: How the Shock Could Spread"),
  p("The risk extends beyond individual borrowers if credit losses constrain the institutions financing them. Banks, unable to distribute loans, may have to retain more exposure on their balance sheets. Private credit funds financing AI infrastructure could face weaker recoveries whilst investors in data centre securitisations could be exposed to deteriorating credit quality. If losses prompt lenders to tighten covenants or reduce commitments, financing pressure could spread beyond the weakest AI borrowers. Whether this becomes systemic depends on the scale of losses, their concentration, and the capacity of lenders to absorb them."),

  h2("Who Gets Burned?"),
  p("There are many good reasons not to assume the worst. Cash-rich, investment-grade hyperscalers such as Amazon, Microsoft, and Meta, are better positioned to absorb higher financing costs than more leveraged neo clouds and debt-funded infrastructure projects. AI demand is expected to generate substantial returns, but the more immediate risk is expensive borrowing and selective credit losses. A systemic crisis remains a tail risk, though this is dependent on how sovereign yields, credit conditions and AI returns evolve."),
  p("But winners do not preclude losers. If infrastructure is built on overly optimistic assumptions, and struggles to generate adequate returns, creditors will bear the losses. And if borrowing costs remain elevated, the consequences could extend beyond financial markets, and feed into more expensive mortgages, higher government debt-servicing costs and weaker investment."),
  p("Sovereign markets provide the flint; AI borrowing provides the steel. Whether their collision produces a fleeting spark or a fire that spreads through the financial system will depend on inflation, borrowing costs, and the returns AI investment delivers. The technology may transform the economy, but its success depends on whether those returns justify the pressure its buildout has placed on credit markets. The question is not whether AI will produce winners, but who gets burned."),
];

// The renderer prints sources as plain text, so the raw URLs (several carrying
// tracking strings) are given as readable citations instead.
const sources = [
  "Debt-hungry data center companies face increased risk as bond yields spike (CNBC, 27 September 2026)",
  "Sam Altman's AI slowdown: how CEOs can change their minds without losing trust (Provoke Media)",
  "Financial Times",
  "Oracle Corporation (ORCL) balance sheet (Yahoo Finance)",
  "Hyperscaler debt issuance and the AI buildout (J.P. Morgan Asset Management, On the Minds of Investors)",
  "How AI debt is reshaping the credit market (Goldman Sachs Exchanges)",
].map((text) => ({ _type: "source", _key: key(), text }));

const doc = {
  _type: "bondNote",
  title: "Flint and Steel: How the AI Debt Boom Could Ignite a Bond Market Crisis",
  slug: { _type: "slug", current: "flint-and-steel-ai-debt-boom-bond-market-crisis" },
  publishedAt: new Date().toISOString(),
  excerpt:
    "Sovereign debt is the flint; AI borrowing is the steel. Each may be manageable alone. Struck together in a fragile bond market, they could start a much wider fire.",
  category: "credit",
  body,
  sources,
};

if (JSON.stringify(doc).includes("—")) {
  console.error("Em dash found in copy. Fix before publishing.");
  process.exit(1);
}

if (DRY) {
  body.forEach((b, i) => console.log(String(i).padStart(3), `${b.style}: ${b.children[0].text.slice(0, 90)}`));
  console.log("\nblocks:", body.length, "| excerpt chars:", doc.excerpt.length);
  process.exit(0);
}

const client = createClient({
  projectId: process.env.NEXT_PUBLIC_SANITY_PROJECT_ID,
  dataset: process.env.NEXT_PUBLIC_SANITY_DATASET,
  apiVersion: process.env.NEXT_PUBLIC_SANITY_API_VERSION || "2024-01-01",
  token: process.env.SANITY_API_WRITE_TOKEN,
  useCdn: false,
});

const existing = await client.fetch(`*[_type == "bondNote" && slug.current == $s][0]._id`, {
  s: doc.slug.current,
});
if (existing) {
  console.error(`A note already exists at /notes/${doc.slug.current} (${existing}). Aborting.`);
  process.exit(1);
}

const created = await client.create(doc);
console.log(`\n✓ Published "${created.title}"`);
console.log(`  ${created._id}`);
console.log(`  /notes/${doc.slug.current}, live within ~60s (ISR revalidate).`);
