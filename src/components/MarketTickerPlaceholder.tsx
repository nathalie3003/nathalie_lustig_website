// Editorial-neutral market band. Values are placeholders until the data
// layer is wired (FRED / Frankfurter / commodity feed).

type Dir = "up" | "down" | null;
type Quote = { sym: string; val: string; dir: Dir };

const ROWS: { label: string; short: string; items: Quote[] }[] = [
  {
    label: "Rates",
    short: "Rates",
    items: [
      { sym: "UST 10Y", val: "4.23%", dir: "up" },
      { sym: "Gilt 10Y", val: "4.51%", dir: "down" },
      { sym: "Bund 10Y", val: "2.34%", dir: "up" },
      { sym: "ILGB 10Y", val: "4.12%", dir: "up" },
      { sym: "SOFR", val: "5.31%", dir: null },
      { sym: "EUR Swap 10Y", val: "2.58%", dir: "up" },
    ],
  },
  {
    label: "FX",
    short: "FX",
    items: [
      { sym: "Cable", val: "1.2740", dir: "down" },
      { sym: "EUR/USD", val: "1.0822", dir: "up" },
      { sym: "EUR/GBP", val: "0.8495", dir: "up" },
      { sym: "USD/ILS", val: "3.7320", dir: "up" },
      { sym: "GBP/ILS", val: "4.7531", dir: "up" },
    ],
  },
  {
    label: "Commodities",
    short: "Comm",
    items: [
      { sym: "Brent", val: "$84.50", dir: "up" },
      { sym: "Gold", val: "$2,317", dir: "down" },
    ],
  },
];

const AS_OF = "Sat 21 Jun, 12:42 BST";

function Arrow({ dir }: { dir: Dir }) {
  if (!dir) return null;
  return (
    <span className={`tp-arrow tp-arrow-${dir}`} aria-hidden="true">
      {dir === "up" ? "▲" : "▼"}
    </span>
  );
}

export function MarketTickerPlaceholder() {
  return (
    <aside className="ticker-placeholder" aria-label="Reference rates, FX, and commodities">
      <div className="tp-rows">
        {ROWS.map((r, i) => (
          <div key={r.label} className={`tp-row${i < ROWS.length - 1 ? " tp-row-rule" : ""}`}>
            <span className="tp-label">{r.short}</span>
            <div className="tp-items">
              {r.items.map((q, j) => (
                <span key={q.sym} className="tp-item">
                  <span className="tp-sym">{q.sym}</span>
                  <span className="tp-val">{q.val}</span>
                  <Arrow dir={q.dir} />
                  {j < r.items.length - 1 && <span className="tp-sep" aria-hidden="true">·</span>}
                </span>
              ))}
            </div>
          </div>
        ))}
      </div>
      <div className="tp-foot">As of {AS_OF}</div>
    </aside>
  );
}
