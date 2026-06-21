// Market data layer for the static ticker below the hero.
//
// STATUS: placeholder values. Wiring real APIs is a separate task —
// see the comment block at the bottom of this file.
//
// Shape is grouped so the UI can render section labels (RATES · FX · COMM).
// `change` is signed; positive renders ▴ in accent, negative renders ▾ in muted.

export type Tick = {
  symbol: string;
  value: string;
  change?: number;
};

export type MarketGroup = {
  label: string;
  ticks: Tick[];
};

export type MarketSnapshot = {
  groups: MarketGroup[];
  asOf: string; // ISO timestamp
  source: "placeholder" | "live";
};

export async function getMarketSnapshot(): Promise<MarketSnapshot> {
  // Placeholder values. Realistic-but-fake so the layout shows what it
  // will look like when live data lands.
  return {
    source: "placeholder",
    asOf: new Date().toISOString(),
    groups: [
      {
        label: "Rates",
        ticks: [
          { symbol: "UST 10Y", value: "4.23%", change: 0.02 },
          { symbol: "Gilt 10Y", value: "4.51%", change: -0.01 },
          { symbol: "Bund 10Y", value: "2.34%", change: 0.01 },
          { symbol: "ILGB 10Y", value: "4.12%", change: 0.03 },
          { symbol: "SOFR", value: "5.31%", change: 0 },
          { symbol: "EUR Swap 10Y", value: "2.58%", change: 0.01 },
        ],
      },
      {
        label: "FX",
        ticks: [
          { symbol: "Cable", value: "1.2740", change: -0.0021 },
          { symbol: "EUR/USD", value: "1.0822", change: 0.0014 },
          { symbol: "EUR/GBP", value: "0.8495", change: 0.0008 },
          { symbol: "USD/ILS", value: "3.7320", change: 0.012 },
          { symbol: "GBP/ILS", value: "4.7531", change: 0.009 },
        ],
      },
      {
        label: "Commodities",
        ticks: [
          { symbol: "Brent", value: "$84.50", change: 0.42 },
          { symbol: "Gold", value: "$2,317", change: -8.5 },
        ],
      },
    ],
  };
}

// ---------------------------------------------------------------
// Wiring real data — to do next.
//
// Free sources that work without paid keys:
//   - FX:        exchangerate.host  (no API key; covers all the FX above)
//   - US rates:  FRED via stlouisfed.org/docs/api  (free key required)
//   - Commodities: Yahoo Finance chart endpoint (unofficial; works)
//
// Harder without paid feeds:
//   - Gilt 10Y, Bund 10Y, ILGB 10Y, EUR Swap 10Y — these often need a
//     paid feed (Bloomberg / Refinitiv / ICE). Options:
//     1. Scrape investing.com / tradingeconomics.com (fragile, ToS risk)
//     2. Use ECB SDW for Bund (slow, but free)
//     3. Show only the rates we can source cleanly and drop the rest
//     4. Decide later — keep placeholders for the ones we can't source
//
// Suggested implementation when ready:
//   - Move this to a Next.js Route Handler (app/api/market/route.ts)
//   - Cache 60 minutes (next: { revalidate: 3600 })
//   - Add NEXT_PUBLIC_FRED_API_KEY to .env.local and Vercel
//   - If a fetch fails, fall back to the previous value with a "stale" flag
// ---------------------------------------------------------------
