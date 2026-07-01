# Nav polish and note navigation — design

**Date:** 2026-06-30

Three small improvements: Previous/Next navigation on note pages, fixing the Notes dropdown hover bug, and making the Notes dropdown caret larger.

---

## Problem

**Item 1 — Note pages have no back-navigation.** Each note's footer today shows only a single "Next note → [title]" link pointing to the older post. There is no way to navigate to a newer note without returning to the index. On a site with a small, curated set of notes, readers will naturally want to move in both directions after landing on a note from search or a direct link.

**Item 2 — The Notes dropdown intermittently misbehaves.** Two failure modes appear independently. First: hovering to open the dropdown and then clicking the "Notes" label itself sometimes does nothing — the click closes the dropdown rather than navigating. Second: moving the mouse from the "Notes" trigger down toward the dropdown items occasionally collapses the menu before the cursor arrives. Both failures make the dropdown feel flaky, discouraging use.

**Item 3 — The Notes dropdown caret is too small.** The small arrow `▾` after "Notes" in the top nav is rendered at 10px — less than the 14px nav link text. At a glance it is nearly invisible, so users cannot tell the trigger is interactive. The arrow should be legible without dominating the label.

---

## Root causes / Why

### Item 1

`getAdjacentNote` in `src/lib/queries.ts` returns one direction only (older, at `(idx + 1) % all.length`). There is no counterpart for the newer direction. Adding both directions inline as a single multi-return function would tangle the two computations; splitting into two named helpers (`getPrevNote` / `getNextNote`) keeps each one readable and makes the intent obvious at the call site.

### Item 2 — Root cause A (click on trigger)

`Nav.tsx` line 107: the trigger `<Link>` for the Notes menu has `onClick={() => setNotesOpen(false)}`. When a user who has hovered the menu open then clicks the trigger word, `onClick` fires first and closes the dropdown, then the router navigates — but because state has just been set to `false`, React re-renders before navigation commits and the user sees the menu flash closed. Removing this `onClick` leaves the close responsibility to the existing `mousedown` outside-click handler (line 45) and the `usePathname` effect (line 56), both of which already handle this correctly.

### Item 2 — Root cause B (hover gap)

`.notes-pop` in `src/app/globals.css` line 178 sets `margin-top: -2px`, pulling the popover 2px up to overlap the trigger element. The intended effect is to prevent a gap, but because the popover's border-box starts at the trigger's bottom edge, moving the mouse diagonally from the right side of the trigger to the left side of the popover can cross empty space between the two elements. `onMouseLeave` on `.notes-menu` then fires and the 140ms `closeTimer` starts. If the cursor doesn't reach `.notes-pop` before 140ms elapses, the menu closes. The fix: replace the `margin-top` hack with a transparent `::before` pseudo-element that extends the popover's hover area upward by 12px with no visible change.

### Item 3

`.notes-caret { font-size: 10px; }` (globals.css line 170). 10px is below the threshold where the Unicode `▾` character is comfortably legible at typical screen densities. Increasing to 13px brings it to roughly 93% of the trigger text size — perceptible but still visually subordinate.

---

## Solution

### Item 1 — Previous/Next note navigation

**Data layer (`src/lib/queries.ts`):**

Replace `getAdjacentNote` with two helpers. Keep the existing "idx not found → return `all[0]`" fallback in both.

```ts
// Returns the older note (the "Previous" direction in the footer).
// Wraps around at the oldest note → newest.
export async function getPrevNote(slug: string): Promise<BondNoteCard | null> {
  const all = await getAllNotes();
  if (all.length === 0) return null;
  const idx = all.findIndex((n) => n.slug === slug);
  if (idx === -1) return all[0];
  return all[(idx + 1) % all.length];
}

// Returns the newer note (the "Next" direction in the footer).
// Wraps around at the newest note → oldest.
export async function getNextNote(slug: string): Promise<BondNoteCard | null> {
  const all = await getAllNotes();
  if (all.length === 0) return null;
  const idx = all.findIndex((n) => n.slug === slug);
  if (idx === -1) return all[0];
  return all[(idx - 1 + all.length) % all.length];
}
```

`getAdjacentNote` can be deleted once the call site is updated.

**Component (`src/app/notes/[slug]/page.tsx`):**

Update the import and fetch both notes in parallel:

```ts
import { getNoteBySlug, getAllNoteSlugs, getPrevNote, getNextNote } from "@/lib/queries";

// Inside the page component:
const [prev, next] = await Promise.all([getPrevNote(slug), getNextNote(slug)]);
```

Replace the current `{next && ...}` footer block with:

```tsx
<footer className="read-foot">
  <div className="read-foot-grid">
    {prev && prev.slug !== slug && (
      <Link href={`/notes/${prev.slug}`} className="read-foot-cell read-foot-prev">
        <span className="l-smallcaps">Previous note</span>
        <span className="read-foot-title">{prev.title} ←</span>
      </Link>
    )}
    {next && next.slug !== slug && (
      <Link href={`/notes/${next.slug}`} className="read-foot-cell read-foot-next">
        <span className="l-smallcaps">Next note</span>
        <span className="read-foot-title">{next.title} →</span>
      </Link>
    )}
  </div>
</footer>
```

**CSS (`src/app/globals.css`) — extend the existing `.read-foot` block (~line 590):**

```css
/* Existing rule — keep as-is */
.read-foot { margin-top: 36px; padding-top: 26px; border-top: 1px solid var(--rule); }

/* New rules */
.read-foot-grid {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 24px;
  width: 100%;
}

.read-foot-cell {
  display: flex;
  flex-direction: column;
  gap: 4px;
  color: var(--ink);
  text-decoration: none;
}

.read-foot-next {
  text-align: right;
}

.read-foot-title {
  font-family: var(--font-serif), Georgia, serif;
  font-size: 15px;
  font-weight: 600;
  letter-spacing: -0.005em;
}

@media (max-width: 560px) {
  .read-foot-grid {
    grid-template-columns: 1fr;
    gap: 20px;
  }
  .read-foot-next {
    text-align: left;
  }
}
```

The `.l-smallcaps` eyebrow class is already defined globally; no change needed there. The `display: flex; align-items: center; justify-content: space-between; gap: 16px;` from the current `.read-foot` rule should be removed or consolidated — the new `.read-foot-grid` takes over layout responsibility, so `.read-foot` only needs the top margin/border.

---

### Item 2 — Fix the Notes dropdown bug

**Remove the trigger onClick (`src/components/Nav.tsx`, line 107):**

Delete `onClick={() => setNotesOpen(false)}` from the trigger `<Link>`. The surrounding `onMouseEnter` / `onMouseLeave` handlers on `.notes-menu` and the existing outside-click `mousedown` handler already manage state correctly.

Before:
```tsx
<Link href="/notes" className="notes-trigger" aria-expanded={notesOpen}
  onClick={() => setNotesOpen(false)}
>
```

After:
```tsx
<Link href="/notes" className="notes-trigger" aria-expanded={notesOpen}>
```

**Add hover bridge and fix margin (`src/app/globals.css`, ~line 174–179):**

Change `margin-top: -2px` to `margin-top: 0`, and add a `::before` pseudo-element:

```css
.notes-pop {
  position: absolute; top: 100%; left: 0; min-width: 280px;
  background: var(--surface); border: 1px solid var(--rule); border-radius: var(--radius-card);
  box-shadow: 0 18px 50px rgba(20,22,26,0.16); padding: 14px 8px 8px; z-index: 50;
  margin-top: 0;
  animation: nl-pop 140ms cubic-bezier(0.2,0.7,0.2,1);
}

.notes-pop::before {
  content: "";
  position: absolute;
  top: -12px;
  left: 0;
  right: 0;
  height: 12px;
}
```

The `::before` strip is invisible but part of `.notes-pop`'s hover region, so `onMouseEnter` on `.notes-pop` fires before the close timer can elapse.

**Tighten close timer (`src/components/Nav.tsx`, line 39):**

Change `setTimeout(() => setNotesOpen(false), 140)` to `setTimeout(() => setNotesOpen(false), 120)`.

---

### Item 3 — Larger Notes caret

In `src/app/globals.css` line 170, change `font-size: 10px` to `font-size: 13px` on `.notes-caret`. All other declarations on that rule stay untouched.

Before:
```css
.notes-caret { font-size: 10px; color: var(--ink-45); transition: transform 160ms ease; line-height: 1; }
```

After:
```css
.notes-caret { font-size: 13px; color: var(--ink-45); transition: transform 160ms ease; line-height: 1; }
```

---

## Out of scope

- Medium/low-confidence dropdown issues flagged during investigation: caret rotation timing discrepancy, potential remount edge case on fast hover-then-click, click-during-animation state flash. These are not user-impacting at the level the confirmed bugs are.
- Portrait removal from the right rail and all previous mobile-friendliness fixes — already shipped.
- Typography scaling, color changes, or new components outside the three items above.

---

## Verification

Start the dev server and open the Claude Preview.

**Item 1 — Previous/Next navigation:**

1. Navigate to any note page (e.g., `/notes/[any-slug]`).
2. `preview_inspect('.read-foot-grid')` — confirm the element exists.
3. At desktop width (>560px): confirm two columns side by side. `preview_inspect('.read-foot-next')` — confirm `text-align: right` in computed styles.
4. `preview_resize(375, 812)` (iPhone frame). `preview_inspect('.read-foot-grid')` — confirm `grid-template-columns` resolves to a single column (both links stacked). `preview_inspect('.read-foot-next')` — confirm `text-align: left`.
5. `preview_screenshot()` at 375px — confirm Previous on top, Next below, no text truncation.
6. Click a Previous link and confirm the destination is older than the source note. Click a Next link and confirm it is newer.

**Item 2 — Dropdown bug fix:**

1. At desktop width, hover over "Notes" in the nav — dropdown opens.
2. Move the mouse slowly toward the bottom of the dropdown without touching any item — confirm the menu does not collapse.
3. Click the "Notes" label while the dropdown is open — confirm navigation to `/notes` occurs (menu does not close-then-do-nothing).
4. `preview_inspect('.notes-pop::before')` — confirm `height: 12px`, `top: -12px`, `position: absolute`.
5. Confirm `margin-top: 0` on `.notes-pop`.

**Item 3 — Caret size:**

1. `preview_inspect('.notes-caret')` — confirm computed `font-size: 13px`.
2. `preview_screenshot()` of the nav bar — confirm the caret is visibly legible alongside the "Notes" label.

---

## Risks and reversibility

- **Item 1:** Two files touched (`queries.ts`, `notes/[slug]/page.tsx`) plus one CSS block. The new helpers are direct renames/inversions of the existing function. Revert is a single `git checkout` of both files.
- **Item 2:** Removing the `onClick` is strictly subtractive. The `::before` pseudo-element is invisible; if it causes any unexpected hover-region issues it can be removed in one line. The close-timer change is a one-character edit.
- **Item 3:** One CSS property, one value. Fully reversible in seconds.
