// Editorial-neutral market band. FX comes live from Frankfurter (ECB,
// no key). UST 10Y + SOFR come live from FRED when FRED_API_KEY is set.
// Everything else is a static placeholder until a data source is wired.

import { getCommodityQuotes, getFxQuotes, getRateQuotes, todayCaption, type Quote } from "@/lib/marketData";

const PLACEHOLDER_RATES: Quote[] = [
  { sym: "UST 10Y", val: "4.23%", dir: "up" },
  { sym: "Gilt 10Y", val: "4.51%", dir: "down" },
  { sym: "ILGB 10Y", val: "4.12%", dir: "up" },
  { sym: "SOFR", val: "5.31%", dir: null },
];

const PLACEHOLDER_FX: Quote[] = [
  { sym: "Cable", val: "1.2740", dir: "down" },
  { sym: "EUR/USD", val: "1.0822", dir: "up" },
  { sym: "EUR/GBP", val: "0.8495", dir: "up" },
  { sym: "USD/ILS", val: "3.7320", dir: "up" },
  { sym: "GBP/ILS", val: "4.7531", dir: "up" },
];

const PLACEHOLDER_COMM: Quote[] = [
  { sym: "Gold", val: "$2,317", dir: "down" },
];

function Arrow({ dir }: { dir: Quote["dir"] }) {
  if (!dir) return null;
  return (
    <span className={`tp-arrow tp-arrow-${dir}`} aria-hidden="true">
      {dir === "up" ? "▲" : "▼"}
    </span>
  );
}

function Row({ short, items }: { short: string; items: Quote[]; ruled?: boolean }) {
  return (
    <div className="tp-row tp-row-rule">
      <span className="tp-label">{short}</span>
      <div className="tp-items">
        {items.map((q, j) => (
          <span key={q.sym} className="tp-item">
            <span className="tp-sym">{q.sym}</span>
            <span className="tp-val">{q.val}</span>
            <Arrow dir={q.dir} />
            {j < items.length - 1 && <span className="tp-sep" aria-hidden="true">·</span>}
          </span>
        ))}
      </div>
    </div>
  );
}

function byOrder(live: Quote[] | null, order: string[], fallback: Quote[]): Quote[] {
  if (!live) return fallback;
  const liveMap = new Map(live.map((q) => [q.sym, q]));
  const fallbackMap = new Map(fallback.map((q) => [q.sym, q]));
  return order
    .map((sym) => liveMap.get(sym) ?? fallbackMap.get(sym))
    .filter((q): q is Quote => Boolean(q));
}

export async function MarketTickerPlaceholder() {
  const [fx, rates, comm] = await Promise.all([getFxQuotes(), getRateQuotes(), getCommodityQuotes()]);

  const rateItems = PLACEHOLDER_RATES.map((q) => {
    if (q.sym === "UST 10Y" && rates.ust10y) return rates.ust10y;
    if (q.sym === "SOFR" && rates.sofr) return rates.sofr;
    return q;
  });

  const fxItems = byOrder(fx, ["Cable", "EUR/USD", "EUR/GBP", "USD/ILS", "GBP/ILS"], PLACEHOLDER_FX);

  const commItems = PLACEHOLDER_COMM.map((q) => {
    if (q.sym === "Gold" && comm.gold) return comm.gold;
    return q;
  });

  return (
    <aside className="ticker-placeholder" aria-label="Reference rates, FX, and commodities">
      <div className="tp-rows">
        <Row short="Rates" items={rateItems} />
        <Row short="FX" items={fxItems} />
        <Row short="Comm" items={commItems} />
      </div>
      <div className="tp-foot">As of {todayCaption()}</div>
    </aside>
  );
}
