// Seed the glossary with bond-market terms drawn from the published notes.
//
// The term list is deliberately short. This feature marks the first occurrence
// of each term in every article, so a large generic finance dictionary would
// turn every paragraph into a field of dotted underlines and cost the feature
// the restraint that makes it readable. Every entry below either already
// appears in a published note or is core vocabulary for this subject.
//
// Idempotent: terms that already exist are skipped, so this is safe to re-run
// after adding new entries to the list.
import { createClient } from "@sanity/client";
import { readFileSync } from "node:fs";

const env = Object.fromEntries(
  readFileSync(new URL("../.env.local", import.meta.url), "utf8")
    .split("\n")
    .filter((l) => l.includes("="))
    .map((l) => [l.slice(0, l.indexOf("=")).trim(), l.slice(l.indexOf("=") + 1).trim()]),
);

const client = createClient({
  projectId: env.NEXT_PUBLIC_SANITY_PROJECT_ID,
  dataset: env.NEXT_PUBLIC_SANITY_DATASET,
  apiVersion: env.NEXT_PUBLIC_SANITY_API_VERSION,
  token: env.SANITY_API_WRITE_TOKEN,
  useCdn: false,
});

const TERMS = [
  {
    term: "duration",
    definition:
      "A bond's sensitivity to interest rates, roughly the percentage its price falls when yields rise by one point. Longer-dated bonds carry more of it, which is why the long end moves most in a sell-off.",
  },
  {
    term: "long end",
    aliases: ["back end"],
    definition:
      "The longest-dated part of the yield curve, typically ten years and beyond. It is the most exposed to inflation and fiscal risk, because those are the things that can go wrong over decades.",
  },
  {
    term: "front end",
    aliases: ["short end"],
    definition:
      "The shortest-dated part of the yield curve, roughly two years and in. It tracks expectations for central bank policy more closely than anything else.",
  },
  {
    term: "belly",
    definition:
      "The middle of the yield curve, roughly the five to ten year area. It sits between policy expectations at the front and term premium at the long end.",
  },
  {
    term: "yield curve",
    definition:
      "The line plotting government bond yields against their maturities. Its shape encodes what the market expects from growth, inflation and policy over time.",
  },
  {
    term: "carry",
    definition:
      "The income earned simply from holding a position, before any price move. In bonds it is the coupon received less the cost of funding the position.",
  },
  {
    term: "issuance",
    definition:
      "The sale of new bonds into the market by a government or company. Heavy issuance adds supply, which pushes yields up unless demand keeps pace.",
  },
  {
    term: "sovereign",
    aliases: ["sovereigns"],
    definition:
      "Debt issued by a national government. Sovereign bonds are usually the benchmark against which everything else in that market is priced.",
  },
  {
    term: "gilt",
    aliases: ["gilts"],
    definition:
      "A bond issued by the UK government. The name comes from the gilt-edged certificates the Bank of England originally issued.",
  },
  {
    term: "collateral",
    definition:
      "An asset pledged to a lender that can be seized and sold if the borrower defaults. Its value, and how easily it can be sold, set how much the lender will advance.",
  },
  {
    term: "liquidity",
    definition:
      "How easily an asset can be bought or sold without moving its price. It tends to be abundant right up until the moment it is needed.",
  },
  {
    term: "private credit",
    definition:
      "Lending by non-bank institutions directly to companies, outside public bond markets. The loans are not traded, so they carry no daily market price.",
  },
  {
    term: "direct lending",
    definition:
      "The largest part of private credit: a fund lends straight to a company, with no bank intermediating and no syndication. The loan is typically held to maturity.",
  },
  {
    term: "securitisation",
    aliases: ["securitised", "securitization", "securitized"],
    definition:
      "Pooling loans or receivables and issuing bonds backed by their cash flows. It converts illiquid individual loans into tradeable securities.",
  },
  {
    term: "tranche",
    aliases: ["tranches"],
    definition:
      "One slice of a securitisation, ranked by who gets paid first. Senior tranches absorb losses last and yield least; junior tranches absorb them first and yield most.",
  },
  {
    term: "recovery rate",
    definition:
      "The share of a loan's value a lender actually gets back after a default. It is what turns a default rate into an expected loss.",
  },
  {
    term: "real yield",
    aliases: ["real yields"],
    definition:
      "The yield on a bond after subtracting expected inflation. It is what the investor earns in purchasing power rather than in currency.",
  },
  {
    term: "quantitative easing",
    aliases: ["QE"],
    definition:
      "A central bank buying bonds with newly created reserves to push yields down and loosen conditions. It works partly by removing duration from the market.",
  },
  {
    term: "quantitative tightening",
    aliases: ["QT"],
    definition:
      "The reverse of quantitative easing: a central bank shrinking its balance sheet by letting bonds mature or selling them. It returns duration to private investors.",
  },
  {
    term: "policy rate",
    definition:
      "The short-term interest rate a central bank sets directly. Everything further out the curve is, in part, a forecast of where it goes next.",
  },
  {
    term: "price discovery",
    definition:
      "The process by which trading reveals what an asset is actually worth. It needs visible transactions, which is why opaque markets discover prices badly.",
  },
  {
    term: "consolidated tape",
    definition:
      "A single feed aggregating trade prices across venues into one public record. Equity markets have had one for decades; bond markets largely have not.",
  },
  {
    term: "capex",
    definition:
      "Capital expenditure: money spent on long-lived physical assets rather than day-to-day running costs. Large capex programmes are increasingly funded in bond markets.",
  },
  {
    term: "credit spread",
    aliases: ["credit spreads"],
    definition:
      "The extra yield a corporate bond pays over a government bond of similar maturity. It is the market's price for the risk that the borrower does not pay.",
  },
  {
    term: "coupon",
    definition:
      "The fixed interest payment a bond makes to its holder, set at issue and usually paid twice a year. It does not change when the bond's market price does.",
  },
  {
    term: "maturity",
    definition:
      "The date a bond repays its principal and stops paying interest. How far away it sits drives how sensitive the bond is to rate moves.",
  },
  {
    term: "basis point",
    aliases: ["basis points", "bps"],
    definition:
      "One hundredth of a percentage point. Bond markets quote in basis points because the moves that matter are too small to express cleanly in percent.",
  },
  {
    term: "convexity",
    definition:
      "How much a bond's duration itself changes as yields move. Positive convexity means prices rise faster than they fall, which is why it is worth paying for.",
  },
  {
    term: "steepener",
    aliases: ["steepeners"],
    definition:
      "A position that profits when the gap between long and short yields widens. Its mirror image is a flattener.",
  },
  {
    term: "investment grade",
    definition:
      "Debt rated BBB minus or above, judged relatively unlikely to default. The boundary matters because many funds are barred from holding anything below it.",
  },
  {
    term: "high yield",
    definition:
      "Debt rated below investment grade, paying more to compensate for higher default risk. Also called junk, though rarely by anyone selling it.",
  },

  // Optionality. Note the aliases here are deliberately conservative: bare
  // "call" and "put" are ordinary English verbs and would gloss "called it a
  // day" or "put pressure on", so only the compound forms are matched.
  {
    term: "convertible bond",
    aliases: ["convertible bonds", "convertibles"],
    definition:
      "A bond the holder can exchange for a fixed number of the issuer's shares. It pays a lower coupon than straight debt because the conversion right is itself worth something.",
  },
  {
    term: "callable bond",
    aliases: ["callable bonds", "callable"],
    definition:
      "A bond the issuer can redeem early, typically once rates have fallen far enough to refinance cheaper. The investor is paid a higher yield for handing over that choice.",
  },
  {
    term: "puttable bond",
    aliases: ["puttable bonds", "puttable"],
    definition:
      "A bond the holder can sell back to the issuer before maturity at a set price. The mirror of a callable bond, with the option sitting on the investor's side instead.",
  },
  {
    term: "call option",
    aliases: ["call options"],
    definition:
      "The right, without the obligation, to buy an asset at a set price before a set date. In bonds it usually sits with the issuer, as the right to redeem early.",
  },
  {
    term: "put option",
    aliases: ["put options"],
    definition:
      "The right, without the obligation, to sell an asset at a set price before a set date. It is what makes a puttable bond puttable.",
  },
  {
    term: "strike price",
    aliases: ["strike"],
    definition:
      "The fixed price at which an option can be exercised. Whether it sits above or below the market price is what decides whether the option is worth anything.",
  },
  {
    term: "option-adjusted spread",
    aliases: ["OAS"],
    definition:
      "A bond's spread after stripping out the value of any embedded option. It is what lets a callable bond be compared like for like with a straight one.",
  },
  {
    term: "embedded option",
    aliases: ["embedded options"],
    definition:
      "An option written into a bond's own terms rather than traded separately, such as the issuer's right to call it early. It cannot be sold off on its own.",
  },
  {
    term: "conversion premium",
    definition:
      "How much more a convertible bond costs than the shares it converts into are currently worth. It is what the buyer pays for the downside protection the bond gives.",
  },
  {
    term: "negative convexity",
    definition:
      "When a bond's price rises more slowly than it falls as yields move, usually because a call option caps the upside. Callable and mortgage bonds are the classic cases.",
  },
];

const tooLong = TERMS.filter((t) => t.definition.length > 280);
if (tooLong.length) {
  console.error(
    "definitions over the schema's 280-char limit:",
    tooLong.map((t) => `${t.term} (${t.definition.length})`).join(", "),
  );
  process.exit(1);
}

const existing = new Set(
  await client.fetch(`*[_type == "glossaryTerm"].term`),
);

let created = 0;
for (const t of TERMS) {
  if (existing.has(t.term)) {
    console.log(`skip (exists) ${t.term}`);
    continue;
  }
  await client.create({ _type: "glossaryTerm", ...t });
  console.log(`created ${t.term}`);
  created++;
}
console.log(`done: ${created} created, ${TERMS.length - created} skipped`);
