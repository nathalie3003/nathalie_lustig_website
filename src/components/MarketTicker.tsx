import { getMarketSnapshot, type Tick } from "@/lib/marketData";

function formatAsOf(iso: string) {
  const d = new Date(iso);
  return d.toLocaleString("en-GB", {
    weekday: "short",
    day: "numeric",
    month: "short",
    hour: "2-digit",
    minute: "2-digit",
    timeZone: "Europe/London",
    timeZoneName: "short",
  });
}

function TickItem({ t }: { t: Tick }) {
  const dir =
    t.change === undefined || t.change === 0
      ? "flat"
      : t.change > 0
      ? "up"
      : "down";
  const arrow = dir === "up" ? "▴" : dir === "down" ? "▾" : "·";
  return (
    <span className={`mt-tick mt-${dir}`}>
      <span className="mt-symbol">{t.symbol}</span>
      <span className="mt-value">{t.value}</span>
      <span className="mt-arrow" aria-hidden="true">{arrow}</span>
    </span>
  );
}

export async function MarketTicker() {
  const snap = await getMarketSnapshot();

  return (
    <aside className="market-ticker" aria-label="Reference rates and FX">
      <div className="mt-inner">
        <div className="mt-rows">
          {snap.groups.map((g) => (
            <div key={g.label} className="mt-row">
              <span className="mt-row-label">{g.label}</span>
              <div className="mt-row-ticks">
                {g.ticks.map((t) => (
                  <TickItem key={t.symbol} t={t} />
                ))}
              </div>
            </div>
          ))}
        </div>
        <div className="mt-meta">
          <span className="mt-asof">As of {formatAsOf(snap.asOf)}</span>
          {snap.source === "placeholder" ? (
            <span className="mt-placeholder">Preview · sample data</span>
          ) : null}
        </div>
      </div>
    </aside>
  );
}
