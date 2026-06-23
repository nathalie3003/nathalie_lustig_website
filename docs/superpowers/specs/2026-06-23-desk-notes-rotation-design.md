# Desk-notes rotating header

**Date:** 2026-06-23
**Status:** design approved by user, pending implementation
**Scope:** small, additive — one new client component + one swap inside `src/app/page.tsx`.

## Goal

Replace the static "DESK NOTES" eyebrow above the homepage notes list with a single editorial line whose final word cycles through the note categories. Reinforces what the section is *and* what the writer covers, in one motion.

> *"I write bond notes about **rates**"* → cycles through `credit`, `new issues`, `private credit`, `trade ideas`.

Adapted from the slot-machine pattern the user shared (Framer Motion `motion.span`, absolute-positioned stack, spring transition).

## Visual spec

- **Sits where the eyebrow was** — inside `<div className="section-head">` of the notes section in `src/app/page.tsx`. The current `<ScrollReveal as="span" className="l-eyebrow">Desk notes</ScrollReveal>` is replaced wholesale.
- **Typography:**
  - Lead text ("I write bond notes about ") — serif (Source Serif 4), ~17px, weight 400, color `var(--ink-45)` (the muted grey already used for eyebrows).
  - Rotating word — serif, same 17px, weight 600, color `var(--ink)` (full ink). Slight letter-spacing tightening (`-0.005em`).
- **Sleekness rules:**
  - Single line, no h-tag (semantically it's not a heading; the section is already anchored by `id="notes"`).
  - Total height ≈ 28–30px so it doesn't disturb vertical rhythm.
  - No icons, no underline, no border.

## Animation spec

- **Style:** slot machine / vertical reel — current word at `y: 0, opacity: 1`; words *before* current at `y: -150%, opacity: 0`; words *after* at `y: 150%, opacity: 0`.
- **Transition:** Framer Motion `spring` with `stiffness: 50` (matches the reference code).
- **Cadence:** advance every 2000ms via `setTimeout` (matches reference). Wraps around at end.
- **Container:** `position: relative; overflow: hidden; display: inline-flex` so cycling words slide in/out within their slot without pushing surrounding text.
- **Width handling:** the slot is sized to the *longest* word in the list ("private credit") via an invisible sizing span. Prevents layout jitter as words swap.
- **Reduced motion:** if `prefers-reduced-motion: reduce`, advance via instant opacity swap (no `y` translation, no spring).
- **No SSR mismatch:** the component is a client component (`"use client"`). Initial render shows index 0 deterministically.

## Component

New file: `src/components/DeskNotesRotator.tsx`.

- Props: `words: string[]` (passed from `page.tsx`, sourced from `CATEGORIES` in `src/lib/noteCat.ts` to stay aligned with the actual categories — so if categories change later, the rotator updates automatically).
- Self-contained: owns its own `useState` for the active index, `useEffect` for the timer, cleans up on unmount.
- Pure client component — no server data, no async.

## Data source

- Words come from `CATEGORIES.map(c => c.label.toLowerCase())` so the rotation lists exactly what readers can click into: `rates & macro`, `credit`, `new issues`, `private credit`, `trade ideas`.
- One small content tweak: lowercase the labels for the rotator since "I write bond notes about **rates & macro**" reads better in sentence-case than ALL CAPS or Title Case. The category pages and chips elsewhere stay as defined.

## Dependencies

- **New dependency:** `framer-motion` (~50KB gzipped). Added via `npm install framer-motion`. Used here and will be reused for the larger animation pass later (yield curve, card hovers).

## Out of scope

- The animated yield curve (separate, larger spec to come).
- The project / book card hover effects (separate, smaller spec).
- Touching any other page or component beyond the two files named above.

## Test plan

- [ ] First render shows "I write bond notes about rates & macro" (no flash of empty word).
- [ ] After ~2s the word reels up to "credit", and so on through the list, wrapping after the last.
- [ ] Container width does not change as words swap — measured against the widest word.
- [ ] With `prefers-reduced-motion: reduce` enabled in DevTools, words crossfade instead of sliding.
- [ ] No console errors on hydration; no hydration mismatch warning.
- [ ] Mobile viewport: line wraps cleanly if the lead text + longest word exceeds the column.

## Files touched

1. `src/components/DeskNotesRotator.tsx` — new.
2. `src/app/page.tsx` — replace the eyebrow with `<DeskNotesRotator words={...} />`.
3. `package.json` / `package-lock.json` — adds `framer-motion`.

That's the whole change.
