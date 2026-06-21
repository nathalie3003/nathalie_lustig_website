// Visual placeholder for the static market band that goes between the
// hero and the recent notes. Wiring real data + final styling is a
// separate step — this is here just to anchor the homepage layout.

const ROWS = [
  { label: "Rates", items: ["UST 10Y", "Gilt 10Y", "Bund 10Y", "ILGB 10Y", "SOFR", "EUR Swap 10Y"] },
  { label: "FX", items: ["Cable", "EUR/USD", "EUR/GBP", "USD/ILS", "GBP/ILS"] },
  { label: "Commodities", items: ["Brent", "Gold"] },
];

export function MarketTickerPlaceholder() {
  return (
    <aside className="ticker-placeholder" aria-label="Reference rates and FX (placeholder)">
      <div className="tp-rows">
        {ROWS.map((r) => (
          <div key={r.label} className="tp-row">
            <span className="tp-label">{r.label}</span>
            <div className="tp-items">
              {r.items.map((s) => (
                <span key={s} className="tp-item">
                  <span className="tp-sym">{s}</span>
                  <span className="tp-val">—</span>
                </span>
              ))}
            </div>
          </div>
        ))}
      </div>
      <div className="tp-foot">Static market band — placeholder, styling and data to come</div>
    </aside>
  );
}
