# The Basis Point — Rebrand & Homepage Tweaks

**Status:** Design approved · Implementation pending
**Branch:** `the-basis-point-rebrand` (from `projects-stacking-cards`)
**Date:** 2026-06-28

## Purpose

The site is being shared on LinkedIn to gain traction with recruiters and readers who care about fixed-income writing. To support that, the site needs to read as a credible publication on first impression while keeping the personal voice in the standfirst that is the strongest thing on the homepage today. This spec rebrands the site as a one-author publication called *The Basis Point*, gives it a distinctive visual mark (a small animated yield-curve glyph) wherever the wordmark appears, and tidies two small homepage details (recent-notes count, read-time math) that have been bothering the author.

Two related ideas were explored and explicitly dropped from this spec:
- An "On my desk" Sanity-backed strip showing current reads.
- A new "Rates & Policy" category for the social-policy lens.

Both are deferred until the editorial angle is clearer.

A LinkedIn-follow CTA was also explored, then dropped on discovering the LinkedIn link is already wired through `about.contact` and rendered in the contact section.

## Branding framing (locked)

The publication is **The Basis Point**, edited and written by Nathalie Lustig. Visitors arriving from a LinkedIn post already know the author; the masthead therefore leads with the publication name, and the author's name sits as a small byline directly beneath. The `/about` page is the one place where the author's identity remains primary.

## Scope

### 1. Rebrand (text changes)

| Location | Change |
|---|---|
| `src/app/layout.tsx` | `metadata.title` → `"The Basis Point"`. `metadata.description` reworded to lead with the publication (e.g. "The Basis Point — notes on rates, credit, and sovereign issuance by Nathalie Lustig"). Exact copy chosen during implementation. |
| `src/app/notes/page.tsx` | `metadata.title` → `"Notes — The Basis Point"`. |
| `src/app/page.tsx` (hero) | Replace `<h1 className="hero-name">Nathalie Lustig</h1>` with `<h1 className="hero-name">The Basis Point</h1>`. Add a byline element directly underneath: text `Notes by Nathalie Lustig`, set in **sentence case** (no all-caps treatment). New class `hero-byline`; styled in serif at ~14–15px, color `var(--color-ink-60)`, no letter-spacing, no uppercase. |
| `src/app/page.tsx` (hero-eyebrow) | Unchanged. `Bond Notes` eyebrow stays as-is (UI chrome, fine to remain small-caps). |
| `src/app/page.tsx` (hero-standfirst) | Unchanged. The first-person standfirst is the strongest copy on the page and stays exactly as written. |
| `src/components/Footer.tsx` | Unchanged. `© 2026 Nathalie Lustig` is a real copyright line, not a brand line, and stays as the author's name. |
| `src/app/about/page.tsx` | Unchanged. |

**No all-caps in writing copy.** The byline, any descriptive prose, and any new credit lines must be sentence-cased. Existing UI chrome (`.l-kicker`, `.l-smallcaps`, `Bond Notes` eyebrow, section labels) is UI and stays.

### 2. Brand mark (yield-curve glyph + wordmark)

A new visual mark that replaces the `NL` text in the top-left of the nav. It is a small chart — hairline X/Y axes with no labels, a hand-drawn "normal steepening" curve inside — paired with the wordmark `The Basis Point` in serif.

#### Component

New file `src/components/BasisPointMark.tsx`. Client component (because of the on-mount draw animation).

Props:
- `size?: number` — defaults to `32` (px). Defines the glyph's bounding square.
- `axes?: boolean` — defaults to `true`. When `false`, axes are not rendered (used for the favicon source, where hairlines disappear at small raster sizes).
- `animate?: boolean` — defaults to `true`. When `false`, the curve renders fully drawn (used for any static contexts).

Implementation notes:
- SVG with viewBox roughly `0 0 40 32` (slightly wider than tall to leave room for the axes on the left and bottom).
- Axes: two `<line>` elements, `stroke="var(--color-ink-45)"`, stroke-width `0.5`. Y axis runs left edge top-to-bottom inside the padding; X axis runs bottom edge left-to-right. No ticks, no labels.
- Curve: single `<path>`, hardcoded `d` attribute approximating a normal Treasury curve — gentle rise on the short end, accelerating into the long end. Stroke `var(--color-accent)`, stroke-width `1.6`, `stroke-linecap="round"`, fill `none`.
- A small filled dot (`r=1.2`, same accent color) at the long end of the curve, echoing the tracer in the big chart.

#### Animation

Matches the technique used in `src/components/YieldCurve.tsx`:
- CSS-driven stroke-dasharray / stroke-dashoffset draw on the curve path.
- Duration ~1.2s, easeInOut. (The big chart uses 3s — at glyph scale a 3s draw reads as sluggish.)
- Axes fade in over ~250ms before the curve begins drawing so they appear to be "the graph the curve is drawn on" rather than appearing simultaneously.
- Draws once on first mount per page session. Subsequent SPA navigations do not re-trigger.

#### Usage

`src/components/Nav.tsx`:
- Replace the `<Link href="/#top" className="top-name" onClick={jump("top")}>NL</Link>` element with a new flex group containing `<BasisPointMark size={32} />` followed by a serif wordmark span reading `The Basis Point` (~14–15px, color `var(--color-ink)`). The whole group is the home link.
- On narrow viewports (existing mobile breakpoint), the wordmark hides and only the glyph remains. On the home page the masthead carries the full title, so nothing is lost; on inner pages the glyph alone identifies the publication.

#### Favicon

`src/app/icon.png`: replace with a square 256×256 PNG render of the axis-less glyph. Approach: add a one-off Node script under `scripts/` that takes the same SVG markup the component emits (with `axes={false}`, fully drawn, no animation), rasterises it with `sharp`, and writes the PNG. Commit the generated PNG; do not wire the script into the build. The favicon variant drops the axes because hairlines disappear at favicon sizes and would otherwise render as visual noise.

### 3. Homepage tweaks

- **Recent notes count.** `src/app/page.tsx`: change `const recent = notes.slice(0, 3)` to `const recent = notes.slice(0, 4)`. The existing `recent-list` markup renders one more `recent-row`; no styling changes needed. "View all notes →" link below is unchanged.
- **Yield curve section kept.** No deletions to `<YieldCurve />`, `getYieldCurve`, `FALLBACK_CURVE`, `marketData.ts`, `yieldCurveFallback.ts`, the `#curve` hash, or the related CSS. The big chart and the small brand-mark glyph coexist.

Homepage reading order after these changes: hero (with new masthead + byline) → 4 recent notes → "View all notes →" → live yield curve → about → projects → contact.

### 4. Read-time fix

`src/lib/readTime.ts`:
- Change `Math.round(words / 220)` to `Math.round(words / 225)`.
- Keep `Math.max(1, ...)` floor.

Diagnosis step before shipping: the user reports all notes show "2 min read" despite varying in length. Possible causes:
1. Notes legitimately land in the 330–660 word range (which rounds to 2 with the current divisor) and the symptom is illusory.
2. The Portable Text walker undercounts because some text lives in block types other than `block`, or inside marks the walker steps over.

During implementation, fetch the body arrays of two or three real notes from Sanity, run them through `readTime`, and compare against a naive whole-string word count. If the walker is undercounting, widen it to count text from any block-shaped node with `children[].text`, not only `_type === "block"`. If the counts agree, ship the divisor change as-is.

## Out of scope (and why)

- **Custom domain purchase.** LinkedIn → Vercel URL → LinkedIn-follow loop closes fine on the existing URL. Domain becomes useful only when the link gets shared verbally or in formal applications. Trivially added later.
- **Email follow / Substack mirror / RSS surfacing.** User chose LinkedIn-follow only.
- **LinkedIn CTA additions.** Already wired through `about.contact` and rendered in `ContactSection.tsx`.
- **"On my desk" Sanity-backed strip.** Conceptually approved as a future direction; deferred until the user is ready to populate it. Schema sketch documented above.
- **"Rates & Policy" category** (the social-policy lens). User unsure how to frame the editorial angle; an empty category is dropdown clutter. One-line code change whenever ready.
- **"Why bonds" longform essay.** A writing task, not an engineering task.

## Files touched

**Modified:**
- `src/app/layout.tsx` — metadata.
- `src/app/notes/page.tsx` — metadata.
- `src/app/page.tsx` — hero name → masthead + byline; recent notes count 3 → 4.
- `src/components/Nav.tsx` — `NL` mark replaced with glyph + wordmark group.
- `src/app/globals.css` — new `.hero-byline` rules; any CSS needed for the brand-mark draw animation.
- `src/lib/readTime.ts` — divisor 220 → 225; possibly widen the walker.
- `src/app/icon.png` — regenerated from the no-axes glyph.

**Added:**
- `src/components/BasisPointMark.tsx`.

**Unchanged:**
- `src/components/Footer.tsx`, `src/components/ContactSection.tsx`, `src/app/about/page.tsx`, `src/components/YieldCurve.tsx` and all its supporting modules, the Sanity schemas, the existing categories.

## Verification

After implementation, the dev server must be run and the following confirmed against the browser (not just typechecking):

1. Homepage `<title>` reads "The Basis Point" in the browser tab and a chart-shaped favicon appears.
2. Nav top-left shows the animated glyph + "The Basis Point" wordmark. The glyph draws in on first load (axes fade first, then curve draws over ~1.2s). Subsequent same-session nav does not re-trigger.
3. Hero shows `The Basis Point` as the large masthead with `Notes by Nathalie Lustig` in sentence case underneath. No uppercase / letter-spaced treatment on the byline.
4. Existing standfirst, eyebrow, and CTA are visually unchanged.
5. Recent notes list shows 4 items.
6. Yield curve section is still present and animates as before.
7. Open at least two notes of meaningfully different lengths and confirm read time differs and uses the 225 wpm baseline.
8. Mobile viewport: glyph remains in the nav; wordmark hides; nothing overflows.
9. `/about` page is unchanged.
10. Contact section still shows the existing LinkedIn link.
