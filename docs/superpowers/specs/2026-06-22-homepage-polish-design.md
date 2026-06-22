# Homepage Polish — Phase 1 Follow-up

**Date:** 2026-06-22
**Branch:** continues on `homepage-redesign-phase-1`
**Scope:** Three targeted visual fixes after preview review of the Phase 1 deploy: shrink the hero portrait, drop the ticker from the homepage, and normalize Notes section typography.

## Problems being fixed

1. Hero portrait is dominating — at full square 1fr column it fills half the viewport.
2. Ticker overflows its container at desktop width (text cut off at edges).
3. Notes section feels stranded: feature title is the biggest type on the page after the hero, recent-row title type drops to a fraction of that, eyebrow-link-action sizes are inconsistent.

## Hero changes

`src/components/Hero.tsx` markup gains one element, `src/app/globals.css` adjusts.

**Markup.** Below the `<p className="hero-v2-lead">` add:

```tsx
<p className="hero-v2-creds">LSE Economics · CFA Level I</p>
```

(Inline string. We're not adding a new tone-pack key for two words.)

**CSS.**

- `.hero-v2-inner` grid changes from `1fr 1fr` to `1.5fr 1fr` so the text column gets ~60% of width.
- `.hero-v2-portrait` gains `max-width: 420px` and `margin-left: auto` (so it right-aligns inside its column when the column is wider than the cap).
- New `.hero-v2-creds`: same font-family / weight / color as body copy, slightly muted (`var(--ink-72)`), smaller (15px), top margin to sit ~12px below the lead, bottom margin to push the CTA down ~32px.
- Stacked mobile (`@media (max-width: 820px)`): portrait `max-width` drops to ~320px, stays centered.

## Ticker removed from homepage

`src/app/page.tsx`: delete the `<MarketTickerPlaceholder />` line and the corresponding import. The component file (`src/components/MarketTickerPlaceholder.tsx`) stays in the repo so it can be re-added later. Any ticker-only CSS in `globals.css` stays — it's cheap and may come back.

New `/` order: Hero → Right Now strip → About → Projects → Notes → Contact.

## Notes section typography

Goal: a single, predictable type scale so the eye moves eyebrow → feature → recent rows → "view all" without jumps.

**Targets** (all in `src/app/globals.css`):

| Element | Today | New |
|---|---|---|
| `.latest-feature-cat` (feature category eyebrow) | 11px / 0.12em | unchanged |
| `.latest-feature-date` (feature date) | 11.5px / 0.04em | 11px / 0.04em (matches cat scale) |
| `.latest-feature-title` (big serif title) | 30px / -0.018em | **24px / -0.012em** (smaller, lets the section breathe; doesn't compete with the hero name) |
| `.latest-feature-excerpt` | 17px / 1.55 | unchanged |
| `.latest-feature-more` ("Read this note →") | 12.5px sans accent | **13px** (matches `.view-all-notes`) |
| `.view-all-notes` | 13px sans accent | unchanged |
| `.recent-cat` | 10.5px | **11px** (matches `.latest-feature-cat`) |
| `.recent-title` | 16px serif | unchanged |
| `.recent-date` | 11.5px | 11px / 0.04em (matches `.latest-feature-date`) |

After the change, the type ladder is:

- Section eyebrow ("Recent commentary"): existing `.l-eyebrow`
- Feature title: 24px serif
- Excerpt: 17px serif
- All category eyebrows: 11px sans accent
- All dates: 11px sans muted
- All accent links ("Read this note →", "View all notes →"): 13px sans accent

## Out of scope

- Right Now strip styling (looks fine in preview)
- About / Projects sections (untouched)
- Contact / Footer (just landed in Phase 1)
- Mobile-specific tweaks beyond the hero portrait cap

## Risks / open items

- Hero portrait cap at 420px may feel too small at very wide viewports (>1600px). If so, easy bump to 480px in a follow-up.
- Removing the ticker may surprise repeat visitors who liked it. The component stays in the repo — easy revert.
