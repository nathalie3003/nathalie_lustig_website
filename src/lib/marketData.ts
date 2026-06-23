// Server-only market data fetchers. Each function returns null on
// failure so the UI can fall back to a placeholder without blowing up.
// All fetches are cached for 24h via Next.js's `revalidate` — APIs are
// hit once per day per region, not per request.

import "server-only";

const DAY = 86400;

export type Quote = {
  sym: string;
  val: string;
  dir: "up" | "down" | null;
};

// ---------- Frankfurter (FX) — no API key required ----------
// https://api.frankfurter.dev — ECB reference rates, daily.

type FrankfurterTimeseries = {
  rates: Record<string, Record<string, number>>;
};

async function fetchFxTimeseries(base: string, quotes: string[]): Promise<FrankfurterTimeseries | null> {
  // Pull the last 7 days so we always have at least two business days
  // even across weekends/holidays.
  const end = new Date();
  const start = new Date(end);
  start.setDate(start.getDate() - 7);
  const iso = (d: Date) => d.toISOString().slice(0, 10);
  const url = `https://api.frankfurter.dev/v1/${iso(start)}..${iso(end)}?base=${base}&symbols=${quotes.join(",")}`;
  try {
    const res = await fetch(url, { next: { revalidate: DAY } });
    if (!res.ok) return null;
    return (await res.json()) as FrankfurterTimeseries;
  } catch {
    return null;
  }
}

function latestTwo(series: FrankfurterTimeseries, quote: string): [number, number] | null {
  const dates = Object.keys(series.rates).sort();
  if (dates.length < 2) return null;
  const last = series.rates[dates[dates.length - 1]]?.[quote];
  const prev = series.rates[dates[dates.length - 2]]?.[quote];
  if (typeof last !== "number" || typeof prev !== "number") return null;
  return [prev, last];
}

function fmtFx(n: number, decimals = 4): string {
  return n.toFixed(decimals);
}

function dirOf(prev: number, curr: number): Quote["dir"] {
  if (curr > prev) return "up";
  if (curr < prev) return "down";
  return null;
}

export async function getFxQuotes(): Promise<Quote[] | null> {
  // Cable = GBP/USD. EUR/USD, EUR/GBP from EUR base. USD/ILS, GBP/ILS
  // need separate fetches because base differs.
  const [gbpBase, eurBase, usdBase] = await Promise.all([
    fetchFxTimeseries("GBP", ["USD", "ILS"]),
    fetchFxTimeseries("EUR", ["USD", "GBP"]),
    fetchFxTimeseries("USD", ["ILS"]),
  ]);
  if (!gbpBase || !eurBase || !usdBase) return null;

  const cable = latestTwo(gbpBase, "USD");
  const eurusd = latestTwo(eurBase, "USD");
  const eurgbp = latestTwo(eurBase, "GBP");
  const usdils = latestTwo(usdBase, "ILS");
  const gbpils = latestTwo(gbpBase, "ILS");

  const out: Quote[] = [];
  if (cable) out.push({ sym: "Cable", val: fmtFx(cable[1], 4), dir: dirOf(...cable) });
  if (eurusd) out.push({ sym: "EUR/USD", val: fmtFx(eurusd[1], 4), dir: dirOf(...eurusd) });
  if (eurgbp) out.push({ sym: "EUR/GBP", val: fmtFx(eurgbp[1], 4), dir: dirOf(...eurgbp) });
  if (usdils) out.push({ sym: "USD/ILS", val: fmtFx(usdils[1], 4), dir: dirOf(...usdils) });
  if (gbpils) out.push({ sym: "GBP/ILS", val: fmtFx(gbpils[1], 4), dir: dirOf(...gbpils) });
  return out.length ? out : null;
}

// ---------- FRED (US rates) — free API key required ----------
// Set FRED_API_KEY in env. https://fred.stlouisfed.org/docs/api/api_key.html

type FredObs = { date: string; value: string };
type FredResp = { observations: FredObs[] };

async function fetchFredSeries(seriesId: string): Promise<[number, number] | null> {
  const key = process.env.FRED_API_KEY;
  if (!key) return null;
  const url =
    `https://api.stlouisfed.org/fred/series/observations` +
    `?series_id=${seriesId}&api_key=${key}&file_type=json` +
    `&sort_order=desc&limit=10`;
  try {
    const res = await fetch(url, { next: { revalidate: DAY } });
    if (!res.ok) return null;
    const data = (await res.json()) as FredResp;
    const valid = data.observations
      .map((o) => Number(o.value))
      .filter((n) => Number.isFinite(n));
    if (valid.length < 2) return null;
    return [valid[1], valid[0]]; // [prev, latest]
  } catch {
    return null;
  }
}

export async function getRateQuotes(): Promise<{ ust10y: Quote | null; sofr: Quote | null }> {
  const [ust, sofr] = await Promise.all([
    fetchFredSeries("DGS10"),
    fetchFredSeries("SOFR"),
  ]);
  return {
    ust10y: ust ? { sym: "UST 10Y", val: `${ust[1].toFixed(2)}%`, dir: dirOf(...ust) } : null,
    sofr: sofr ? { sym: "SOFR", val: `${sofr[1].toFixed(2)}%`, dir: dirOf(...sofr) } : null,
  };
}

// ---------- Yield curve (FRED, four tenors) ----------

export type YieldCurvePoint = { tenorLabel: string; tenorYears: number; yield: number };
export type YieldCurve = { points: YieldCurvePoint[]; asOf: string };

async function fetchFredLatest(
  seriesId: string,
): Promise<{ value: number; date: string } | null> {
  const key = process.env.FRED_API_KEY;
  if (!key) return null;
  const url =
    `https://api.stlouisfed.org/fred/series/observations` +
    `?series_id=${seriesId}&api_key=${key}&file_type=json` +
    `&sort_order=desc&limit=5`;
  try {
    const res = await fetch(url, { next: { revalidate: DAY } });
    if (!res.ok) return null;
    const data = (await res.json()) as FredResp;
    for (const obs of data.observations) {
      const v = Number(obs.value);
      if (Number.isFinite(v)) return { value: v, date: obs.date };
    }
    return null;
  } catch {
    return null;
  }
}

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

// U.S. Treasury Direct publishes the daily yield curve as CSV, free, no key.
// Posted around 4–5pm ET the same trading day the bonds settle (FRED then
// republishes the next morning — so this is one full business day fresher).
async function fetchTreasuryYieldCurve(): Promise<YieldCurve | null> {
  const year = new Date().getUTCFullYear();
  const url =
    `https://home.treasury.gov/resource-center/data-chart-center/interest-rates/daily-treasury-rates.csv/${year}/all` +
    `?type=daily_treasury_yield_curve&_format=csv`;
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

    // Parse MM/DD/YYYY → "YYYY-MM-DD" without going through Date (avoids
    // server timezone shifting the ISO output back a day).
    const parseMdy = (s: string): { iso: string; ts: number } | null => {
      const m = s.match(/^(\d{2})\/(\d{2})\/(\d{4})$/);
      if (!m) return null;
      const [, mm, dd, yyyy] = m;
      return {
        iso: `${yyyy}-${mm}-${dd}`,
        ts: Date.UTC(Number(yyyy), Number(mm) - 1, Number(dd)),
      };
    };

    let latestRow: string[] | null = null;
    let latestIso = "";
    let latestTs = 0;
    for (let i = 1; i < lines.length; i++) {
      const row = parseCsvLine(lines[i]);
      const parsed = parseMdy(row[dateIdx]);
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

export async function getYieldCurve(): Promise<YieldCurve | null> {
  return fetchTreasuryYieldCurve();
}

// ---------- Twelve Data (commodities) — free API key required ----------
// Set TWELVE_DATA_API_KEY in env. Free tier covers precious metals
// (XAU/USD, XAG/USD) but NOT commodity futures (BRENT, WTI), so Brent
// stays a placeholder until we move tiers or pick another source.

type TwelveValues = { values?: { close: string }[]; status?: string };

async function fetchTwelveData(symbols: string[]): Promise<Record<string, [number, number]> | null> {
  const key = process.env.TWELVE_DATA_API_KEY;
  if (!key) return null;
  const url =
    `https://api.twelvedata.com/time_series` +
    `?symbol=${encodeURIComponent(symbols.join(","))}` +
    `&interval=1day&outputsize=2&apikey=${key}`;
  try {
    const res = await fetch(url, { next: { revalidate: DAY } });
    if (!res.ok) return null;
    const data = (await res.json()) as Record<string, TwelveValues>;
    const out: Record<string, [number, number]> = {};
    // Single-symbol responses are flat; multi-symbol responses are keyed by symbol.
    const entries = symbols.length === 1 ? [[symbols[0], data as TwelveValues]] as const : Object.entries(data);
    for (const [sym, payload] of entries) {
      if (!payload || payload.status === "error" || !payload.values || payload.values.length < 2) continue;
      const latest = Number(payload.values[0].close);
      const prev = Number(payload.values[1].close);
      if (Number.isFinite(latest) && Number.isFinite(prev)) out[sym] = [prev, latest];
    }
    return Object.keys(out).length ? out : null;
  } catch {
    return null;
  }
}

function fmtUsd(n: number): string {
  return `$${n.toLocaleString("en-US", { maximumFractionDigits: 0 })}`;
}

export async function getCommodityQuotes(): Promise<{ gold: Quote | null }> {
  const data = await fetchTwelveData(["XAU/USD"]);
  const gold = data?.["XAU/USD"];
  return {
    gold: gold ? { sym: "Gold", val: fmtUsd(gold[1]), dir: dirOf(...gold) } : null,
  };
}

export function todayCaption(): string {
  const now = new Date();
  const fmt = new Intl.DateTimeFormat("en-GB", {
    weekday: "short",
    day: "numeric",
    month: "short",
    hour: "2-digit",
    minute: "2-digit",
    timeZone: "Europe/London",
    timeZoneName: "short",
  });
  return fmt.format(now);
}
