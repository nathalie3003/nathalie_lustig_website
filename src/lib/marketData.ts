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
