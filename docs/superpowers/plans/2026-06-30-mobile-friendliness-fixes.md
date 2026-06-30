# Mobile-friendliness Fixes Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Fix two visible mobile bugs on Nathalie's website — About + Contact text touching the screen edges, and the hamburger menu rendering as an unusable ~18px sliver — without changing desktop layout or other sections.

**Architecture:** Two scoped changes to existing files. Remove two redundant CSS overrides that wipe out horizontal padding on About and Contact, and re-anchor the mobile menu panel to the full-width `.top-inner` container (instead of the tiny hamburger-button wrapper) so the existing `left: 20px; right: 20px` rule actually spans the viewport. No new components, no state changes, no logic changes.

**Tech Stack:** Next.js 15 App Router, React 19, vanilla CSS in `src/app/globals.css`, TypeScript. No test framework is configured in this project — verification is via the Claude Preview dev-server tools (`preview_inspect`, `preview_screenshot`) against a 375×812 mobile viewport.

---

## File Structure

**Files modified:**
- `src/app/globals.css` — two override removals + one media-query addition for menu row padding.
- `src/components/Nav.tsx` — relocate the rendered `.menu-pop` panel from inside `.mobile-menu` to inside `.top-inner`; split the single `mobileRef` into `mobileBtnRef` + `mobilePanelRef`; update the outside-click handler.

**Files NOT touched:**
- `src/components/AboutSection.tsx`, `src/components/ContactSection.tsx` — only the CSS rules that affect them change; the JSX is correct.
- All other components.

---

## Task 1: Remove the padding override on `.about`

**Files:**
- Modify: `src/app/globals.css` (the `.about` rule, currently around line 868)

- [ ] **Step 1: Verify the failing behavior**

Start the dev server and confirm the bug exists at iPhone width. From an interactive `claude` terminal — or by hand in a browser — open the site at 375px viewport, scroll to the About section, and confirm the body text touches the left edge with no gutter.

You can also confirm programmatically by running these in the page console:

```js
window.scrollTo(0, document.getElementById('about').getBoundingClientRect().top + window.scrollY);
getComputedStyle(document.querySelector('.page-wide.about')).paddingLeft
```

Expected before fix: `"0px"`.

- [ ] **Step 2: Remove the override**

Open `src/app/globals.css` and find the line:

```css
  /* ABOUT */
  .about { padding: 0; }
```

Delete the `.about { padding: 0; }` declaration entirely (one line). Keep the `/* ABOUT */` comment so the section heading stays.

The file should now read:

```css
  /* ABOUT */
  .about-title { font-size: 38px; font-weight: 600; letter-spacing: -0.022em; margin: 10px 0 0; }
```

- [ ] **Step 3: Verify the fix**

Reload the page in the preview at 375px viewport. Run in the page console:

```js
getComputedStyle(document.querySelector('.page-wide.about')).paddingLeft
```

Expected after fix: `"20px"`.

Also confirm vertical spacing hasn't changed: scroll to About and visually compare — there should still be ~60px gap above the kicker (driven by `.band-about { padding: 60px 0 64px; }` on the parent).

- [ ] **Step 4: Commit**

```bash
git add src/app/globals.css
git commit -m "mobile: restore horizontal gutter on About section"
```

---

## Task 2: Remove the padding override on `.contact`

**Files:**
- Modify: `src/app/globals.css` (the `.contact` rule, currently around line 636)

- [ ] **Step 1: Verify the failing behavior**

In the preview at 375px viewport, scroll to the Contact section ("Get in touch"). Confirm the heading and lede touch the left edge.

Console check:

```js
getComputedStyle(document.querySelector('.page-wide.contact')).paddingLeft
```

Expected before fix: `"0px"`.

- [ ] **Step 2: Remove the override**

In `src/app/globals.css`, find:

```css
  .band-contact {
    background: var(--surface);
    border-top: 1px solid var(--rule);
    padding: 64px 0 80px;
  }
  .contact { padding: 0; }
  .contact-head { max-width: 720px; }
```

Delete the line `.contact { padding: 0; }`. The block should now read:

```css
  .band-contact {
    background: var(--surface);
    border-top: 1px solid var(--rule);
    padding: 64px 0 80px;
  }
  .contact-head { max-width: 720px; }
```

- [ ] **Step 3: Verify the fix**

Reload. Run:

```js
getComputedStyle(document.querySelector('.page-wide.contact')).paddingLeft
```

Expected: `"20px"`.

Vertical spacing of the Contact section should be unchanged (vertical padding comes from `.band-contact`).

- [ ] **Step 4: Commit**

```bash
git add src/app/globals.css
git commit -m "mobile: restore horizontal gutter on Contact section"
```

---

## Task 3: Re-anchor the mobile menu panel in JSX

**Files:**
- Modify: `src/components/Nav.tsx`

**Context:** The `.menu-pop` panel is currently rendered as a child of `.mobile-menu` (which wraps the hamburger button and is only ~50px wide). Its `position: absolute` resolves against that tiny ancestor, so its `left: 20px; right: 20px` collapses to ~18px wide. The fix is to render the panel as a child of `.top-inner` (the full-width header container, already `position: relative`). The hamburger button stays where it is.

- [ ] **Step 1: Verify the failing behavior**

In the preview at 375px viewport, scroll to top so the header is visible. Click the hamburger button. Inspect:

```js
const r = document.querySelector('.menu-pop')?.getBoundingClientRect();
({ width: r?.width, x: r?.x })
```

Expected before fix: `width` ≈ `0`, x ≈ `340` (the panel is a ~18px sliver pinned to the right edge).

- [ ] **Step 2: Split the ref into two refs**

In `src/components/Nav.tsx`, find this line near the top of the component:

```ts
  const mobileRef = useRef<HTMLDivElement>(null);
```

Replace it with two refs:

```ts
  const mobileBtnRef = useRef<HTMLDivElement>(null);
  const mobilePanelRef = useRef<HTMLDivElement>(null);
```

- [ ] **Step 3: Update the outside-click handler to check both refs**

Still in `src/components/Nav.tsx`, find the `useEffect` block with the `onDoc` handler. It currently contains:

```ts
    function onDoc(e: MouseEvent) {
      if (notesRef.current && !notesRef.current.contains(e.target as Node)) {
        setNotesOpen(false);
      }
      if (mobileRef.current && !mobileRef.current.contains(e.target as Node)) {
        setMobileOpen(false);
      }
    }
```

Replace the `mobileRef` check with a combined check against both new refs. A click closes the menu only if it falls outside **both** the button wrapper and the panel:

```ts
    function onDoc(e: MouseEvent) {
      if (notesRef.current && !notesRef.current.contains(e.target as Node)) {
        setNotesOpen(false);
      }
      const target = e.target as Node;
      const inBtn = mobileBtnRef.current?.contains(target);
      const inPanel = mobilePanelRef.current?.contains(target);
      if (!inBtn && !inPanel) {
        setMobileOpen(false);
      }
    }
```

- [ ] **Step 4: Attach `mobileBtnRef` to the existing `.mobile-menu` wrapper**

Find this JSX block:

```tsx
          <div className="mobile-menu" ref={mobileRef}>
            <button
              className="menu-btn"
              aria-expanded={mobileOpen}
              aria-label="Menu"
              onClick={() => setMobileOpen((o) => !o)}
            >
              <span className="bars"><i></i><i></i><i></i></span>
            </button>
            {mobileOpen && (
              <div className="menu-pop" role="menu">
                <Link
                  href="/notes"
                  className="menu-row"
                  onClick={() => setMobileOpen(false)}
                >
                  <span className="mr-title">Notes</span>
                </Link>
                <div className="menu-cats">
                  {CATEGORIES.map((c) => (
                    <Link
                      key={c.slug}
                      href={`/notes?category=${c.slug}`}
                      className="menu-cat"
                      onClick={() => setMobileOpen(false)}
                    >
                      <span>{c.label}</span>
                    </Link>
                  ))}
                </div>
                <Link href="/#about" className="menu-row" onClick={jump("about")}>
                  <span className="mr-title">About</span>
                </Link>
                <Link href="/#projects" className="menu-row" onClick={jump("projects")}>
                  <span className="mr-title">Projects</span>
                </Link>
                <div className="menu-rule" />
                <Link href="/#contact" className="menu-row" onClick={jump("contact")}>
                  <span className="mr-title">Let&apos;s talk more →</span>
                </Link>
              </div>
            )}
          </div>
```

Change two things only:
1. Replace `ref={mobileRef}` with `ref={mobileBtnRef}` on the `.mobile-menu` `<div>`.
2. Remove the `{mobileOpen && (<div className="menu-pop">…</div>)}` block from inside `.mobile-menu` (we'll re-render it as a sibling of `.top-right` in the next step). After this step, the `.mobile-menu` `<div>` contains only the `<button>`:

```tsx
          <div className="mobile-menu" ref={mobileBtnRef}>
            <button
              className="menu-btn"
              aria-expanded={mobileOpen}
              aria-label="Menu"
              onClick={() => setMobileOpen((o) => !o)}
            >
              <span className="bars"><i></i><i></i><i></i></span>
            </button>
          </div>
```

- [ ] **Step 5: Render the panel as a sibling inside `.top-inner`**

Add the panel after the closing `</div>` of `.top-right`, still inside `.top-inner`. The `.top-inner` element currently closes here:

```tsx
        <div className="top-right">
          {/* …Let's talk more button + .mobile-menu… */}
        </div>
      </div>
    </header>
```

Insert the menu-pop render as a sibling of `.top-right`, just before the closing `</div>` of `.top-inner`:

```tsx
        <div className="top-right">
          {/* …Let's talk more button + .mobile-menu (button only)… */}
        </div>

        {mobileOpen && (
          <div className="menu-pop" role="menu" ref={mobilePanelRef}>
            <Link
              href="/notes"
              className="menu-row"
              onClick={() => setMobileOpen(false)}
            >
              <span className="mr-title">Notes</span>
            </Link>
            <div className="menu-cats">
              {CATEGORIES.map((c) => (
                <Link
                  key={c.slug}
                  href={`/notes?category=${c.slug}`}
                  className="menu-cat"
                  onClick={() => setMobileOpen(false)}
                >
                  <span>{c.label}</span>
                </Link>
              ))}
            </div>
            <Link href="/#about" className="menu-row" onClick={jump("about")}>
              <span className="mr-title">About</span>
            </Link>
            <Link href="/#projects" className="menu-row" onClick={jump("projects")}>
              <span className="mr-title">Projects</span>
            </Link>
            <div className="menu-rule" />
            <Link href="/#contact" className="menu-row" onClick={jump("contact")}>
              <span className="mr-title">Let&apos;s talk more →</span>
            </Link>
          </div>
        )}
      </div>
    </header>
```

The panel's content is byte-identical to what was inside `.mobile-menu` before — the only differences are (a) its location in the tree and (b) the `ref={mobilePanelRef}` attribute.

- [ ] **Step 6: Verify the JSX change**

Reload the preview at 375px viewport. Click the hamburger button. Inspect:

```js
const r = document.querySelector('.menu-pop')?.getBoundingClientRect();
({ width: r?.width, x: r?.x })
```

Expected: `width` ≈ `335`, `x` ≈ `20`. The panel now spans almost the full width of the screen, with 20px gutters. (At this point the inside-tap and outside-tap behavior should also work — verify by clicking inside the panel on an empty area, the menu should stay open; click anywhere else on the page, it should close.)

Confirm no TypeScript errors by running:

```bash
npx tsc --noEmit
```

Expected: no errors.

- [ ] **Step 7: Commit**

```bash
git add src/components/Nav.tsx
git commit -m "mobile: re-anchor menu panel to header container"
```

---

## Task 4: Bump menu row tap targets on mobile

**Files:**
- Modify: `src/app/globals.css` (the `@media (max-width: 560px)` block, currently around lines 1000–1006)

- [ ] **Step 1: Locate the mobile media query block**

In `src/app/globals.css`, find:

```css
@media (max-width: 560px) {
  :root { --pad: 20px; }
  .note-row { grid-template-columns: 1fr; gap: 8px; }
  .note-tag { display: none; }
  .menu-pop { right: 20px; left: 20px; width: auto; }
  .top-name-word { display: none; }
}
```

- [ ] **Step 2: Add the row-padding override**

Inside that same `@media` block, add one declaration that increases vertical padding on `.menu-row` for comfortable phone taps:

```css
@media (max-width: 560px) {
  :root { --pad: 20px; }
  .note-row { grid-template-columns: 1fr; gap: 8px; }
  .note-tag { display: none; }
  .menu-pop { right: 20px; left: 20px; width: auto; }
  .menu-row { padding: 14px 13px; }
  .top-name-word { display: none; }
}
```

This overrides the base `.menu-row { padding: 11px 13px; }` only at ≤560px, so desktop styling is unchanged.

- [ ] **Step 3: Verify**

Reload at 375px viewport. Open the menu. Inspect:

```js
getComputedStyle(document.querySelector('.menu-row')).paddingTop
```

Expected: `"14px"` (was `"11px"`).

Resize the preview to desktop (1280) and reload. Confirm the desktop Notes hover dropdown still renders correctly and `.menu-row` padding outside the media query is unaffected:

```js
getComputedStyle(document.querySelector('.menu-row'))?.paddingTop
```

Expected at desktop width (with menu not visible): selector returns `null`/no element; that's fine. The desktop Notes dropdown uses `.np-row`, not `.menu-row`, so it's untouched.

- [ ] **Step 4: Commit**

```bash
git add src/app/globals.css
git commit -m "mobile: increase menu row tap target on phones"
```

---

## Task 5: End-to-end verification at multiple viewports

**Files:** none modified — verification only.

- [ ] **Step 1: Verify mobile (375×812)**

Start the dev server (`npm run dev` or via preview tools), set viewport to 375×812, reload, and walk through:

1. **Header at top of page:** hamburger button visible at right.
2. **Click hamburger:** panel drops down, spans almost the full screen width, has 20px gutters left and right, items are comfortably tappable.
3. **Tap inside panel on an empty area:** panel stays open.
4. **Tap outside panel (e.g., on the body):** panel closes.
5. **Press Escape (if testing in browser):** panel closes.
6. **Scroll to About section:** body paragraphs have a clear left and right gutter (20px each). No text touching edges.
7. **Scroll to Contact section ("Get in touch"):** heading, lede, email/LinkedIn rows, and form all have proper left/right gutters.
8. **Tap a menu item (e.g., "About"):** menu closes and the page smoothly scrolls to that section.

Take a screenshot of the open menu and a screenshot of the About + Contact sections for the commit/PR record.

- [ ] **Step 2: Verify smaller phone (320×568)**

Resize the preview to 320×568 (older iPhone SE / iPhone 5 size — a stress test) and re-check items 1, 2, 6, 7 above. The panel should still fit with 20px gutters; About/Contact body should not overflow.

- [ ] **Step 3: Verify tablet (768×1024)**

Resize to 768×1024. The hamburger menu should still display (it's hidden only above 760px wide). Open it and confirm the panel positioning still works at that viewport. About/Contact gutters should be 32px (`--pad` at ≤920px).

- [ ] **Step 4: Verify desktop (1280×800)**

Resize to 1280×800. Confirm:

1. Hamburger is hidden, desktop nav links visible.
2. Hovering "Notes" still shows the desktop hover dropdown correctly.
3. About section displays as a two-column grid with side gutters.
4. Contact section displays as a two-column grid with side gutters.
5. No visible regressions vs. before the change.

- [ ] **Step 5: TypeScript and lint check**

Run:

```bash
npx tsc --noEmit
npm run lint
```

Expected: no errors, no new warnings.

- [ ] **Step 6: Final commit (only if anything was tweaked during verification)**

If you spotted and fixed something during verification, commit it. Otherwise nothing to commit here — just mark the task complete.

---

## Notes for the implementer

- This project's `AGENTS.md` warns that the Next.js version in `node_modules/next/dist/docs/` may differ from your training data. We're only changing CSS and a leaf React component — no Next.js APIs touched — so that warning shouldn't bite, but if anything Next-specific surprises you, check the docs there before improvising.
- There is no test framework configured. Don't try to add Jest/Vitest just for this — verification is via the preview tools and TypeScript.
- Don't add comments to the code explaining "this fixes the mobile bug" or "moved from .mobile-menu" — those belong in the commit messages, not the source.
