"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import type { CurveHistory, YieldCurvePoint } from "@/lib/marketData";

type Props = {
  snapshot: YieldCurvePoint[];
  asOf: string;
  histories: CurveHistory[];
};

// Viewbox is fixed; the card scales it to whatever width the hero column gets.
const VW = 520;
const VH = 210;
const PAD_L = 40;
const PAD_R = 12;
const PAD_T = 12;
const PAD_B = 26;
const DRAW_MS = 2600;

const sx = (i: number, n: number) =>
  n <= 1 ? PAD_L : PAD_L + (i / (n - 1)) * (VW - PAD_L - PAD_R);

const sy = (v: number, lo: number, hi: number) =>
  hi === lo ? PAD_T : PAD_T + ((hi - v) / (hi - lo)) * (VH - PAD_T - PAD_B);

// Monotone cubic (Fritsch–Carlson) through the points.
//
// The tangent at each tenor has to follow the local slope. Handles that are
// merely horizontal force the slope to zero at every point, which flattens the
// line at each tenor and ramps it in between: the curve reads as a staircase,
// which is worse than the polyline it was meant to improve on. Taking the
// tangents from the weighted harmonic mean of the neighbouring secants gives
// one continuous line, and because that mean collapses to zero wherever the
// secants disagree in sign, the curve still cannot overshoot a tenor.
function pathOf(vals: number[], lo: number, hi: number): string {
  const n = vals.length;
  if (n === 0) return "";
  const xs = vals.map((_, i) => sx(i, n));
  const ys = vals.map((v) => sy(v, lo, hi));
  if (n === 1) return `M ${xs[0].toFixed(1)} ${ys[0].toFixed(1)}`;

  const dx: number[] = [];
  const slope: number[] = [];
  for (let i = 0; i < n - 1; i++) {
    dx.push(xs[i + 1] - xs[i]);
    slope.push((ys[i + 1] - ys[i]) / dx[i]);
  }

  // Ends take their secant outright; interior points take the weighted harmonic
  // mean, which is bounded by the shallower of the two secants either side.
  const m: number[] = new Array(n);
  m[0] = slope[0];
  m[n - 1] = slope[n - 2];
  for (let i = 1; i < n - 1; i++) {
    if (slope[i - 1] * slope[i] <= 0) {
      m[i] = 0; // a turning point, or a flat run: level the tangent off
    } else {
      const w1 = 2 * dx[i] + dx[i - 1];
      const w2 = dx[i] + 2 * dx[i - 1];
      m[i] = (w1 + w2) / (w1 / slope[i - 1] + w2 / slope[i]);
    }
  }

  let d = `M ${xs[0].toFixed(1)} ${ys[0].toFixed(1)}`;
  for (let i = 0; i < n - 1; i++) {
    const h = dx[i] / 3;
    d +=
      ` C ${(xs[i] + h).toFixed(1)} ${(ys[i] + m[i] * h).toFixed(1)},` +
      ` ${(xs[i + 1] - h).toFixed(1)} ${(ys[i + 1] - m[i + 1] * h).toFixed(1)},` +
      ` ${xs[i + 1].toFixed(1)} ${ys[i + 1].toFixed(1)}`;
  }
  return d;
}

// Pad the range so the line never touches the frame, with a floor so a flat
// series still gets a sensible band rather than collapsing to a straight edge.
function bounds(vals: number[]): [number, number] {
  const lo = Math.min(...vals);
  const hi = Math.max(...vals);
  const pad = Math.max(0.25, (hi - lo) * 0.22);
  return [Math.max(0, lo - pad), hi + pad];
}

function ticksFor(lo: number, hi: number): number[] {
  const span = hi - lo;
  const step = span > 3 ? 1 : span > 1.4 ? 0.5 : 0.25;
  const out: number[] = [];
  for (let t = Math.ceil(lo / step) * step; t <= hi + 1e-4; t += step) {
    out.push(Number(t.toFixed(2)));
  }
  return out;
}

const bp = (delta: number) => `${delta > 0 ? "+" : ""}${Math.round(delta * 100)}bp`;

function formatAsOf(iso: string): string {
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return iso;
  return d.toLocaleDateString("en-GB", {
    day: "numeric",
    month: "short",
    year: "numeric",
    timeZone: "UTC",
  });
}

export function CurveCard({ snapshot, asOf, histories }: Props) {
  const [selected, setSelected] = useState<string>("all");
  const [open, setOpen] = useState(false);
  const [hoverIdx, setHoverIdx] = useState<number | null>(null);
  const [redrawTick, setRedrawTick] = useState(0);
  const [hovering, setHovering] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);

  // The line redraws itself every few seconds so the card has a pulse rather
  // than sitting inert after its first draw. It holds still while the pointer
  // is on the card: redrawing under someone reading a tenor off it would wipe
  // the value they are looking at. Off entirely under reduced motion, and the
  // decision is made after mount so the server and client markup match.
  useEffect(() => {
    if (hovering || open) return;
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    const id = window.setInterval(() => setRedrawTick((t) => t + 1), 5000);
    return () => window.clearInterval(id);
  }, [hovering, open]);

  const isAll = selected === "all";
  const history = useMemo(
    () => histories.find((h) => h.tenorLabel === selected) ?? null,
    [histories, selected],
  );

  // One shape drives the chart in both modes, so the render path below does not
  // branch: the only difference is what the x axis is counting.
  const series = useMemo(() => {
    if (isAll) {
      return {
        values: snapshot.map((p) => p.yield),
        labels: snapshot.map((p) => p.tenorLabel),
        showDots: true,
      };
    }
    if (!history) return { values: [], labels: [], showDots: false };
    return {
      values: history.points.map((p) => p.yield),
      // Label the first quarter of each year and leave the rest blank, so the
      // axis reads as a timeline without crowding.
      labels: history.points.map((p, i, arr) => {
        const year = p.date.slice(0, 4);
        const prev = i > 0 ? arr[i - 1].date.slice(0, 4) : null;
        return year !== prev ? `'${year.slice(2)}` : "";
      }),
      showDots: false,
    };
  }, [isAll, snapshot, history]);

  const chart = useMemo(() => {
    if (series.values.length === 0) return null;
    const [lo, hi] = bounds(series.values);
    return {
      lo,
      hi,
      d: pathOf(series.values, lo, hi),
      ticks: ticksFor(lo, hi),
      n: series.values.length,
    };
  }, [series]);

  const readout = useMemo(() => {
    if (isAll) {
      if (hoverIdx !== null && snapshot[hoverIdx]) {
        const p = snapshot[hoverIdx];
        return { caption: `${p.tenorLabel} · ${formatAsOf(asOf)}`, value: `${p.yield.toFixed(2)}%` };
      }
      if (snapshot.length < 2) return { caption: "US Treasury", value: "n/a" };
      const spread = snapshot[snapshot.length - 1].yield - snapshot[0].yield;
      return {
        caption: `${snapshot[0].tenorLabel} → ${snapshot[snapshot.length - 1].tenorLabel} spread`,
        value: bp(spread),
      };
    }
    if (!history || history.points.length < 2) {
      return { caption: `${selected} · no history`, value: "n/a" };
    }
    const first = history.points[0];
    const last = history.points[history.points.length - 1];
    return {
      caption: `${selected} · vs ${first.date.slice(0, 4)}`,
      value: bp(last.yield - first.yield),
    };
  }, [isAll, hoverIdx, snapshot, asOf, history, selected]);

  const options = useMemo(
    () => [
      { key: "all", label: "All maturities", hint: "curve" },
      ...histories.map((h) => ({ key: h.tenorLabel, label: h.tenorLabel, hint: "history" })),
    ],
    [histories],
  );

  // Replaying the draw on every change is the point: the line redrawing is the
  // feedback that the selection took effect.
  const drawKey = `${selected}-${chart?.n ?? 0}-${redrawTick}`;

  return (
    <div
      className="curve-card"
      onMouseEnter={() => setHovering(true)}
      onMouseLeave={() => {
        setHovering(false);
        setHoverIdx(null);
      }}
    >
      <div className="curve-head">
        <span className="curve-eyebrow">US Treasury</span>
        <div className="curve-select" ref={menuRef}>
          <button
            type="button"
            className="curve-trigger"
            aria-expanded={open}
            aria-haspopup="listbox"
            onClick={() => setOpen((o) => !o)}
            onBlur={(e) => {
              if (!menuRef.current?.contains(e.relatedTarget as Node)) setOpen(false);
            }}
          >
            {isAll ? "All maturities" : selected}
            <span className="curve-caret" aria-hidden="true">
              ▼
            </span>
          </button>
          {open && (
            <div className="curve-menu" role="listbox" data-lenis-prevent>
              {options.map((o) => (
                <button
                  type="button"
                  key={o.key}
                  role="option"
                  aria-selected={o.key === selected}
                  className={`curve-opt${o.key === selected ? " is-active" : ""}`}
                  onClick={() => {
                    setSelected(o.key);
                    setHoverIdx(null);
                    setOpen(false);
                  }}
                >
                  {o.label}
                  <span className="curve-opt-hint">{o.hint}</span>
                </button>
              ))}
            </div>
          )}
        </div>
      </div>

      {chart ? (
        <svg
          viewBox={`0 0 ${VW} ${VH}`}
          className="curve-svg"
          role="img"
          aria-label={
            isAll
              ? `US Treasury yield curve as of ${formatAsOf(asOf)}`
              : `${selected} Treasury yield since ${history?.points[0]?.date.slice(0, 4) ?? "2021"}`
          }
        >
          <defs>
            <linearGradient id="curve-fill" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="var(--accent)" stopOpacity="0.16" />
              <stop offset="100%" stopColor="var(--accent)" stopOpacity="0" />
            </linearGradient>
          </defs>

          {chart.ticks.map((t) => (
            <g key={t}>
              <line
                x1={PAD_L - 5}
                x2={VW - PAD_R}
                y1={sy(t, chart.lo, chart.hi)}
                y2={sy(t, chart.lo, chart.hi)}
                className="curve-grid"
              />
              <text
                x={PAD_L - 10}
                y={sy(t, chart.lo, chart.hi) + 3.2}
                textAnchor="end"
                className="curve-tick"
              >
                {t.toFixed(2)}
              </text>
            </g>
          ))}

          {series.labels.map((label, i) =>
            label ? (
              <text
                key={`${label}-${i}`}
                x={sx(i, chart.n)}
                y={VH - 8}
                textAnchor="middle"
                className="curve-xlabel"
              >
                {label}
              </text>
            ) : null,
          )}

          <path
            key={`area-${drawKey}`}
            className="curve-area"
            d={`${chart.d} L ${sx(chart.n - 1, chart.n).toFixed(1)} ${VH - PAD_B} L ${sx(0, chart.n).toFixed(1)} ${VH - PAD_B} Z`}
            fill="url(#curve-fill)"
          />
          <path
            key={`line-${drawKey}`}
            d={chart.d}
            pathLength={1}
            className="curve-line"
            style={{ animationDuration: `${DRAW_MS}ms` }}
          />

          {series.showDots &&
            snapshot.map((p, i) => (
              <g
                key={p.tenorLabel}
                onMouseEnter={() => setHoverIdx(i)}
                onMouseLeave={() => setHoverIdx(null)}
              >
                <circle
                  cx={sx(i, chart.n)}
                  cy={sy(p.yield, chart.lo, chart.hi)}
                  r={10}
                  className="curve-hit"
                />
                <circle
                  cx={sx(i, chart.n)}
                  cy={sy(p.yield, chart.lo, chart.hi)}
                  r={hoverIdx === i ? 5 : 3.5}
                  className="curve-dot"
                />
              </g>
            ))}

          <circle
            key={`lead-${drawKey}`}
            r={5}
            className="curve-lead"
            style={{ offsetPath: `path('${chart.d}')`, animationDuration: `${DRAW_MS}ms` }}
          />
        </svg>
      ) : (
        <div className="curve-empty">Curve data is unavailable right now.</div>
      )}

      <div className="curve-foot">
        <span className="curve-foot-cap">{readout.caption}</span>
        <span className="curve-foot-val">{readout.value}</span>
      </div>
    </div>
  );
}
