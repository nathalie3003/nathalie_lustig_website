# The Basis Point Rebrand — Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Rebrand the site as *The Basis Point* (a one-author publication), add an animated chart-shaped brand mark to the nav and favicon, bump the homepage recent-notes count to 4, and fix the read-time math to use 225 wpm.

**Architecture:** Pure additive change to a Next.js 15 App Router site. One new client component (`BasisPointMark`) carries the animated SVG mark and is used in the nav and as the source for the favicon. Existing components (`Nav`, `HomePage`, `Footer`, `YieldCurve`, etc.) are touched only where listed — the live yield curve section on the homepage stays as-is. No new dependencies (sharp is already installed as a Next.js peer).

**Tech Stack:** Next.js 15 (App Router), React 19, TypeScript, Sanity CMS, vanilla CSS in `src/app/globals.css` (Tailwind is present as a dep but the existing components use hand-rolled CSS — mirror that). No test framework is configured; verification is done in the browser via `npm run dev` per the project's existing convention.

**Spec reference:** [docs/superpowers/specs/2026-06-28-the-basis-point-rebrand-design.md](../specs/2026-06-28-the-basis-point-rebrand-design.md)

**Branch:** Work is done on `the-basis-point-rebrand` (already created and currently checked out).

---

## Important conventions

- **No all-caps in writing copy.** Bylines, credits, and descriptive prose must be sentence case. The existing site uses uppercase letter-spacing for UI chrome (`.l-kicker`, `.l-smallcaps`, the `Bond Notes` eyebrow); that's UI and stays. The rule fires when text *speaks* (writing) rather than *labels* (chrome). If unsure, ask.
- **AGENTS.md note.** The project's `AGENTS.md` warns that this Next.js version may differ from training-data assumptions. Mirror patterns already used in the codebase rather than reaching for memory. Specifically: the favicon is a file at `src/app/icon.png` (App Router convention — replace the file, no `<link>` tag needed); metadata is exported from page files; client components are marked with `"use client"`.
- **Commits.** One commit per task (commit step included at the end of each task). Use the commit message templates given.

---

## Task 1: Add the `BasisPointMark` component (static, no animation yet)

Build the SVG mark as a self-contained client component, rendering a static (non-animated) version first so the shape can be inspected in isolation before layering animation on top.

**Files:**
- Create: `src/components/BasisPointMark.tsx`

- [ ] **Step 1: Create the component file**

Write `src/components/BasisPointMark.tsx`:

```tsx
"use client";

type Props = {
  size?: number;
  axes?: boolean;
  animate?: boolean;
  className?: string;
};

// Hand-tuned path approximating a normal Treasury curve — gentle rise on the
// short end, accelerating into the long end. ViewBox is 40 wide × 32 tall;
// padding leaves room for the axes on the left (x=6) and bottom (y=26).
const CURVE_D = "M 8 24 C 14 23.4, 18 22.4, 22 20 S 30 11, 36 6";
const DOT_END = { cx: 36, cy: 6 };

export function BasisPointMark({
  size = 32,
  axes = true,
  animate = true,
  className,
}: Props) {
  const cls = ["bp-mark", animate && "bp-mark-animate", className]
    .filter(Boolean)
    .join(" ");

  return (
    <svg
      width={size}
      height={Math.round((size * 32) / 40)}
      viewBox="0 0 40 32"
      role="img"
      aria-label="The Basis Point"
      className={cls}
    >
      {axes && (
        <g className="bp-mark-axes">
          <line x1="6" y1="4" x2="6" y2="26" />
          <line x1="6" y1="26" x2="38" y2="26" />
        </g>
      )}
      <path className="bp-mark-curve" d={CURVE_D} fill="none" />
      <circle
        className="bp-mark-dot"
        cx={DOT_END.cx}
        cy={DOT_END.cy}
        r="1.2"
      />
    </svg>
  );
}
```

- [ ] **Step 2: Add baseline (non-animated) CSS for the mark**

Open `src/app/globals.css` and append (toward the end of the file, in the global-elements section — search for the last `@media` block to find a good spot just before it):

```css
  /* --- Basis Point brand mark ------------------------------------------ */
  .bp-mark { display: block; }
  .bp-mark-axes line {
    stroke: var(--color-ink-45);
    stroke-width: 0.5;
    stroke-linecap: square;
  }
  .bp-mark-curve {
    stroke: var(--color-accent);
    stroke-width: 1.6;
    stroke-linecap: round;
    stroke-linejoin: round;
  }
  .bp-mark-dot {
    fill: var(--color-accent);
  }
```

(Animation rules come in Task 2.)

- [ ] **Step 3: Smoke-test the static render**

Temporarily import and render the mark on the homepage so you can see it. Open `src/app/page.tsx` and **at the top of the JSX return** (just inside the outer `<div className="scroll-home">`), add:

```tsx
{/* TEMP — remove in this task's commit prep */}
<div style={{ padding: 20 }}>
  <BasisPointMark size={32} animate={false} />
  <BasisPointMark size={64} animate={false} />
  <BasisPointMark size={96} animate={false} />
</div>
```

And add to the imports at the top:

```tsx
import { BasisPointMark } from "@/components/BasisPointMark";
```

Run the dev server:

```bash
npm run dev
```

Open `http://localhost:3000`. You should see three chart-shaped marks at the top of the page: a hairline rectangle (axes) with a blue curve rising from the bottom-left to the top-right and a small blue dot at the curve's end. The curve should look like a positively sloped Treasury yield curve — gentle on the left, steepening on the right.

If the curve looks wrong (kinked, dipping, or the wrong direction), tweak `CURVE_D` in the component until it looks right at the 96px preview. The path should be a smooth cubic Bezier rising from `(8, 24)` to `(36, 6)`.

- [ ] **Step 4: Remove the temporary preview**

Once the shape looks correct, **delete** the temporary `<div>` block and the temporary `BasisPointMark` import from `src/app/page.tsx`. The component should not be referenced from `page.tsx` after this task.

- [ ] **Step 5: Commit**

```bash
git add src/components/BasisPointMark.tsx src/app/globals.css
git commit -m "mark: add BasisPointMark static SVG component"
```

---

## Task 2: Add the draw-in animation to the mark

Layer the on-mount draw animation on top of the static component. Axes fade in first (~250ms), then the curve draws (~1.2s easeInOut) using stroke-dasharray, then the end dot fades in.

**Files:**
- Modify: `src/app/globals.css`

- [ ] **Step 1: Append animation CSS**

Add these rules to `src/app/globals.css` immediately after the `.bp-mark-dot { fill: var(--color-accent); }` rule you added in Task 1:

```css
  @keyframes bp-mark-fade {
    from { opacity: 0; }
    to   { opacity: 1; }
  }
  @keyframes bp-mark-draw {
    from { stroke-dashoffset: 60; }
    to   { stroke-dashoffset: 0; }
  }

  /* Animated variant: axes fade first, then the curve draws, then the dot
     pops in. Static (.bp-mark without .bp-mark-animate) renders fully drawn. */
  .bp-mark-animate .bp-mark-axes line {
    opacity: 0;
    animation: bp-mark-fade 250ms ease-out forwards;
  }
  .bp-mark-animate .bp-mark-curve {
    stroke-dasharray: 60;
    stroke-dashoffset: 60;
    animation: bp-mark-draw 1200ms cubic-bezier(0.45, 0, 0.25, 1) forwards;
    animation-delay: 200ms;
  }
  .bp-mark-animate .bp-mark-dot {
    opacity: 0;
    animation: bp-mark-fade 250ms ease-out forwards;
    animation-delay: 1300ms;
  }

  @media (prefers-reduced-motion: reduce) {
    .bp-mark-animate .bp-mark-axes line,
    .bp-mark-animate .bp-mark-curve,
    .bp-mark-animate .bp-mark-dot {
      animation: none;
      opacity: 1;
      stroke-dashoffset: 0;
    }
  }
```

The `stroke-dasharray: 60` value is a comfortable over-estimate of the curve's path length at the `0 0 40 32` viewBox — the curve is roughly 38 units long so 60 gives clean draw-in with the path fully revealed when offset reaches 0. If the draw appears to end before reaching the dot, bump both `60` values in `bp-mark-draw` and `.bp-mark-curve` to `70`.

- [ ] **Step 2: Re-add the temporary preview to verify animation**

Re-add the temporary preview block to `src/app/page.tsx` (same as Task 1, Step 3) **but this time leave `animate` as the default** (true):

```tsx
{/* TEMP — remove before this task's commit */}
<div style={{ padding: 20, display: "flex", gap: 24, alignItems: "flex-end" }}>
  <BasisPointMark size={32} />
  <BasisPointMark size={64} />
  <BasisPointMark size={96} />
</div>
```

And add the import:

```tsx
import { BasisPointMark } from "@/components/BasisPointMark";
```

Run:

```bash
npm run dev
```

Open `http://localhost:3000`. Expected behavior on page load:
1. Axes fade in over ~250ms.
2. Curve draws from bottom-left to top-right over ~1.2s, smoothly accelerating then decelerating.
3. Dot pops in at the curve's end.

Hard-refresh the page (Cmd+Shift+R) to re-trigger and confirm the sequence. If the curve appears instantly without drawing, the dasharray value is too small — bump to 70 and refresh. If the curve doesn't reach the dot at the end, same fix.

Also verify reduced-motion: open DevTools → Rendering tab → "Emulate CSS prefers-reduced-motion: reduce" → refresh. The mark should appear fully drawn with no animation.

- [ ] **Step 3: Remove the temporary preview**

Delete the temporary block and the `BasisPointMark` import from `src/app/page.tsx`.

- [ ] **Step 4: Commit**

```bash
git add src/app/globals.css
git commit -m "mark: add draw-in animation for BasisPointMark"
```

---

## Task 3: Replace `NL` in the nav with the mark + wordmark

Swap the `NL` text node at the top-left of every page with a flex group containing the animated mark and the wordmark `The Basis Point`. On narrow viewports the wordmark hides and only the mark stays.

**Files:**
- Modify: `src/components/Nav.tsx`
- Modify: `src/app/globals.css`

- [ ] **Step 1: Update `Nav.tsx`**

Open `src/components/Nav.tsx`. At the top of the file, alongside the existing imports, add:

```tsx
import { BasisPointMark } from "@/components/BasisPointMark";
```

Then find this block (around lines 79–82):

```tsx
<Link href="/#top" className="top-name" onClick={jump("top")}>
  NL
</Link>
```

Replace it with:

```tsx
<Link
  href="/#top"
  className="top-name top-name-mark"
  onClick={jump("top")}
  aria-label="The Basis Point — home"
>
  <BasisPointMark size={28} />
  <span className="top-name-word">The Basis Point</span>
</Link>
```

- [ ] **Step 2: Add CSS for the new nav home link**

In `src/app/globals.css`, find the existing `.top-name` rule (around line 141). Add a new sibling rule immediately after it:

```css
  .top-name-mark {
    display: inline-flex;
    align-items: center;
    gap: 10px;
    line-height: 1;
  }
  .top-name-mark .bp-mark { display: block; }
  .top-name-word {
    font-family: var(--font-serif), Georgia, serif;
    font-size: 15px;
    font-weight: 600;
    letter-spacing: -0.005em;
    color: var(--ink);
  }

  @media (max-width: 560px) {
    .top-name-word { display: none; }
  }
```

(The `560px` breakpoint mirrors the existing mobile cascade in this file — see other `@media (max-width: 560px)` blocks for context.)

- [ ] **Step 3: Verify in the browser**

```bash
npm run dev
```

Open `http://localhost:3000`. Confirm:
- Top-left now shows the small animated chart-mark followed by "The Basis Point" in serif.
- The mark draws in on first load.
- Clicking the mark/wordmark scrolls to the top of the home page (same behavior as before).
- Hover state still works (existing `.top-name` hover styles inherit).
- On `/notes` and `/about`, the mark still appears (it's in the global nav).
- Resize the browser to <560px wide — the wordmark hides, only the mark remains, nothing overflows the nav.

- [ ] **Step 4: Commit**

```bash
git add src/components/Nav.tsx src/app/globals.css
git commit -m "nav: replace NL text with BasisPointMark + wordmark"
```

---

## Task 4: Update the homepage hero — masthead + byline

Change the hero `<h1>` from `Nathalie Lustig` to `The Basis Point`, and add a sentence-case byline `Notes by Nathalie Lustig` directly underneath in serif at small size.

**Files:**
- Modify: `src/app/page.tsx`
- Modify: `src/app/globals.css`

- [ ] **Step 1: Update the hero in `page.tsx`**

Open `src/app/page.tsx`. Find the hero block (around lines 40–58):

```tsx
<section className="hero hero-slim">
  <span className="hero-eyebrow">
    <span>Bond Notes</span>
  </span>
  <h1 className="hero-name">Nathalie Lustig</h1>
  <p className="hero-standfirst">
    Bonds sit at the intersection of finance and macroeconomics and
    that is why I write about them. For me, they are a lens to see
    how interest rates, inflation, and geopolitical risks shape the
    broader economy. This ability to see both the big picture and
    the granular details is what drives my passion for bonds, and
    why I want to build my career in capital markets.
  </p>
```

Change the `<h1>` line and insert a byline element directly after it:

```tsx
<h1 className="hero-name">The Basis Point</h1>
<p className="hero-byline">Notes by Nathalie Lustig</p>
```

Leave the eyebrow (`Bond Notes`), the standfirst paragraph, and the CTA exactly as they are.

- [ ] **Step 2: Add `.hero-byline` CSS**

In `src/app/globals.css`, find the `.hero-name` rule (around line 330). Add a new sibling rule immediately after it:

```css
  .hero-byline {
    font-family: var(--font-serif), Georgia, serif;
    font-size: 14.5px;
    color: var(--ink-60);
    margin: -16px 0 22px;
    line-height: 1.3;
    font-weight: 400;
  }
```

The negative top margin pulls the byline tight under the masthead (the existing `.hero-name { margin-bottom: 24px }` plus `.hero-slim .hero-name { margin-bottom: 14px }` at line 711 leave more space than is wanted between title and byline). Adjust the `-16px` if it looks too tight; aim for the byline visually grouped with the masthead, not floating between it and the standfirst.

**Do not use uppercase, letter-spacing, or `text-transform: uppercase`** on this rule. The byline is writing copy, not UI chrome.

- [ ] **Step 3: Verify in the browser**

```bash
npm run dev
```

Open `http://localhost:3000`. Confirm:
- Hero shows "The Basis Point" as the large serif title.
- "Notes by Nathalie Lustig" appears directly below in sentence case (not uppercase, not letter-spaced).
- The standfirst paragraph below is unchanged.
- The eyebrow ("Bond Notes") and the "Read latest" CTA are unchanged.
- The whole hero feels visually tight — the byline is grouped with the title, not floating mid-air.

- [ ] **Step 4: Commit**

```bash
git add src/app/page.tsx src/app/globals.css
git commit -m "hero: masthead The Basis Point + sentence-case byline"
```

---

## Task 5: Update page metadata across the site

Change the document title and meta description to lead with the publication name.

**Files:**
- Modify: `src/app/layout.tsx`
- Modify: `src/app/notes/page.tsx`

- [ ] **Step 1: Update `layout.tsx` metadata**

Open `src/app/layout.tsx`. Find the existing `metadata` export (around lines 20–24):

```tsx
export const metadata: Metadata = {
  title: "Nathalie Lustig",
  description:
    "Notes on rates, credit, and sovereign issuance — translating what I read across the market into my own analysis.",
};
```

Replace with:

```tsx
export const metadata: Metadata = {
  title: "The Basis Point",
  description:
    "The Basis Point — notes on rates, credit, and sovereign issuance by Nathalie Lustig.",
};
```

- [ ] **Step 2: Update `notes/page.tsx` metadata**

Open `src/app/notes/page.tsx`. Find the `metadata` export (line 8):

```tsx
title: "Notes — Nathalie Lustig",
```

Change to:

```tsx
title: "Notes — The Basis Point",
```

- [ ] **Step 3: Verify**

```bash
npm run dev
```

Open `http://localhost:3000` and confirm the browser tab title reads "The Basis Point". Navigate to `/notes` and confirm the tab title reads "Notes — The Basis Point".

View source (`view-source:http://localhost:3000`) and confirm the `<meta name="description">` content reads "The Basis Point — notes on rates, credit, and sovereign issuance by Nathalie Lustig."

- [ ] **Step 4: Commit**

```bash
git add src/app/layout.tsx src/app/notes/page.tsx
git commit -m "meta: rebrand titles + description to The Basis Point"
```

---

## Task 6: Show 4 recent notes on the homepage (was 3)

Trivial one-line slice change.

**Files:**
- Modify: `src/app/page.tsx`

- [ ] **Step 1: Edit the slice**

Open `src/app/page.tsx`. Find (around line 28):

```tsx
const recent = notes.slice(0, 3);
```

Change to:

```tsx
const recent = notes.slice(0, 4);
```

- [ ] **Step 2: Verify**

```bash
npm run dev
```

Open `http://localhost:3000` and confirm the recent notes block now shows 4 items (or all of them, if fewer than 4 notes exist in Sanity). The "View all notes →" link below remains.

- [ ] **Step 3: Commit**

```bash
git add src/app/page.tsx
git commit -m "home: show 4 recent notes instead of 3"
```

---

## Task 7: Read-time fix (220 → 225 wpm) with a diagnosis pass

Change the divisor, then verify on real Sanity data that the word counter isn't undercounting and producing the user's "all notes say 2 min" symptom.

**Files:**
- Modify: `src/lib/readTime.ts`
- Create (temporary, then delete): `scripts/check-read-time.mjs`

- [ ] **Step 1: Update the divisor**

Open `src/lib/readTime.ts`. Find line 21:

```ts
const minutes = Math.max(1, Math.round(words / 220));
```

Change to:

```ts
const minutes = Math.max(1, Math.round(words / 225));
```

Also update the file's leading comment (line 2) from `wpm/220` to `wpm/225`:

```ts
// Walk Portable Text blocks, count words in `block`-type spans,
// return "${max(1, round(wpm/225))} min".
```

- [ ] **Step 2: Write a one-off diagnosis script**

Create `scripts/check-read-time.mjs`:

```js
// One-off: fetch real notes from Sanity, run them through the readTime
// walker, compare against a naive whole-string word count. Used once to
// rule out an undercount bug; delete after this task.

import { createClient } from "next-sanity";

// Mirrors the runtime walker in src/lib/readTime.ts.
function readTimeWords(body) {
  let words = 0;
  if (Array.isArray(body)) {
    for (const raw of body) {
      if (raw && raw._type === "block" && Array.isArray(raw.children)) {
        for (const child of raw.children) {
          if (child && typeof child.text === "string") {
            const t = child.text.trim();
            if (t) words += t.split(/\s+/).length;
          }
        }
      }
    }
  }
  return words;
}

// Naive: stringify the whole body, strip non-letters, count tokens.
function naiveWords(body) {
  const txt = JSON.stringify(body)
    .replace(/[^A-Za-z\s'-]/g, " ")
    .replace(/\s+/g, " ")
    .trim();
  return txt ? txt.split(/\s+/).length : 0;
}

const client = createClient({
  projectId: process.env.NEXT_PUBLIC_SANITY_PROJECT_ID,
  dataset: process.env.NEXT_PUBLIC_SANITY_DATASET,
  apiVersion: process.env.NEXT_PUBLIC_SANITY_API_VERSION,
  useCdn: false,
});

const notes = await client.fetch(
  `*[_type == "bondNote"] | order(publishedAt desc)[0...5]{ title, body }`,
);

console.log("title | walker | naive | walker_min@225 | naive_min@225");
for (const n of notes) {
  const w = readTimeWords(n.body);
  const naive = naiveWords(n.body);
  const wMin = Math.max(1, Math.round(w / 225));
  const nMin = Math.max(1, Math.round(naive / 225));
  console.log(`${n.title} | ${w} | ${naive} | ${wMin} | ${nMin}`);
}
```

Run it (the `.env.local` is loaded automatically by Node when `--env-file` is passed):

```bash
node --env-file=.env.local scripts/check-read-time.mjs
```

Expected output: a table of up to 5 notes with their walker word count, naive word count, and resulting read time in minutes. The walker count should be in the same ballpark as the naive count (the naive count will overshoot a bit because it counts JSON-internal tokens like type names — that's fine; the comparison is to flag *under*counts, not exact equality).

**Interpret the result:**

- **If walker_min and naive_min are within 1 of each other**, and they vary across notes (not all "2"), the user's symptom was the rounding flattening their short notes. **Skip Step 3.** Proceed to Step 4 (cleanup + commit).

- **If walker_min is consistently smaller than naive_min by ≥2 minutes**, or shows "1" for notes that are clearly multi-paragraph, the walker is undercounting. **Proceed to Step 3 to widen it.**

- **If all walker_min values genuinely come out to "2" but the notes are clearly varying lengths**, the walker is missing text. **Proceed to Step 3.**

- [ ] **Step 3 (conditional): Widen the walker**

Only if Step 2 indicated an undercount.

Open `src/lib/readTime.ts` and replace the body of `readTime` with a walker that counts text from any block-shaped node:

```ts
type AnyNode = {
  _type?: string;
  text?: string;
  children?: AnyNode[];
};

export function readTime(body: unknown): string {
  let words = 0;
  function walk(node: AnyNode | undefined | null) {
    if (!node || typeof node !== "object") return;
    if (typeof node.text === "string") {
      const t = node.text.trim();
      if (t) words += t.split(/\s+/).length;
    }
    if (Array.isArray(node.children)) {
      for (const child of node.children) walk(child);
    }
  }
  if (Array.isArray(body)) {
    for (const raw of body as AnyNode[]) walk(raw);
  }
  const minutes = Math.max(1, Math.round(words / 225));
  return `${minutes} min`;
}
```

This recurses into any node with `children`, regardless of `_type`, and counts any string `text` it finds. The 225 divisor and floor of 1 are preserved.

Re-run the diagnosis script to confirm:

```bash
node --env-file=.env.local scripts/check-read-time.mjs
```

The walker count should now be much closer to the naive count and vary across notes.

- [ ] **Step 4: Delete the diagnosis script and commit**

```bash
rm scripts/check-read-time.mjs
git add src/lib/readTime.ts
git commit -m "readTime: switch to 225 wpm baseline"
```

If Step 3 was needed, use this commit message instead:

```bash
rm scripts/check-read-time.mjs
git add src/lib/readTime.ts
git commit -m "readTime: 225 wpm + walker counts text in all block-shaped nodes"
```

---

## Task 8: Regenerate the favicon from the mark

Use a one-off Node script to rasterise the axis-less brand mark to a 256×256 PNG, then commit the PNG. The script is kept under `scripts/` for future regenerations.

**Files:**
- Create: `scripts/render-favicon.mjs`
- Replace: `src/app/icon.png` (binary)

- [ ] **Step 1: Write the rasteriser**

Create `scripts/render-favicon.mjs`:

```js
// Renders the BasisPointMark (axis-less variant) to a 256×256 PNG and
// writes it to src/app/icon.png — the Next.js App Router favicon path.
// Re-run after any change to the mark's path or colors.

import sharp from "sharp";
import { writeFile } from "node:fs/promises";

// Keep this SVG in sync with src/components/BasisPointMark.tsx — axes off,
// fully drawn (no dasharray), no animation, accent color resolved to a
// concrete value (CSS variables don't apply when sharp rasterises).
const ACCENT = "#3A5F8A";
const CURVE_D = "M 8 24 C 14 23.4, 18 22.4, 22 20 S 30 11, 36 6";

const svg = `<?xml version="1.0" encoding="UTF-8"?>
<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 40 32" width="256" height="205">
  <path d="${CURVE_D}" fill="none" stroke="${ACCENT}" stroke-width="2.4" stroke-linecap="round" stroke-linejoin="round"/>
  <circle cx="36" cy="6" r="1.8" fill="${ACCENT}"/>
</svg>`;

// Render into a square 256×256 canvas with the curve centered vertically
// (the natural aspect ratio is 40:32 = wider than tall, so center it on the
// vertical axis to avoid a stretched look at favicon scale).
const buf = await sharp(Buffer.from(svg))
  .resize(256, 205, { fit: "contain", background: { r: 0, g: 0, b: 0, alpha: 0 } })
  .extend({
    top: 26,
    bottom: 25,
    left: 0,
    right: 0,
    background: { r: 0, g: 0, b: 0, alpha: 0 },
  })
  .png()
  .toBuffer();

await writeFile("src/app/icon.png", buf);
console.log("Wrote src/app/icon.png (256×256)");
```

The curve stroke is bumped to `2.4` for the rendered PNG so it stays visible when the browser downscales to 16×16 or 32×32. The axes are intentionally omitted — hairlines disappear at favicon scale and would render as visual noise.

- [ ] **Step 2: Run it**

```bash
node scripts/render-favicon.mjs
```

Expected output:

```
Wrote src/app/icon.png (256×256)
```

- [ ] **Step 3: Verify in the browser**

```bash
npm run dev
```

Open `http://localhost:3000`. Confirm the browser tab now shows the small chart-mark favicon (a blue curve rising to a dot on a transparent background). Hard-refresh (Cmd+Shift+R) if the browser is caching the old favicon.

Open `http://localhost:3000/icon.png` directly to inspect the rendered PNG at full size. It should be a clean blue curve with a dot at the top-right — no axes, no noise.

If the curve looks too thin at favicon scale (squint at the tab), bump `stroke-width="2.4"` in the script to `3.0`, re-run, refresh.

- [ ] **Step 4: Commit**

```bash
git add scripts/render-favicon.mjs src/app/icon.png
git commit -m "favicon: regenerate from BasisPointMark (axis-less variant)"
```

---

## Task 9: Full browser verification + final cleanup

Walk the spec's verification checklist end-to-end in the browser. This is the last gate before declaring the work done.

- [ ] **Step 1: Start the dev server fresh**

```bash
npm run dev
```

- [ ] **Step 2: Walk the verification checklist**

Open `http://localhost:3000` in the browser. For each item below, confirm visually:

1. Browser tab title reads **The Basis Point**.
2. Browser tab favicon is the small chart-mark (blue curve + dot).
3. Top-left of the nav shows the animated mark + "The Basis Point" wordmark in serif.
4. On hard-refresh (Cmd+Shift+R), the mark draws in: axes fade, then curve draws over ~1.2s, then end dot pops in.
5. Hero shows **The Basis Point** as the large serif title with **Notes by Nathalie Lustig** in sentence case directly underneath. **No uppercase, no letter-spacing on the byline.**
6. Eyebrow ("Bond Notes"), standfirst paragraph, and the "Read latest" CTA are unchanged.
7. Recent notes list shows 4 items (or all of them, if Sanity has fewer than 4).
8. "View all notes →" link appears below the list.
9. Live yield-curve section is still present below the notes list and animates as before.
10. Open at least two notes of meaningfully different lengths (e.g. shortest and longest). Confirm the "X min read" line shows different values and the math reflects 225 wpm (a 450-word note should round to 2 min; a 900-word note should round to 4 min).
11. Resize the browser to <560px wide. Confirm: nav wordmark hides, only the mark remains. Hero still renders cleanly. Nothing overflows.
12. Navigate to `/notes`. Tab title reads "Notes — The Basis Point". Nav mark still draws / appears.
13. Navigate to `/about`. Page content is unchanged from before the rebrand.
14. Scroll to the contact section on the home page. LinkedIn link is still present (unchanged from before).
15. View page source on `/` and confirm `<meta name="description">` reads "The Basis Point — notes on rates, credit, and sovereign issuance by Nathalie Lustig."

If any of the above fails, return to the relevant earlier task, fix it, and commit the fix as a separate commit before continuing.

- [ ] **Step 3: Lint check**

```bash
npm run lint
```

Expected: no errors. Fix any new lint warnings introduced by this work before declaring done.

- [ ] **Step 4: Build check**

```bash
npm run build
```

Expected: successful build with no TypeScript errors. The build will fetch from Sanity at build time — if Sanity is unreachable, that's environmental, not caused by this work.

- [ ] **Step 5: Final summary commit (if needed)**

If any fixups were committed in Step 2, you're done — no additional commit needed. If everything passed first time, no commit is needed for this task.

Push the branch (only after the user confirms they want it pushed):

```bash
git push -u origin the-basis-point-rebrand
```

Do **not** push, open a PR, or merge to main without explicit user instruction.

---

## Out of scope (intentionally not in any task)

- Custom domain purchase.
- Email follow / Substack mirror / RSS surfacing.
- LinkedIn CTA changes (already wired through `about.contact` and rendered in `ContactSection.tsx`).
- "On my desk" Sanity-backed strip.
- "Rates & Policy" category addition.
- "Why bonds" longform essay (a writing task, not engineering).
- Removing the live yield-curve homepage section or any of its supporting files. User explicitly asked it to stay.
