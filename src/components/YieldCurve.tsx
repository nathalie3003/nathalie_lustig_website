"use client";

import { useMemo, useState } from "react";
import type { YieldCurvePoint } from "@/lib/marketData";

type Props = {
  points: YieldCurvePoint[];
  asOf: string; // ISO date YYYY-MM-DD
  source: "Treasury" | "snapshot";
};

const VB_W = 640;
const VB_H = 260;
const PAD_LEFT = 72;
const PAD_RIGHT = 24;
const PAD_TOP = 28;
const PAD_BOTTOM = 64;
const DRAW_DURATION = 3; // seconds — slow easeInOut, must match the CSS keyframe
const Y_STEP = 0.2; // percent — y-axis tick interval

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

  // X positions reflect actual tenor years (1, 2, 3, 5, 7, 10, 20, 30) so the
  // chart looks like a real yield curve — compressed on the long end.
  // Y range is snapped to Y_STEP intervals so the gridlines and tick labels line
  // up with the chart edges and step in regular 0.2% increments.
  const layout = useMemo(() => {
    const yields = points.map((p) => p.yield);
    const rawMin = Math.min(...yields) - 0.2;
    const rawMax = Math.max(...yields) + 0.2;
    const minY = Math.floor(rawMin / Y_STEP) * Y_STEP;
    const maxY = Math.ceil(rawMax / Y_STEP) * Y_STEP;
    const yearsMin = points[0].tenorYears;
    const yearsMax = points[points.length - 1].tenorYears;
    const xSpan = VB_W - PAD_LEFT - PAD_RIGHT;
    const ySpan = VB_H - PAD_TOP - PAD_BOTTOM;
    const yRange = maxY - minY;
    const coords = points.map((p) => ({
      x: PAD_LEFT + ((p.tenorYears - yearsMin) / (yearsMax - yearsMin)) * xSpan,
      y: PAD_TOP + ((maxY - p.yield) / yRange) * ySpan,
    }));
    const ticks: { value: number; y: number }[] = [];
    for (let v = minY; v <= maxY + 0.001; v += Y_STEP) {
      const rounded = Math.round(v * 10) / 10;
      ticks.push({
        value: rounded,
        y: PAD_TOP + ((maxY - v) / yRange) * ySpan,
      });
    }
    return { coords, minY, maxY, ticks };
  }, [points]);

  const path = useMemo(() => catmullRomPath(layout.coords), [layout]);
  const pathId = `yield-path-${replayKey}`;

  // For each tenor dot, time its pop-in to roughly match when the tracer
  // reaches its x position along the path. Linear approximation by x is
  // close enough for a Catmull-Rom curve at these proportions.
  const tracerProgress = useMemo(() => {
    const minX = layout.coords[0].x;
    const maxX = layout.coords[layout.coords.length - 1].x;
    return layout.coords.map((c) => (c.x - minX) / (maxX - minX));
  }, [layout]);

  const onRedraw = () => {
    setReplayKey((k) => k + 1);
  };

  return (
    <section className="section yield-section" id="curve">
      <div className="yield-head">
        <span className="l-eyebrow">The curve</span>
        <p className="yield-sub">
          US Treasury yield curve · 1Y → 30Y · updated daily
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
            x1={PAD_LEFT}
            x2={VB_W - PAD_RIGHT}
            y1={VB_H - PAD_BOTTOM}
            y2={VB_H - PAD_BOTTOM}
            className="yield-baseline"
          />

          {/* y-axis grid + labels at every Y_STEP */}
          {layout.ticks.map((t) => (
            <g key={t.value}>
              <line
                x1={PAD_LEFT}
                x2={VB_W - PAD_RIGHT}
                y1={t.y}
                y2={t.y}
                className="yield-gridline"
              />
              <text
                x={PAD_LEFT - 10}
                y={t.y + 3.5}
                textAnchor="end"
                className="yield-y-label"
              >
                {t.value.toFixed(1)}%
              </text>
            </g>
          ))}

          {/* y-axis title — rotated, runs up the left edge */}
          <text
            x={20}
            y={PAD_TOP + (VB_H - PAD_TOP - PAD_BOTTOM) / 2}
            textAnchor="middle"
            transform={`rotate(-90, 20, ${PAD_TOP + (VB_H - PAD_TOP - PAD_BOTTOM) / 2})`}
            className="yield-axis-title"
          >
            Yield (%)
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

          {/* x-axis title — sits below the tenor labels */}
          <text
            x={PAD_LEFT + (VB_W - PAD_LEFT - PAD_RIGHT) / 2}
            y={VB_H - PAD_BOTTOM + 48}
            textAnchor="middle"
            className="yield-axis-title"
          >
            Maturity
          </text>

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

          {/* the curve (CSS draws it in via stroke-dasharray) */}
          <path
            key={`path-${replayKey}`}
            id={pathId}
            d={path}
            fill="none"
            className="yield-line yield-line-draw"
          />

          {/* tracer dot — rides along the path in sync with the draw animation */}
          <circle
            key={`tracer-${replayKey}`}
            r={6}
            className="yield-tracer"
          >
            <animateMotion dur={`${DRAW_DURATION}s`} begin="0s" fill="freeze">
              <mpath href={`#${pathId}`} />
            </animateMotion>
          </circle>

          {/* fixed dots — each pops in as the tracer passes its tenor */}
          {points.map((p, i) => {
            const c = layout.coords[i];
            return (
              <g
                key={`${p.tenorLabel}-${replayKey}`}
                className="yield-dot-group"
                style={{
                  transformOrigin: `${c.x}px ${c.y}px`,
                  animationDelay: `${tracerProgress[i] * DRAW_DURATION}s`,
                }}
                onMouseEnter={() => setActiveIdx(i)}
                onMouseLeave={() => setActiveIdx(null)}
                onClick={() => setActiveIdx(activeIdx === i ? null : i)}
              >
                <circle cx={c.x} cy={c.y} r={9} className="yield-dot-hit" />
                <circle cx={c.x} cy={c.y} r={4.5} className="yield-dot" />
              </g>
            );
          })}

          {/* active pill */}
          {activeIdx !== null && (
            <g className="yield-pill">
              <rect
                x={layout.coords[activeIdx].x - 40}
                y={layout.coords[activeIdx].y - 36}
                width={80}
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
