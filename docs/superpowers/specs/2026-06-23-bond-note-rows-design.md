# Bond-note rows: editorial enhancements

**Date:** 2026-06-23
**Status:** design approved by user (multi-select), pending implementation
**Scope:** small — modifies row layout + styles, no new dependencies.

## Goal

The user reviewed an external glass-card bundle and chose to **keep the editorial style** rather than adopt glassmorphism / Tailwind / shadcn. Instead, enhance the existing uniform `.recent-row` list on the homepage with four additive editorial improvements:

1. Cover image thumbnail (optional, from Sanity)
2. Excerpt line under the title
3. Hover lift + soft shadow
4. Slightly taller rows / more breathing room

No change to the slot-machine header above (PR #8) or the surrounding section structure.

## Row anatomy (new)

```
┌──────┐  CATEGORY                                  DATE
│ thumb│  Title in serif (19px)
│ 80×80│  Optional excerpt, one line, muted, ellipsis
└──────┘
```

- **Thumbnail:** 80×80px, `border-radius: 8px`, `object-fit: cover`. Only rendered if `coverImage` exists in Sanity for that note. Notes without a cover collapse the thumb column so text-only rows align flush with the eyebrow above.
- **Right-side metadata:** category eyebrow + date stay on the top line, right-aligned date.
- **Title:** unchanged (19px Source Serif, weight 600).
- **Excerpt:** new — 14px Inter (or serif at 14.5px), `color: var(--ink-45)`, `line-clamp: 1`. If a note has no excerpt, the line is omitted (row stays shorter).

## Hover state

- `transform: translateY(-2px)` on `.recent-row` (not `.recent-link`, so the entire row including thumb lifts).
- `box-shadow: 0 6px 18px rgba(15, 18, 28, 0.06)` — soft, low-opacity.
- Existing accent-color title shift on hover preserved.
- Transitions: `transform 180ms ease, box-shadow 180ms ease`.
- Respects `prefers-reduced-motion: reduce` — disable transform, keep colour change only.

## Spacing

- `.recent-link` vertical padding: `14px → 20px`.
- Gap between rows already provided by the existing border-bottom rule.

## Data wiring

No query changes needed — `BondNoteCard` already includes `excerpt` and `coverImage` in [queries.ts:8-10](src/lib/queries.ts:8). `urlFor` is already imported in components that need Sanity image URLs (e.g. RightRail).

## Files touched

1. `src/app/page.tsx` — pass `excerpt` and `coverImage` to each row; render thumbnail conditionally.
2. `src/app/globals.css` — update `.recent-row` / `.recent-link` styles; add `.recent-thumb`, `.recent-excerpt`.

No new components, no new dependencies.

## Out of scope

- Read-time computation (deliberately skipped — user picked editorial path; read-time is more a SaaS / Medium pattern).
- Author/avatar block (single-author site, redundant).
- Tags as plural (schema is one category per note).
- Any layout change above 3 visible rows.

## Test plan

- [ ] Notes with a cover image show the 80×80 thumb on the left; rows without coverImage stay text-only and align flush.
- [ ] Excerpt line renders one line, ellipsis at overflow; absent if note has no excerpt.
- [ ] On hover: row lifts ~2px, gentle shadow appears, title shifts to accent. No layout shift below it.
- [ ] DevTools → `prefers-reduced-motion: reduce` → hover keeps colour change but no transform.
- [ ] Mobile (~380px): thumb stays 80×80, title wraps cleanly, excerpt either fits or truncates.
- [ ] No console / hydration errors.
