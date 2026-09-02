// Server-only market data fetchers. Each function returns null on
// failure so the UI can fall back to a placeholder without blowing up.

import "server-only";

export type YieldCurvePoint = { tenorLabel: string; tenorYears: number; yield: number };
export type YieldCurve = { points: YieldCurvePoint[]; asOf: string };

// Tenors we surface on the homepage chart. CSV column names match the
// U.S. Treasury Direct daily yield-curve feed exactly.
const CURVE_TENORS: { label: string; years: number; col: string }[] = [
  { label: "3M", years: 0.25, col: "3 Mo" },
  { label: "6M", years: 0.5, col: "6 Mo" },
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

export type CurveHistoryPoint = { date: string; yield: number };
export type CurveHistory = { tenorLabel: string; points: CurveHistoryPoint[] };

// Ordered tenor labels for the history chart, and the FRED series id behind
// each one. FRED is the right source here even though Treasury is preferred
// for the snapshot above: FRED gives a clean, long daily series per tenor in
// a single request, while Treasury's CSV is organised by month, so building
// years of history from it would mean dozens of requests.
const FRED_SERIES_BY_TENOR: Record<string, string> = {
  "3M": "DGS3MO",
  "6M": "DGS6MO",
  "1Y": "DGS1",
  "2Y": "DGS2",
  "3Y": "DGS3",
  "5Y": "DGS5",
  "7Y": "DGS7",
  "10Y": "DGS10",
  "20Y": "DGS20",
  "30Y": "DGS30",
};

export const HISTORY_TENORS: string[] = [
  "3M",
  "6M",
  "1Y",
  "2Y",
  "3Y",
  "5Y",
  "7Y",
  "10Y",
  "20Y",
  "30Y",
];

// Which calendar quarter an ISO date (YYYY-MM-DD) falls in, as a sortable key.
function quarterKey(iso: string): string {
  const [yyyy, mm] = iso.split("-");
  const q = Math.ceil(Number(mm) / 3);
  return `${yyyy}Q${q}`;
}

export async function getTenorHistory(tenorLabel: string): Promise<CurveHistory | null> {
  const seriesId = FRED_SERIES_BY_TENOR[tenorLabel];
  if (!seriesId) return null;

  const apiKey = process.env.FRED_API_KEY;
  if (!apiKey) {
    console.error("FRED_API_KEY is not set, skipping tenor history fetch");
    return null;
  }

  const url =
    `https://api.stlouisfed.org/fred/series/observations?series_id=${seriesId}` +
    `&api_key=${apiKey}&file_type=json&observation_start=2021-01-01`;

  try {
    const res = await fetch(url, { next: { revalidate: 86400 } });
    if (!res.ok) return null;
    const data = await res.json();
    const observations: { date: string; value: string }[] = data?.observations ?? [];

    // FRED marks missing days with ".", drop anything that isn't a finite number.
    const valid = observations
      .map((o) => ({ date: o.date, yield: Number(o.value) }))
      .filter((o) => Number.isFinite(o.yield));
    if (valid.length === 0) return null;

    // Downsample to quarter-end: keep the last observation seen per quarter.
    const lastByQuarter = new Map<string, CurveHistoryPoint>();
    for (const point of valid) {
      lastByQuarter.set(quarterKey(point.date), point);
    }
    const points = Array.from(lastByQuarter.values()).sort((a, b) =>
      a.date < b.date ? -1 : a.date > b.date ? 1 : 0
    );

    // Extend the line to the most recent trading day if it's newer than the
    // last quarter-end point we kept, so the chart doesn't lag behind today.
    const last = valid[valid.length - 1];
    if (points.length === 0 || last.date > points[points.length - 1].date) {
      points.push(last);
    }

    return { tenorLabel, points };
  } catch {
    return null;
  }
}

export async function getAllTenorHistories(): Promise<CurveHistory[]> {
  const results = await Promise.all(HISTORY_TENORS.map((label) => getTenorHistory(label)));
  return results.filter((r): r is CurveHistory => r !== null);
}
