# Mobile-friendliness fixes — design

## Problem

On iPhone (viewport ~375px), two issues make the site feel broken:

1. **About and Contact sections have no side gutters.** Body text runs flush against both screen edges. Other sections (Hero, Notes feed, Footer) render with the expected 20px horizontal padding.
2. **The hamburger dropdown menu is effectively invisible when opened.** Tapping the menu button does open the panel, but the panel renders as an ~18px-wide sliver pinned to the right edge.

## Root causes

### Bug 1 — Padding override

`.page-wide` controls horizontal gutters site-wide:

```css
.page-wide { max-width: var(--maxw); margin: 0 auto; padding: 0 var(--pad); }
```

`--pad` scales down by viewport (56px → 32px at ≤920px → 20px at ≤560px).

Both `AboutSection` and `ContactSection` render `<div className="page-wide about">` / `<div className="page-wide contact">`. But the cascade contains:

```css
.about   { padding: 0; }   /* line ~868 */
.contact { padding: 0; }   /* line ~636 */
```

These rules win over `.page-wide` (later in source) and zero out **all** padding, including horizontal. The vertical-zero intent was unnecessary anyway, because vertical padding lives on the parent `.band-about` / `.band-contact`.

Verified empirically at 375px width: `getComputedStyle(.page-wide.about).paddingLeft === "0px"`.

### Bug 2 — Mobile menu mis-anchored

The mobile menu pop is positioned absolutely inside `.mobile-menu`, which is a small inline-flex container (`position: relative`) around the hamburger button — roughly 44–50px wide.

```css
.mobile-menu { position: relative; }
.menu-pop    { position: absolute; top: calc(100% + 10px); right: var(--pad); width: 280px; }

@media (max-width: 560px) {
  .menu-pop { right: 20px; left: 20px; width: auto; }
}
```

With both `left` and `right` set relative to a ~50px parent, the computed width becomes `parent_width − 40px` ≈ 10–18px. Verified empirically: `.menu-pop` computed width at 375px viewport is `18px`, bounding box `0 × 550`.

The hamburger button itself, the open/close state machine, the outside-click handler, and Escape-to-close all work correctly — only the panel's geometry is wrong.

## Solution

Two scoped CSS-and-JSX changes, no React logic or state changes.

### Change 1 — Restore About + Contact gutters

In `src/app/globals.css`, delete the two `padding: 0` overrides:

- Remove the `padding: 0` declaration from `.about` (~line 868).
- Remove the `padding: 0` declaration from `.contact` (~line 636).

Result: `.page-wide` 's `padding: 0 var(--pad)` flows through unimpeded. About and Contact pick up the same 20px iPhone gutter that Hero, Notes feed, and Footer already use, with no change to vertical spacing (still driven by `.band-about` / `.band-contact`).

### Change 2 — Re-anchor the mobile menu

The fix is to position the `.menu-pop` panel relative to `.top-inner` (the full-width header container, already `position: relative`) rather than the tiny `.mobile-menu` button container.

**JSX (`src/components/Nav.tsx`):**

- Move the `{mobileOpen && (<div className="menu-pop">…</div>)}` block out of `.mobile-menu` and place it as a sibling element inside `.top-inner` (e.g., after `.top-right`). The hamburger `<button>` stays where it is inside `.mobile-menu`.
- Replace the single `mobileRef` with two refs: `mobileBtnRef` on the `.mobile-menu` wrapper (around the button) and `mobilePanelRef` on the new panel element. Update the outside-click handler so the panel only closes when the click is outside **both**: `if (!mobileBtnRef.current?.contains(target) && !mobilePanelRef.current?.contains(target)) setMobileOpen(false);`. This preserves the existing behavior — clicks on the button or inside the panel keep it open; clicks anywhere else close it.
- No changes to: `mobileOpen` state, the button's `onClick` toggle, the Escape key handler, the `jump()` handler used by panel links.

**CSS (`src/app/globals.css`):**

- `.menu-pop` keeps `position: absolute`, `top: calc(100% + 10px)`, `right: var(--pad)`, base `width: 280px` (now anchored against `.top-inner`).
- Inside `@media (max-width: 560px)`, keep `.menu-pop { right: 20px; left: 20px; width: auto; }`. Because the new ancestor (`.top-inner`) spans the full viewport, the panel now resolves to ~335px wide at 375px viewport.
- Bump menu row vertical padding from `11px` to `14px` for comfortable phone taps — applied only at `≤560px` to avoid changing desktop styling.

### Out of scope

- No changes to Hero, Notes index, Projects/Stacking section, RightNowBlock, Footer, NoteCard.
- No typography scaling, no color changes, no new components.
- No behavior changes to the desktop hover dropdown for Notes — that's a separate `.notes-pop` and not affected.

## Verification

After applying changes, with `npm run dev` running:

1. Resize preview to 375×812 (mobile preset).
2. `preview_inspect('.page-wide.about')` — expect `padding-left: 20px`, `padding-right: 20px`.
3. `preview_inspect('.page-wide.contact')` — expect `padding-left: 20px`, `padding-right: 20px`.
4. Click `.menu-btn`, then `preview_inspect('.menu-pop')` — expect computed `width` ≈ `335px`, bounding box `width > 300`, `x` ≈ `20`.
5. Screenshot top of page with menu open — confirm visible panel.
6. Screenshot About and Contact sections — confirm comfortable left/right gutters.
7. Resize to desktop (1280) — confirm Notes hover dropdown still works, hamburger is hidden.

## Risks and reversibility

- **Risk:** Removing `.contact { padding: 0; }` could in theory affect a nested element somewhere. Mitigation: the rule sets padding only on the `.contact` div itself (not a child selector), so the only effect is on that one element.
- **Risk:** Moving the panel out of `.mobile-menu` could break outside-click detection. Mitigation: combine refs as described, then verify by tapping outside the panel and confirming it closes.
- **Reversibility:** All changes are localized to one CSS file and one component file; revert is a single `git checkout`.
