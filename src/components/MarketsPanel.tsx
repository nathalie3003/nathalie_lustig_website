import type { CurveHistory, YieldCurvePoint } from "@/lib/marketData";

// The front page's markets column, set like the markets box of a newspaper:
// the Treasury curve today against the curve a year ago, the key yields with
// their change over the year, and the two spreads she writes about most.
// The chart is decoration for sighted readers; the table carries the numbers.

const VW = 320;
const VH = 150;
const PAD_L = 4;
const PAD_R = 4;
const PAD_T = 10;
const PAD_B = 2;

const TABLE_TENORS = ["3M", "2Y", "10Y", "30Y"];

function formatDay(iso: string) {
  const d = new Date(`${iso}T12:00:00Z`);
  return Number.isNaN(d.getTime())
    ? iso
    : d.toLocaleDateString("en-GB", { day: "numeric", month: "short", year: "numeric", timeZone: "UTC" });
}

// The history's value closest to a year before `asOf`, if the series reaches back that far.
function yearAgo(history: CurveHistory | undefined, asOf: string): number | null {
  if (!history || history.points.length === 0) return null;
  const target = new Date(`${asOf}T12:00:00Z`);
  target.setUTCFullYear(target.getUTCFullYear() - 1);
  const t = target.toISOString().slice(0, 10);
  let best: { date: string; yield: number } | null = null;
  for (const p of history.points) if (p.date <= t) best = p;
  return best ? best.yield : null;
}

const bp = (a: number, b: number) => Math.round((a - b) * 100);
const signed = (n: number) => (n > 0 ? `+${n}` : n < 0 ? `−${Math.abs(n)}` : "0");

export function MarketsPanel({
  points,
  asOf,
  histories,
}: {
  points: YieldCurvePoint[];
  asOf: string;
  histories: CurveHistory[];
}) {
  const byTenor = new Map(histories.map((h) => [h.tenorLabel, h]));
  const then = points.map((p) => yearAgo(byTenor.get(p.tenorLabel), asOf));
  const hasThen = then.every((v) => v !== null);

  const all = points.map((p) => p.yield).concat(hasThen ? (then as number[]) : []);
  const lo = Math.floor((Math.min(...all) - 0.15) * 4) / 4;
  const hi = Math.ceil((Math.max(...all) + 0.15) * 4) / 4;
  const n = points.length;
  const x = (i: number) => PAD_L + (i / Math.max(1, n - 1)) * (VW - PAD_L - PAD_R);
  const y = (v: number) => PAD_T + ((hi - v) / (hi - lo || 1)) * (VH - PAD_T - PAD_B);
  const line = (vals: number[]) => vals.map((v, i) => `${i ? "L" : "M"}${x(i).toFixed(1)},${y(v).toFixed(1)}`).join(" ");
  const nowPath = line(points.map((p) => p.yield));
  const thenPath = hasThen ? line(then as number[]) : null;
  const area = `${nowPath} L${x(n - 1).toFixed(1)},${VH - PAD_B} L${x(0).toFixed(1)},${VH - PAD_B} Z`;

  const at = (label: string) => points.find((p) => p.tenorLabel === label);
  const s2s10 = at("2Y") && at("10Y") ? bp(at("10Y")!.yield, at("2Y")!.yield) : null;
  const s3m30 = at("3M") && at("30Y") ? bp(at("30Y")!.yield, at("3M")!.yield) : null;
  const rows = TABLE_TENORS.map((label) => {
    const i = points.findIndex((p) => p.tenorLabel === label);
    if (i < 0) return null;
    const prev = then[i];
    return { label, yield: points[i].yield, change: prev === null ? null : bp(points[i].yield, prev) };
  }).filter((r): r is NonNullable<typeof r> => r !== null);
  const showChange = rows.some((r) => r.change !== null);

  return (
    <section className="mk" aria-labelledby="mk-title">
      <div className="mk-head">
        <h2 className="mk-title" id="mk-title">
          Markets
        </h2>
        <span className="mk-asof">US Treasuries · {formatDay(asOf)}</span>
      </div>

      <figure className="mk-chart" aria-hidden="true">
        <svg viewBox={`0 0 ${VW} ${VH}`} preserveAspectRatio="none" className="mk-svg">
          {[0.25, 0.5, 0.75].map((f) => (
            <line key={f} x1={0} x2={VW} y1={PAD_T + f * (VH - PAD_T - PAD_B)} y2={PAD_T + f * (VH - PAD_T - PAD_B)} className="mk-grid" />
          ))}
          <path d={area} className="mk-area" />
          {thenPath ? <path d={thenPath} className="mk-then" /> : null}
          <path d={nowPath} className="mk-now" />
          <circle cx={x(n - 1)} cy={y(points[n - 1].yield)} r={3} className="mk-dot" />
        </svg>
        <div className="mk-xlabels">
          {points.map((p, i) =>
            i === 0 || p.tenorLabel === "2Y" || p.tenorLabel === "10Y" || i === n - 1 ? (
              <span key={p.tenorLabel} style={{ left: `${(x(i) / VW) * 100}%` }}>
                {p.tenorLabel}
              </span>
            ) : null,
          )}
        </div>
        <figcaption className="mk-legend">
          <span className="mk-key mk-key-now">Today</span>
          {hasThen ? <span className="mk-key mk-key-then">A year ago</span> : null}
        </figcaption>
      </figure>

      <table className="mk-table">
        <caption className="sr-only">US Treasury yields on {formatDay(asOf)}</caption>
        <thead>
          <tr>
            <th scope="col">Tenor</th>
            <th scope="col">Yield</th>
            {showChange ? <th scope="col">1y chg, bp</th> : null}
          </tr>
        </thead>
        <tbody>
          {rows.map((r) => (
            <tr key={r.label}>
              <th scope="row">{r.label}</th>
              <td>{r.yield.toFixed(2)}%</td>
              {showChange ? (
                <td className={r.change !== null && r.change < 0 ? "is-down" : undefined}>
                  {r.change === null ? "–" : signed(r.change)}
                </td>
              ) : null}
            </tr>
          ))}
        </tbody>
      </table>

      <dl className="mk-spreads">
        {s2s10 !== null ? (
          <div>
            <dt>2s10s</dt>
            <dd>{signed(s2s10)}bp</dd>
          </div>
        ) : null}
        {s3m30 !== null ? (
          <div>
            <dt>3M to 30Y</dt>
            <dd>{signed(s3m30)}bp</dd>
          </div>
        ) : null}
      </dl>
      <p className="mk-source">
        Source: US Treasury, FRED.{" "}
        {hasThen ? "Year-ago curve from the nearest quarter-end close." : null}
      </p>
    </section>
  );
}
