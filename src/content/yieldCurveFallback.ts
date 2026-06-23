// Static fallback used when FRED_API_KEY is missing or FRED is unreachable.
// Update manually when the real curve drifts meaningfully.
import type { YieldCurve } from "@/lib/marketData";

export const FALLBACK_CURVE: YieldCurve = {
  points: [
    { tenorLabel: "1Y", tenorYears: 1, yield: 4.22 },
    { tenorLabel: "2Y", tenorYears: 2, yield: 4.18 },
    { tenorLabel: "3Y", tenorYears: 3, yield: 4.14 },
    { tenorLabel: "5Y", tenorYears: 5, yield: 4.10 },
    { tenorLabel: "7Y", tenorYears: 7, yield: 4.20 },
    { tenorLabel: "10Y", tenorYears: 10, yield: 4.32 },
    { tenorLabel: "20Y", tenorYears: 20, yield: 4.48 },
    { tenorLabel: "30Y", tenorYears: 30, yield: 4.55 },
  ],
  asOf: "2026-06-20",
};
