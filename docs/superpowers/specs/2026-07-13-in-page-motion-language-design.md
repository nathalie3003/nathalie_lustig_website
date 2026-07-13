# In-Page Motion Language

**Date:** 2026-07-13
**Status:** Approved (Nathalie)

## Problem

The site is entirely static on load. Its brand thesis is restraint — "confidence
comes from restraint, not visual noise" (`PRODUCT.md`) — but restraint isn't the
same as stillness. A small amount of *considered* entrance motion would make the
site feel deliberately set, like a page going to press, without tipping into the
"finance-bro / fintech dashboard" motion the brand explicitly rejects.

There is currently no shared vocabulary for how the site moves. `ScrollReveal`
(character-mask headline reveal, IntersectionObserver + CSS, reduced-motion
aware) exists and is the only motion primitive. Any new motion should extend that
grammar, not introduce a competing one.

## Goal

Establish a small, disciplined **in-page motion language** with three entrance
moments, all at or below the agreed "Tier B" ceiling. Motion is choreography, not
decoration: **entrance-only** (fires once on mount, never loops), reduced-motion
guarded, and built on the existing CSS class-toggle pattern (no new animation
library — `framer-motion` is installed but the house pattern is vanilla
class-toggle + CSS, and we keep it that way for consistency).

**Motion appetite (agreed):** Tier B is the ceiling. The wordmark and masthead
sit at **Tier A** (barely-there); the article opening is the one **Tier B**
(editorial choreography) moment.

## Scope

### 1. Masthead wipe — Tier A (`src/components/Nav.tsx`, `globals.css`)

The existing masthead rule is `.top { border-top: 3px solid var(--accent) }`
(`globals.css:138`). On `TopBar` mount, it wipes in left-to-right.

- Carry the wipe on a dedicated element/pseudo-element so the 3px band does not
  cause layout shift — e.g. `.top::before` positioned over the top edge,
  `transform: scaleX(0) → scaleX(1)`, `transform-origin: left center`, ~550ms,
  `cubic-bezier(.4,0,.2,1)`. The static `border-top` remains as the resting/
  fallback state underneath.
- Fires on component mount only. Because `TopBar` lives in the persistent layout
  and survives App Router client navigations, this naturally fires only on hard
  loads / refreshes — never on in-site link clicks. No extra guard needed.
- Trigger: add a `mounted` class on mount (`useEffect`), CSS animates on
  `.top.mounted::before`.

### 2. Wordmark reveal — Tier A (`src/components/Nav.tsx`, `globals.css`)

The wordmark is `.top-name-mark` = `<BasisPointMark>` (the "bp" aurora badge) +
`.top-name-word` ("The Basis Point"). On **genuine first visit only**:

1. Badge settles: `opacity 0 → 1`, `scale .92 → 1`, ~500ms, begins ~350ms in
   (just after the masthead wipe reads).
2. Wordmark ink-clip: `clip-path: inset(0 100% 0 0) → inset(0)` left-to-right +
   a 5px upward settle, ~550ms, begins ~500ms in.

- **First-visit guard:** a `sessionStorage` flag (e.g. `bp-wordmark-seen`). If
  absent, play and set it; if present, render the wordmark in its final state
  with no animation. "First visit" = first load of a browsing session.
- Return-home behavior: because the header persists across navigations, clicking
  "The Basis Point" to go home does **not** remount it, so there is no replay by
  construction — matching the agreed "first visit only" decision.
- `.top-name-word` is already `display:none` on mobile (`globals.css:1330`); the
  badge reveal still applies there.

### 3. Article-open choreography — Tier B (both note templates, `globals.css`)

On note-detail mount, a front-loaded staggered entrance (~1.4s total). Applies to
**both** article templates:

- **Trade notes** — `src/components/TradeIdeaArticle.tsx`: `.trade-back` →
  `.trade-rule` → `.article-meta-top` (`.l-tag` + date) → `.article-h1` →
  `.article-deck` → drop cap (`.article-body > p:first-of-type::first-letter`).
- **General notes** — `src/app/notes/[slug]/page.tsx`: `.ap-back` → `.ap-rule` →
  `.ap-meta` → `.ap-title` → `.ap-deck` → drop cap
  (`.ap-col > p:first-of-type::first-letter`).

Sequence and treatment:

1. Back-link: fade, ~150ms in.
2. Hairline rule: `scaleX(0 → 1)` from left, ~250ms in.
3. Tag + date: fade, ~400ms in.
4. **Title:** character-by-character rise from behind a mask — reuse the
   `ScrollReveal` primitive (`src/components/ScrollReveal.tsx`). Because the
   title is above the fold on load, drive it on **mount** rather than
   IntersectionObserver-on-scroll (see Open detail below).
5. Deck: fade + 6px up, begins ~1.05s in.
6. Drop cap: fade + settle, ~1.2s in.
7. First paragraph: fade, ~1.35s in.

Implementation: a single `articleReady` class toggled on the article root on
mount; CSS transitions on descendants use staggered `transition-delay`. Mirrors
the `ScrollReveal` class-toggle approach already in the codebase.

**Open detail to resolve in the plan:** `ScrollReveal` currently reveals on
scroll-intersection. For the on-load title we either (a) add an opt-in
`trigger="mount"` prop to `ScrollReveal`, or (b) let its existing 0.25 threshold
fire immediately since the title is in view on load. Prefer (a) — an explicit
mount trigger — so timing is deterministic and composes with the staggered
sequence above. Decide in the implementation plan.

## Reduced motion & accessibility

- Every moment respects `@media (prefers-reduced-motion: reduce)`: no transform,
  no transition — elements render in final state. Follows the existing pattern
  (`ScrollReveal.tsx:34`, and the many reduced-motion blocks already in
  `globals.css`).
- `ScrollReveal` already carries an accessible plain-text fallback for the
  title (`.sr-sr-only`); reusing it preserves that.
- No color-only signaling introduced; motion is purely additive to a fully
  legible static state.

## Out of scope (each its own future spec)

- **Remotion animated LinkedIn share-card (#6)** — a rendered-video pipeline,
  entirely separate toolchain (authored in the shared Remotion Studio). The
  intended second project; not covered here.
- **Yield-curve draw-on-scroll (#4)** — animating `YieldCurve.tsx`.
- **Scroll-reveal / reading-progress polish (#7)** — refining existing
  `ScrollReveal` / `ReadingProgress` easing and thresholds.
- No looping/ambient motion anywhere. No new animation dependency.

## Verification

- `tsc --noEmit` and `eslint` pass.
- Hard-load the home page: masthead rule wipes in once; on a fresh session the
  "bp" badge and "The Basis Point" reveal; reload within the session → wordmark
  is already static (no replay), masthead still wipes.
- Open a trade note and a general note: the header choreography plays in order,
  title rises character-by-character, then deck/drop-cap/first paragraph settle.
- Navigate home → into a note → back home via in-site links: no masthead/wordmark
  replay (header persists).
- Toggle OS "reduce motion": all three moments render in final state, no motion.
- Mobile width: badge reveal + article choreography still play; no layout shift
  from the masthead band.
