// Static fallback used when FRED_API_KEY is missing or FRED is unreachable.
// Update manually when the real curve drifts meaningfully.
import type { YieldCurve } from "@/lib/marketData";

export const FALLBACK_CURVE: YieldCurve = {
  points: [
    { tenorLabel: "2Y", tenorYears: 2, yield: 4.18 },
    { tenorLabel: "5Y", tenorYears: 5, yield: 4.10 },
    { tenorLabel: "10Y", tenorYears: 10, yield: 4.32 },
    { tenorLabel: "30Y", tenorYears: 30, yield: 4.55 },
  ],
  asOf: "2026-06-20",
};
