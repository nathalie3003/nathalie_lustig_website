# Animated yield curve (homepage signature moment)

**Date:** 2026-06-23
**Status:** design pending user approval
**Scope:** medium — one new server component (data fetcher), one new client component (animated SVG + replay button), one set of CSS rules, one extension to `marketData.ts`.

## Goal

A small, editorial-style US Treasury yield curve that **draws itself in** when it scrolls into view, can be **replayed** by clicking a button, and shows tenor + yield on hover. Lives in the empty space below the desk-notes list, beside the right rail. Acts as the homepage's one distinctive "signature moment" — a visual that says *front-office* without resorting to a static ticker.

Deliberately *not* including a code panel — keeps the editorial tone, avoids signalling "engineer portfolio" on a markets writer's site.

## Placement

- **Location:** inside `.home-main` (the left column), placed *after* the existing `<section className="section" id="notes">` block and *before* `.home-main` closes.
- The right rail (`.home-rail`) continues alongside as it does for the notes block — both columns share the same grid.
- Wrapped in its own `<section className="section yield-section" id="curve">` so it can be linked to (`/#curve`) and scroll-jumped from anywhere later.
- Section header: small eyebrow `THE CURVE TODAY` + sub-line *"US Treasury yield curve · 2Y → 30Y · updated daily"*.
- The chart fills the column width (~600–680px at desktop default), height ~260px. On mobile it scales down proportionally to the column.

## Visual spec

```
THE CURVE TODAY
US Treasury yield curve · 2Y → 30Y · updated daily

┌────────────────────────────────────────────────┐
│   5%                                            │  ← faint y-axis label, top only
│        ╱─────────●─────────●────────●           │  ← curve, drawn left-to-right
│   ●───╱                                         │
│   4%                                            │  ← faint y-axis label, bottom only
│   ─────────────────────────────────────────────│  ← faint baseline
│    2Y      5Y          10Y           30Y        │  ← tenor labels
└────────────────────────────────────────────────┘
                                       ↻ Replay
```

### Style notes

- **Stroke colour:** `var(--accent)` (your blue) at ~2px stroke-width, `stroke-linecap: round`, `stroke-linejoin: round`.
- **Dots at each tenor (2Y, 5Y, 10Y, 30Y):** 5px radius, filled with `var(--accent)`, white 2px ring so they pop against the line. Pop in *after* the line finishes drawing (~120ms each, staggered).
- **Baseline:** a faint `var(--rule)` horizontal line at chart bottom, no other gridlines.
- **Axis labels:** tenor labels (Inter 10.5px uppercase, `var(--ink-45)`) below the baseline; just two y-axis labels (top and bottom of the visible yield range) on the left edge.
- **No background fill, no gradient under the curve** — keeps it editorial, not finance-app-y.
- **Container:** no card chrome by default. Optional thin `var(--rule)` border + 24px padding so it doesn't feel naked.
- **Caption:** `As of [date] · source: FRED` in 11.5px muted text, top-right corner of the section.

## Animation spec

### Draw-in (initial / on replay)

- Use Framer Motion's `pathLength` on the curve `<motion.path>`.
- `initial={{ pathLength: 0 }}` → `animate={{ pathLength: 1 }}`.
- Duration: 1100ms. Easing: `cubic-bezier(0.22, 1, 0.36, 1)` (gentle ease-out).
- Dots stagger in after the line: each `<motion.circle>` uses `delay = (drawDuration) + (i * 120)` ms, with `scale: 0 → 1` and `opacity: 0 → 1` (180ms each).
- Triggered:
  - on first scroll into view (Intersection Observer at 40% threshold) — once per page load.
  - on click of the **Replay** button.

### Hover

- Hovering anywhere over the chart shows a thin vertical guide line at the nearest tenor (snap to the four tenor points — no interpolation since we only have four data points).
- A small pill above the active dot shows `10Y · 4.21%` (Inter 11.5px, white text on `var(--ink)` background, rounded 6px).
- Mobile / touch: tap a dot to reveal/hide its pill. Pill auto-hides after 2s on touch devices.

### Reduced motion

- `useReducedMotion()` → skip the path draw (curve appears instantly), skip the dot pop-in (dots appear instantly), keep hover interactions. The Replay button becomes a no-op (still rendered for layout consistency but doesn't re-trigger anything).

## Data flow

### Source: FRED, four series in parallel

Extend `marketData.ts` with a new function `getYieldCurve()`:

```ts
// Returns the latest yields for the four tenors, plus the source date.
export type YieldCurvePoint = { tenorLabel: string; tenorYears: number; yield: number };
export type YieldCurve = { points: YieldCurvePoint[]; asOf: string };

export async function getYieldCurve(): Promise<YieldCurve | null>
```

- Fetches `DGS2`, `DGS5`, `DGS10`, `DGS30` in parallel via the existing `fetchFredSeries` helper (reuse the pattern in [marketData.ts:90](src/lib/marketData.ts:90)).
- Cached 24h via `revalidate: DAY` (already configured per series).
- `asOf` = latest observation date across the four series (use whichever is earliest, since FRED can lag tenor-by-tenor).
- Returns `null` if any series fails *and* there's no key — falls back to the static snapshot below.

### Fallback snapshot

```ts
// src/content/yieldCurveFallback.ts
export const FALLBACK_CURVE = {
  points: [
    { tenorLabel: "2Y",  tenorYears: 2,  yield: 4.18 },
    { tenorLabel: "5Y",  tenorYears: 5,  yield: 4.10 },
    { tenorLabel: "10Y", tenorYears: 10, yield: 4.32 },
    { tenorLabel: "30Y", tenorYears: 30, yield: 4.55 },
  ],
  asOf: "2026-06-20",
};
```

- Used when `FRED_API_KEY` is missing in env, or when FRED is unreachable.
- The caption switches from `source: FRED` to `source: snapshot` so it's not misleading.
- User updates the snapshot manually when the spread of the real curve drifts meaningfully — quick edit, single file.

### Server → client boundary

- The fetch is server-side (`app/page.tsx` is already a server component). The fetched `YieldCurve` is passed as a prop into `<YieldCurve points={...} asOf={...} />`, which is a client component (animation needs `"use client"`).

## Component

New files:

1. `src/components/YieldCurve.tsx` — client component, SVG chart + Replay button + hover state.
2. `src/content/yieldCurveFallback.ts` — static snapshot.
3. Extension to `src/lib/marketData.ts` — adds `getYieldCurve()`.

`YieldCurve.tsx` props:

```ts
type Props = {
  points: { tenorLabel: string; tenorYears: number; yield: number }[];
  asOf: string;       // ISO date "YYYY-MM-DD"
  source: "FRED" | "snapshot";
};
```

Internals:
- `useState` for the active hovered tenor index (`null` if none).
- `useRef` on the SVG for the intersection observer.
- `useReducedMotion` from framer-motion.
- A `replayKey` state (number) that increments on Replay click — passing it as `key` to the `<motion.path>` and dots remounts them and replays the animation.
- SVG `viewBox` defined in tenor-space-x by yield-space-y; the curve uses a Catmull-Rom or simple cubic interpolation between the four points so it looks like a real curve, not a polyline. (Catmull-Rom is one small helper function, ~15 lines.)

## Out of scope (deliberately)

- Multiple curves overlaid (e.g. "now vs 1m ago") — adds complexity without sharpening the message. Save for v2.
- Live updates / streaming. Daily refresh is enough — Treasury yields don't move fast enough at this resolution to matter for an editorial signature.
- Click-to-drill-down chart (full screen, zoomable, etc.). Not the goal here.
- A code panel showing source. Decided against in conversation — keeps editorial tone.

## Files touched / added

1. `src/lib/marketData.ts` — append `getYieldCurve()` and types (`YieldCurvePoint`, `YieldCurve`).
2. `src/content/yieldCurveFallback.ts` — **new**, static snapshot constant.
3. `src/components/YieldCurve.tsx` — **new**, client component (~150 LOC).
4. `src/app/page.tsx` — server-fetch the curve, render `<YieldCurve …>` inside `.home-main` after the notes section.
5. `src/app/globals.css` — `.yield-section` band, chart container, caption, replay button, hover pill styles. ~50 lines.

No new npm dependencies — Framer Motion is already installed (from the rotator).

## Test plan

- [ ] On a fresh page load, scroll down to the section → curve draws itself left-to-right, dots pop in after the line, in order.
- [ ] Click **Replay** → animation re-runs from scratch.
- [ ] Hover a dot → vertical guide + pill appear with correct tenor + yield. Move away → both disappear.
- [ ] Touch device: tap a dot → pill shows; auto-hides after 2s.
- [ ] DevTools → emulate `prefers-reduced-motion: reduce` → curve and dots appear instantly; Replay button is a no-op; hover still works.
- [ ] With `FRED_API_KEY` set → caption reads `source: FRED · as of <recent date>`.
- [ ] With `FRED_API_KEY` removed → caption reads `source: snapshot · as of 2026-06-20`; curve renders from fallback.
- [ ] Mobile (~380px wide) → chart scales down, tenor labels still legible, no horizontal scroll.
- [ ] No console / hydration errors; no SSR mismatch.

## Open questions for review

1. Section eyebrow — *"The curve today"* or something different? (e.g. "US rates", "Yield curve", "Today's curve")
2. Replay button label — `Replay` (clear) vs `Redraw` (more on-theme for a curve) vs just an icon (↻)?
3. Caption format — `As of 20 Jun 2026 · source: FRED` or shorter (`20 Jun · FRED`)?
4. Should the section title include a one-line context line ("US Treasury yield curve · 2Y → 30Y · updated daily"), or is the eyebrow alone enough?
