// Server-only market data fetchers. Each function returns null on
// failure so the UI can fall back to a placeholder without blowing up.

import "server-only";

export type YieldCurvePoint = { tenorLabel: string; tenorYears: number; yield: number };
export type YieldCurve = { points: YieldCurvePoint[]; asOf: string };

// Tenors we surface on the homepage chart. CSV column names match the
// U.S. Treasury Direct daily yield-curve feed exactly.
const CURVE_TENORS: { label: string; years: number; col: string }[] = [
  { label: "1Y", years: 1, col: "1 Yr" },
  { label: "2Y", years: 2, col: "2 Yr" },
  { label: "3Y", years: 3, col: "3 Yr" },
  { label: "5Y", years: 5, col: "5 Yr" },
  { label: "7Y", years: 7, col: "7 Yr" },
  { label: "10Y", years: 10, col: "10 Yr" },
  { label: "20Y", years: 20, col: "20 Yr" },
  { label: "30Y", years: 30, col: "30 Yr" },
];

// Minimal CSV row parser — handles quoted values with embedded commas.
function parseCsvLine(line: string): string[] {
  const out: string[] = [];
  let cur = "";
  let inQuotes = false;
  for (let i = 0; i < line.length; i++) {
    const c = line[i];
    if (c === '"') {
      inQuotes = !inQuotes;
    } else if (c === "," && !inQuotes) {
      out.push(cur);
      cur = "";
    } else {
      cur += c;
    }
  }
  out.push(cur);
  return out.map((s) => s.trim());
}

// Parse MM/DD/YYYY → "YYYY-MM-DD" without going through Date (avoids
// server timezone shifting the ISO output back a day).
function parseMdy(s: string): { iso: string; ts: number } | null {
  const m = s.match(/^(\d{2})\/(\d{2})\/(\d{4})$/);
  if (!m) return null;
  const [, mm, dd, yyyy] = m;
  return {
    iso: `${yyyy}-${mm}-${dd}`,
    ts: Date.UTC(Number(yyyy), Number(mm) - 1, Number(dd)),
  };
}

function monthParam(d: Date): string {
  return `${d.getUTCFullYear()}${String(d.getUTCMonth() + 1).padStart(2, "0")}`;
}

// U.S. Treasury Direct publishes the daily yield curve as CSV, free, no key.
// Posted around 4–5pm ET the same trading day the bonds settle (FRED then
// republishes the next morning — so this is one full business day fresher).
async function fetchTreasuryMonth(month: string): Promise<YieldCurve | null> {
  const url =
    `https://home.treasury.gov/resource-center/data-chart-center/interest-rates/daily-treasury-rates.csv/all/${month}` +
    `?type=daily_treasury_yield_curve&field_tdr_date_value_month=${month}&_format=csv`;
  try {
    const res = await fetch(url, { next: { revalidate: 3600 } });
    if (!res.ok) return null;
    const text = await res.text();
    const lines = text.trim().split(/\r?\n/);
    if (lines.length < 2) return null;
    const header = parseCsvLine(lines[0]);
    if (!header.includes("Date")) return null;

    const dateIdx = header.indexOf("Date");
    const tenorIdx = CURVE_TENORS.map((t) => header.indexOf(t.col));
    if (tenorIdx.some((i) => i < 0)) return null;

    let latestRow: string[] | null = null;
    let latestIso = "";
    let latestTs = 0;
    for (let i = 1; i < lines.length; i++) {
      const row = parseCsvLine(lines[i]);
      const parsed = parseMdy(row[dateIdx] ?? "");
      if (!parsed) continue;
      // Require all our tenors to be present in this row (no holiday gaps).
      const vals = tenorIdx.map((j) => Number(row[j]));
      if (vals.some((v) => !Number.isFinite(v))) continue;
      if (parsed.ts > latestTs) {
        latestTs = parsed.ts;
        latestIso = parsed.iso;
        latestRow = row;
      }
    }
    if (!latestRow) return null;

    const points = CURVE_TENORS.map((t, i) => ({
      tenorLabel: t.label,
      tenorYears: t.years,
      yield: Number(latestRow![tenorIdx[i]]),
    }));
    return { points, asOf: latestIso };
  } catch {
    return null;
  }
}

// The current month's file is small, and early in a month (or year) it may
// have no complete rows yet — fall back one month, which also crosses the
// year boundary correctly in January.
export async function getYieldCurve(): Promise<YieldCurve | null> {
  const now = new Date();
  const current = await fetchTreasuryMonth(monthParam(now));
  if (current) return current;
  const prev = new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth() - 1, 1));
  return fetchTreasuryMonth(monthParam(prev));
}
