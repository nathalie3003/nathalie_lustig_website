"use client";

import { useMemo, useState } from "react";
import type { YieldCurvePoint } from "@/lib/marketData";

type Props = {
  points: YieldCurvePoint[];
  asOf: string; // ISO date YYYY-MM-DD
  source: "FRED" | "snapshot";
};

const VB_W = 600;
const VB_H = 240;
const PAD_X = 56;
const PAD_TOP = 28;
const PAD_BOTTOM = 44;

function formatAsOf(iso: string): string {
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return iso;
  return d.toLocaleDateString("en-GB", { day: "numeric", month: "short", year: "numeric" });
}

function catmullRomPath(pts: { x: number; y: number }[]): string {
  if (pts.length < 2) return "";
  let d = `M ${pts[0].x} ${pts[0].y}`;
  for (let i = 0; i < pts.length - 1; i++) {
    const p0 = pts[i - 1] ?? pts[i];
    const p1 = pts[i];
    const p2 = pts[i + 1];
    const p3 = pts[i + 2] ?? p2;
    const cp1x = p1.x + (p2.x - p0.x) / 6;
    const cp1y = p1.y + (p2.y - p0.y) / 6;
    const cp2x = p2.x - (p3.x - p1.x) / 6;
    const cp2y = p2.y - (p3.y - p1.y) / 6;
    d += ` C ${cp1x} ${cp1y}, ${cp2x} ${cp2y}, ${p2.x} ${p2.y}`;
  }
  return d;
}

export function YieldCurve({ points, asOf, source }: Props) {
  const [replayKey, setReplayKey] = useState(0);
  const [activeIdx, setActiveIdx] = useState<number | null>(null);

  // Coordinate math: tenor on x (linear by index, equally spaced),
  // yield on y with a 0.25% pad on each side so the curve doesn't kiss the edges.
  const layout = useMemo(() => {
    const yields = points.map((p) => p.yield);
    const minY = Math.min(...yields) - 0.25;
    const maxY = Math.max(...yields) + 0.25;
    const xStep = (VB_W - PAD_X * 2) / (points.length - 1);
    const yRange = maxY - minY;
    const coords = points.map((p, i) => ({
      x: PAD_X + i * xStep,
      y: PAD_TOP + ((maxY - p.yield) / yRange) * (VB_H - PAD_TOP - PAD_BOTTOM),
    }));
    return { coords, minY, maxY };
  }, [points]);

  const path = useMemo(() => catmullRomPath(layout.coords), [layout]);

  const onRedraw = () => {
    setReplayKey((k) => k + 1);
  };

  return (
    <section className="section yield-section" id="curve">
      <div className="yield-head">
        <span className="l-eyebrow">The curve</span>
        <p className="yield-sub">
          US Treasury yield curve · 2Y → 30Y · updated daily
        </p>
        <span className="yield-caption">
          As of {formatAsOf(asOf)} · source: {source}
        </span>
      </div>

      <div className="yield-chart" aria-label="US Treasury yield curve">
        <svg
          viewBox={`0 0 ${VB_W} ${VB_H}`}
          preserveAspectRatio="xMidYMid meet"
          className="yield-svg"
          role="img"
        >
          {/* baseline */}
          <line
            x1={PAD_X}
            x2={VB_W - PAD_X}
            y1={VB_H - PAD_BOTTOM}
            y2={VB_H - PAD_BOTTOM}
            className="yield-baseline"
          />

          {/* y-axis labels (top + bottom of visible range) */}
          <text
            x={PAD_X - 10}
            y={PAD_TOP + 4}
            textAnchor="end"
            className="yield-y-label"
          >
            {layout.maxY.toFixed(1)}%
          </text>
          <text
            x={PAD_X - 10}
            y={VB_H - PAD_BOTTOM + 4}
            textAnchor="end"
            className="yield-y-label"
          >
            {layout.minY.toFixed(1)}%
          </text>

          {/* tenor labels */}
          {points.map((p, i) => (
            <text
              key={p.tenorLabel}
              x={layout.coords[i].x}
              y={VB_H - PAD_BOTTOM + 22}
              textAnchor="middle"
              className="yield-tenor"
            >
              {p.tenorLabel}
            </text>
          ))}

          {/* active vertical guide */}
          {activeIdx !== null && (
            <line
              x1={layout.coords[activeIdx].x}
              x2={layout.coords[activeIdx].x}
              y1={PAD_TOP}
              y2={VB_H - PAD_BOTTOM}
              className="yield-guide"
            />
          )}

          {/* the curve */}
          <path
            key={`path-${replayKey}`}
            d={path}
            fill="none"
            className="yield-line yield-line-draw"
          />

          {/* dots */}
          {points.map((p, i) => {
            const c = layout.coords[i];
            return (
              <g
                key={`${p.tenorLabel}-${replayKey}`}
                className="yield-dot-group"
                style={{
                  transformOrigin: `${c.x}px ${c.y}px`,
                  animationDelay: `${1.1 + i * 0.12}s`,
                }}
                onMouseEnter={() => setActiveIdx(i)}
                onMouseLeave={() => setActiveIdx(null)}
                onClick={() => setActiveIdx(activeIdx === i ? null : i)}
              >
                <circle cx={c.x} cy={c.y} r={9} className="yield-dot-hit" />
                <circle cx={c.x} cy={c.y} r={5} className="yield-dot" />
              </g>
            );
          })}

          {/* active pill */}
          {activeIdx !== null && (
            <g className="yield-pill">
              <rect
                x={layout.coords[activeIdx].x - 38}
                y={layout.coords[activeIdx].y - 36}
                width={76}
                height={22}
                rx={6}
                ry={6}
              />
              <text
                x={layout.coords[activeIdx].x}
                y={layout.coords[activeIdx].y - 21}
                textAnchor="middle"
                className="yield-pill-text"
              >
                {points[activeIdx].tenorLabel} · {points[activeIdx].yield.toFixed(2)}%
              </text>
            </g>
          )}
        </svg>

        <button
          type="button"
          className="yield-redraw"
          onClick={onRedraw}
          aria-label="Redraw the curve"
        >
          <span aria-hidden="true">↻</span> Redraw
        </button>
      </div>
    </section>
  );
}
