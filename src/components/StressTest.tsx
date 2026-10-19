"use client";

import { useId, useState } from "react";

// An interactive bond stress test for a note body. The reader shocks the
// benchmark yield and the borrower's credit spread separately, and sees what
// the combined move does to an existing bond's price and to the yield the
// borrower would pay to issue or refinance today.
//
// The maths is deliberately first order, ΔP/P ≈ -D_mod × Δy, and the caveat
// below the figure says so. It is a reasoning aid for the article, not a
// pricing model, so convexity is left out rather than half-modelled.

type Value = { tsy: number; spread: number; duration: number; startYield: number };

export type StressTestProps = {
  title?: string;
  intro?: string;
  caveat?: string;
  treasuryShock?: number;
  spreadShock?: number;
  duration?: number;
  startYield?: number;
};

const PRESETS: { label: string; tsy: number; spread: number }[] = [
  { label: "Flint only", tsy: 100, spread: 0 },
  { label: "Steel only", tsy: 0, spread: 100 },
  { label: "Both", tsy: 100, spread: 100 },
  { label: "Severe", tsy: 200, spread: 200 },
];

const MINUS = "−";
const signed = (n: number, digits: number, unit = "") =>
  `${n < 0 ? MINUS : n > 0 ? "+" : ""}${Math.abs(n).toFixed(digits)}${unit}`;

export function StressTest({
  title = "Stress test",
  intro,
  caveat,
  treasuryShock = 100,
  spreadShock = 100,
  duration = 5,
  startYield = 6.5,
}: StressTestProps) {
  const id = useId();
  const [v, setV] = useState<Value>({
    tsy: treasuryShock,
    spread: spreadShock,
    duration,
    startYield,
  });
  const set = (k: keyof Value) => (e: React.ChangeEvent<HTMLInputElement>) =>
    setV((prev) => ({ ...prev, [k]: Number(e.target.value) }));

  // Price changes in percent of par, from each leg of the shock.
  const flintLoss = v.duration * (v.tsy / 100);
  const steelLoss = v.duration * (v.spread / 100);
  const totalLoss = flintLoss + steelLoss;
  const newPrice = Math.max(0, 100 - totalLoss);
  const newYield = v.startYield + (v.tsy + v.spread) / 100;
  const flintShare = totalLoss > 0 ? (flintLoss / totalLoss) * 100 : 0;

  const sliders: {
    key: keyof Value;
    label: string;
    min: number;
    max: number;
    step: number;
    format: (n: number) => string;
  }[] = [
    { key: "tsy", label: "Treasury yield shock", min: 0, max: 300, step: 25, format: (n) => signed(n, 0, "bp") },
    { key: "spread", label: "Credit spread widening", min: 0, max: 300, step: 25, format: (n) => signed(n, 0, "bp") },
    { key: "duration", label: "Modified duration", min: 1, max: 10, step: 0.5, format: (n) => `${n.toFixed(1)} yrs` },
    { key: "startYield", label: "Starting yield", min: 2, max: 12, step: 0.25, format: (n) => `${n.toFixed(2)}%` },
  ];

  return (
    <figure className="stress-test" aria-labelledby={`${id}-title`}>
      <div className="st-head">
        <span className="st-label">Interactive</span>
        <h3 className="st-title" id={`${id}-title`}>
          {title}
        </h3>
        {intro && <p className="st-intro">{intro}</p>}
      </div>

      <div className="st-presets" role="group" aria-label="Scenarios">
        {PRESETS.map((p) => {
          const active = v.tsy === p.tsy && v.spread === p.spread;
          return (
            <button
              key={p.label}
              type="button"
              className="st-chip"
              aria-pressed={active}
              onClick={() => setV((prev) => ({ ...prev, tsy: p.tsy, spread: p.spread }))}
            >
              {p.label}
            </button>
          );
        })}
      </div>

      <div className="st-grid">
        <div className="st-controls">
          {sliders.map((s) => {
            const value = v[s.key];
            const fill = ((value - s.min) / (s.max - s.min)) * 100;
            return (
              <div className="st-field" key={s.key}>
                <div className="st-field-row">
                  <label htmlFor={`${id}-${s.key}`}>{s.label}</label>
                  <output htmlFor={`${id}-${s.key}`}>{s.format(value)}</output>
                </div>
                <input
                  id={`${id}-${s.key}`}
                  type="range"
                  min={s.min}
                  max={s.max}
                  step={s.step}
                  value={value}
                  onChange={set(s.key)}
                  aria-valuetext={s.format(value)}
                  style={{ "--fill": `${fill}%` } as React.CSSProperties}
                />
              </div>
            );
          })}
        </div>

        <div className="st-results" aria-live="polite">
          <div className="st-result">
            <span className="st-result-label">New borrowing cost</span>
            <span className="st-result-value">
              <span className="st-from">{v.startYield.toFixed(2)}%</span>
              <span className="st-arrow" aria-hidden="true">
                →
              </span>
              {newYield.toFixed(2)}%
            </span>
            <span className="st-result-sub">
              {signed(v.tsy + v.spread, 0, "bp")} on new issuance or refinancing
            </span>
          </div>

          <div className="st-result">
            <span className="st-result-label">Value of a £100 bond</span>
            <span className="st-result-value st-result-key">£{newPrice.toFixed(2)}</span>
            <span className="st-result-sub">{signed(-totalLoss, 1, "%")} price change</span>
          </div>

          <div className="st-result st-split">
            <span className="st-result-label">Where the loss comes from</span>
            <div className="st-bar" aria-hidden="true">
              <span className="st-bar-flint" style={{ width: `${flintShare}%` }} />
              <span className="st-bar-steel" style={{ width: `${totalLoss > 0 ? 100 - flintShare : 0}%` }} />
            </div>
            <dl className="st-legend">
              <div>
                <dt>
                  <span className="st-key st-key-flint" aria-hidden="true" />
                  Flint, sovereign alone
                </dt>
                <dd>{signed(-flintLoss, 1, "%")}</dd>
              </div>
              <div>
                <dt>
                  <span className="st-key st-key-steel" aria-hidden="true" />
                  Steel, spread on top
                </dt>
                <dd>{signed(-steelLoss, 1, "%")}</dd>
              </div>
              <div className="st-legend-total">
                <dt>Combined</dt>
                <dd>{signed(-totalLoss, 1, "%")}</dd>
              </div>
            </dl>
          </div>
        </div>
      </div>

      {caveat && <figcaption className="st-caveat">{caveat}</figcaption>}
    </figure>
  );
}
