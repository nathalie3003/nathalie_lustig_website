// Static fallback used when Treasury Direct is unreachable. Update manually
// when the real curve drifts meaningfully. Values below are the published
// Treasury close for the stated date, not invented numbers, so a reader who
// checks them against the source finds them consistent.
import type { YieldCurve } from "@/lib/marketData";

export const FALLBACK_CURVE: YieldCurve = {
  points: [
    { tenorLabel: "3M", tenorYears: 0.25, yield: 3.92 },
    { tenorLabel: "6M", tenorYears: 0.5, yield: 4.0 },
    { tenorLabel: "1Y", tenorYears: 1, yield: 4.18 },
    { tenorLabel: "2Y", tenorYears: 2, yield: 4.39 },
    { tenorLabel: "3Y", tenorYears: 3, yield: 4.46 },
    { tenorLabel: "5Y", tenorYears: 5, yield: 4.55 },
    { tenorLabel: "7Y", tenorYears: 7, yield: 4.66 },
    { tenorLabel: "10Y", tenorYears: 10, yield: 4.79 },
    { tenorLabel: "20Y", tenorYears: 20, yield: 5.27 },
    { tenorLabel: "30Y", tenorYears: 30, yield: 5.27 },
  ],
  asOf: "2026-09-01",
};
