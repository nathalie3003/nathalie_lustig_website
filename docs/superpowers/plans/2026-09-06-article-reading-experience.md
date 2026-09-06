# Article Reading Experience Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Make long notes easier to read by orienting the reader (progress rail, table of contents) and supporting them inside the prose (glossary, citations, pull quote).

**Architecture:** Five independent changes to the note detail page, sequenced so each phase ships something working. The glossary is the only piece with non-trivial pure logic, so it is built test-first against a new vitest harness. Everything else is React and CSS verified in the browser. Both article layouts (`.article-page` for standard notes, `.trade-page` for trade ideas) share the new components.

**Tech Stack:** Next.js 15 (App Router, RSC), React 19, Sanity v4 + `@portabletext/react`, plain CSS in `src/app/globals.css` (Tailwind is installed but this page does not use it), vitest for unit tests.

**Spec:** `docs/superpowers/specs/2026-09-06-article-reading-experience-design.md`

---

## Environment notes (read before starting)

These will waste an hour each if discovered the hard way.

1. **`next dev` and `next build` fail from this folder.** The repo path contains an
   apostrophe (`/Users/nathalielustig/Documents/Nathalie's Website`), which breaks
   Next's metadata-route loader on `src/app/icon.png` and
   `src/app/opengraph-image.tsx`. Neither affects Vercel. To run locally, mirror to
   an apostrophe-free path:

   ```bash
   SRC="/Users/nathalielustig/Documents/Nathalie's Website"; MIRROR=/tmp/tbp-mirror; mkdir -p "$MIRROR" && cd "$SRC" && git ls-files -z | rsync -a --files-from=- --from0 "$SRC/" "$MIRROR/" && cp "$SRC/.env.local" "$MIRROR/" && cp -R "$SRC/public" "$MIRROR/" && ln -sfn "$SRC/node_modules" "$MIRROR/node_modules"
   ```

   Then preview from `$MIRROR`. Re-run the rsync after each batch of edits.

2. **`npm run lint` is broken repo-wide** (`eslint.config.mjs` imports
   `eslint-config-next` subpaths without `.js`). Use `npx tsc --noEmit` as the
   gate instead.

3. **The browser pane's automation tab is hidden**, so `requestAnimationFrame` is
   paused there and scroll-triggered motion will not animate. Verify motion by
   forcing final-state classes via `javascript_tool`, or on a Vercel preview.
   Programmatic `window.scrollTo` does not fire scroll events in that tab either;
   dispatch `new Event("scroll")` manually when testing scroll listeners.

---

## File structure

**New**

| File | Responsibility |
| --- | --- |
| `vitest.config.ts` | Test runner config with the `@/` alias |
| `src/lib/glossary.ts` | Pure: match glossary terms in a Portable Text body and attach marks |
| `src/lib/glossary.test.ts` | Unit tests for the matcher |
| `src/lib/toc.test.ts` | Unit tests for the existing heading extractor |
| `src/components/ArticleShell.tsx` | Client boundary owning the article DOM ref the progress rail measures |
| `src/components/ArticleToc.tsx` | Both TOC presentations (desktop margin rail, collapsed line) |
| `src/components/GlossaryTerm.tsx` | The term button and its definition popover |
| `sanity/schemas/glossaryTerm.ts` | The glossary document type |
| `sanity/components/SourceSelectInput.tsx` | Studio dropdown listing the current note's sources |
| `scripts/migrate-sources.mjs` | One-time conversion of `sources` from strings to keyed objects |

**Modified**

| File | Change |
| --- | --- |
| `src/components/ReadingProgress.tsx` | Measure the article, not the document |
| `src/components/PortableText.tsx` | Register the `glossary` mark, `citation` mark, `pullQuote` block |
| `src/components/TradeIdeaArticle.tsx` | Wire `ArticleToc`, pass the article ref |
| `src/app/notes/[slug]/page.tsx` | Apply the glossary pass, wire `ArticleToc` |
| `src/lib/queries.ts` | `getGlossaryTerms`, `sources` type change, `disableGlossary` |
| `sanity/schemas/bondNote.ts` | `pullQuote` block, `citation` annotation, `disableGlossary`, `sources` shape |
| `sanity/schemas/index.ts` | Register `glossaryTerm` |
| `src/app/globals.css` | `--nav-h`, progress rail position, TOC, glossary, citation, pull quote |

**Two corrections to the spec, carried into this plan:**

- The desktop rail's breakpoint is **1320px**, not the 1240px first sketched
  during brainstorming. The content wrap is 900px, so the rail must clear 450px
  from centre, plus a 30px gap, plus its own 156px, plus a 24px minimum gutter:
  `50% - 636px >= 24px` means `width >= 1320px`. A 1440px MacBook gets the rail;
  a 1280px screen gets the collapsed line. The spec carries the corrected number.
- `globals.css:1039` already sets a **drop cap** on the first paragraph
  (`.ap-col > p:first-of-type::first-letter`). A glossary button wrapping the
  first word would fight it, so the matcher skips the first paragraph of the body
  entirely. Task 6 encodes this as a test.

---

## Phase 1: Test harness

### Task 1: Add vitest

**Files:**
- Create: `vitest.config.ts`
- Modify: `package.json`

- [ ] **Step 1: Install vitest**

```bash
npm install -D vitest@^3
```

- [ ] **Step 2: Create the config**

`vitest.config.ts`:

```ts
import { defineConfig } from "vitest/config";
import path from "node:path";

export default defineConfig({
  resolve: {
    alias: { "@": path.resolve(__dirname, "./src") },
  },
  test: {
    environment: "node",
    include: ["src/**/*.test.ts"],
  },
});
```

- [ ] **Step 3: Add the test script**

In `package.json`, add to `"scripts"` after `"lint"`:

```json
"test": "vitest run",
"test:watch": "vitest"
```

- [ ] **Step 4: Verify the runner starts**

Run: `npm test`
Expected: exits 0 with "No test files found" (there are none yet). If it errors on
config resolution, the alias path is wrong.

- [ ] **Step 5: Commit**

```bash
git add package.json package-lock.json vitest.config.ts
git commit -m "Add vitest for pure-logic unit tests"
```

---

## Phase 2: Reading progress rail

### Task 2: Introduce the `--nav-h` token

**Files:**
- Modify: `src/app/globals.css:20-60` (`:root`), `src/app/globals.css:178` (`.top-inner`)

The nav is `position: sticky` and the progress rail is `position: fixed`, so the
rail cannot inherit the nav's height. A shared token keeps them from drifting.
`.top` has a 3px top border and a 1px bottom border around a 66px inner, so the
bar is 70px tall.

- [ ] **Step 1: Add the tokens**

In `:root`, immediately after `--pad: 32px;`:

```css
    /* The sticky nav's height. .top-inner sets its min-height from this, and
       the fixed reading-progress rail positions itself against it, so the two
       cannot drift apart. --nav-h adds the 3px masthead rule and the 1px
       hairline that sit outside the inner box. */
    --nav-h-inner: 66px;
    --nav-h: calc(var(--nav-h-inner) + 4px);
```

- [ ] **Step 2: Point `.top-inner` at the token**

Replace `min-height: 66px;` in `.top-inner` with:

```css
    min-height: var(--nav-h-inner);
```

- [ ] **Step 3: Verify nothing moved**

Run `npx tsc --noEmit` (expected: clean), then load any page in the preview and
confirm the nav is still 70px tall:

```js
document.querySelector('.top').getBoundingClientRect().height
```

Expected: `70`

- [ ] **Step 4: Commit**

```bash
git add src/app/globals.css
git commit -m "Add a --nav-h token shared by the nav and the progress rail"
```

### Task 3: Reposition and retarget the progress rail

**Files:**
- Modify: `src/components/ReadingProgress.tsx`
- Modify: `src/app/globals.css:909-918` (`.reading-progress`)
- Modify: `src/app/notes/[slug]/page.tsx`, `src/components/TradeIdeaArticle.tsx`

Today the rail sits at `top: 0` (painting over the masthead rule) and measures
`document.documentElement.scrollHeight`, so replies and the keep-reading cards
count as unread article.

- [ ] **Step 1: Rewrite the component to measure a target element**

Replace the whole of `src/components/ReadingProgress.tsx`:

```tsx
"use client";

import { useEffect, useState, type RefObject } from "react";

// A 2px rail pinned to the bottom edge of the sticky nav, filling as the reader
// moves through the article. It measures the article element rather than the
// document, so replies and the keep-reading cards do not count as unread prose
// and the bar actually reaches full at the last line.
export function ReadingProgress({
  target,
}: {
  target: RefObject<HTMLElement | null>;
}) {
  const [pct, setPct] = useState(0);

  useEffect(() => {
    const update = () => {
      const el = target.current;
      if (!el) return;
      const navH = parseFloat(
        getComputedStyle(document.documentElement).getPropertyValue("--nav-h"),
      ) || 70;
      const top = el.getBoundingClientRect().top + window.scrollY;
      // Read from the article clearing the nav to its last line clearing the
      // bottom of the viewport.
      const span = el.offsetHeight - (window.innerHeight - navH);
      if (span <= 0) {
        setPct(100);
        return;
      }
      const travelled = window.scrollY + navH - top;
      setPct(Math.max(0, Math.min((travelled / span) * 100, 100)));
    };
    update();
    window.addEventListener("scroll", update, { passive: true });
    window.addEventListener("resize", update);
    return () => {
      window.removeEventListener("scroll", update);
      window.removeEventListener("resize", update);
    };
  }, [target]);

  return (
    <div
      className="reading-progress"
      style={{ transform: `scaleX(${pct / 100})` }}
      aria-hidden="true"
    />
  );
}
```

- [ ] **Step 2: Move the rail under the nav in CSS**

Replace the `.reading-progress` rule (currently at `globals.css:909`) with:

```css
  /* Sits on the nav's bottom hairline rather than at the top of the viewport,
     where it used to be mistaken for the masthead rule thickening. z-index 39
     keeps it under the nav (40) so the mobile menu popover always wins. */
  .reading-progress {
    position: fixed; top: var(--nav-h); left: 0; right: 0; z-index: 39;
    height: 2px; background: var(--accent);
    transform-origin: left center;
    /* Collapsed by default: the element is full width, so without this it
       paints as a complete bar until hydration sets the inline transform. */
    transform: scaleX(0);
    transition: transform 80ms linear; pointer-events: none;
  }
  @media (prefers-reduced-motion: reduce) {
    .reading-progress { transition: none; }
  }
```

- [ ] **Step 3: Give the standard layout a ref**

`src/app/notes/[slug]/page.tsx` is a server component, so a DOM ref cannot be
created there. Create `src/components/ArticleShell.tsx` as the client boundary
that owns it:

```tsx
"use client";

import { useRef } from "react";
import { ReadingProgress } from "./ReadingProgress";

// Owns the ref that the progress rail (and later the TOC) measure against.
// The note page is a server component, so this boundary is where the DOM
// reference has to be created.
export function ArticleShell({
  className,
  children,
}: {
  className: string;
  children: React.ReactNode;
}) {
  const ref = useRef<HTMLDivElement>(null);
  return (
    <div className={className}>
      <ReadingProgress target={ref} />
      <div ref={ref}>{children}</div>
    </div>
  );
}
```

- [ ] **Step 4: Use it in the standard layout**

In `src/app/notes/[slug]/page.tsx`, replace the import of `ReadingProgress` with
`ArticleShell`:

```tsx
import { ArticleShell } from "@/components/ArticleShell";
```

and replace

```tsx
      <div className="article-page">
        <ReadingProgress />

        <ArticleReveal resetKey={slug}>
```

with

```tsx
      <ArticleShell className="article-page">
        <ArticleReveal resetKey={slug}>
```

and the matching closing `</div>` after `</ArticleReveal>` with `</ArticleShell>`.

- [ ] **Step 5: Use it in the trade layout**

In `src/components/TradeIdeaArticle.tsx`, replace the `ReadingProgress` import
with `ArticleShell`, then replace

```tsx
    <div className="trade-page">
      <ReadingProgress />

      <ArticleReveal resetKey={resetKey}>
```

with

```tsx
    <ArticleShell className="trade-page">
      <ArticleReveal resetKey={resetKey}>
```

and the closing `</div>` with `</ArticleShell>`.

- [ ] **Step 6: Typecheck**

Run: `npx tsc --noEmit`
Expected: no output (clean).

- [ ] **Step 7: Verify in the browser**

Open a note in the preview. In the console:

```js
const r = document.querySelector('.reading-progress').getBoundingClientRect();
[r.top, r.height, getComputedStyle(document.querySelector('.reading-progress')).zIndex]
```

Expected: `[70, 2, "39"]`

Then scroll to the last paragraph of the body and check the bar is full:

```js
window.scrollTo(0, document.querySelector('.ap-col').getBoundingClientRect().bottom + window.scrollY - window.innerHeight);
window.dispatchEvent(new Event('scroll'));
getComputedStyle(document.querySelector('.reading-progress')).transform
```

Expected: a matrix whose first value is at or very near `1`, not `0.6`-ish as it
was before this change.

- [ ] **Step 8: Commit**

```bash
git add src/components/ReadingProgress.tsx src/components/ArticleShell.tsx src/components/TradeIdeaArticle.tsx src/app/notes/\[slug\]/page.tsx src/app/globals.css
git commit -m "Move the progress rail under the nav and measure the article"
```

---

## Phase 3: Table of contents

### Task 4: Test the existing heading extractor

`src/lib/toc.ts` is about to gain a second consumer, so pin its behaviour first.

**Files:**
- Create: `src/lib/toc.test.ts`

- [ ] **Step 1: Write the failing test**

```ts
import { describe, it, expect } from "vitest";
import { extractHeadings, headingId, blockText } from "./toc";

describe("headingId", () => {
  it("slugifies a heading", () => {
    expect(headingId("The Future Outlook")).toBe("the-future-outlook");
  });

  it("drops punctuation", () => {
    expect(headingId("Bearish for Bonds?")).toBe("bearish-for-bonds");
  });
});

describe("blockText", () => {
  it("joins child spans", () => {
    expect(blockText({ children: [{ text: "Term " }, { text: "premium" }] })).toBe(
      "Term premium",
    );
  });
});

describe("extractHeadings", () => {
  const body = [
    { _type: "block", style: "normal", children: [{ text: "Intro" }] },
    { _type: "block", style: "h2", children: [{ text: "Bearish for Bonds" }] },
    { _type: "block", style: "h3", children: [{ text: "A sub point" }] },
    { _type: "block", style: "h2", children: [{ text: "Bullish for Bonds" }] },
    { _type: "image" },
  ];

  it("returns h2 blocks only", () => {
    expect(extractHeadings(body)).toEqual([
      { id: "bearish-for-bonds", title: "Bearish for Bonds" },
      { id: "bullish-for-bonds", title: "Bullish for Bonds" },
    ]);
  });

  it("returns an empty list for a body with no headings", () => {
    expect(
      extractHeadings([
        { _type: "block", style: "normal", children: [{ text: "Just prose" }] },
      ]),
    ).toEqual([]);
  });
});
```

- [ ] **Step 2: Run the tests**

Run: `npx vitest run src/lib/toc.test.ts`
Expected: PASS, 5 tests. These characterise existing behaviour, so they should
pass immediately. If `extractHeadings` fails the h3 case, that is a real
discrepancy with the spec (h2 only) and must be reported, not "fixed" by
loosening the test.

- [ ] **Step 3: Commit**

```bash
git add src/lib/toc.test.ts
git commit -m "Pin the heading extractor's behaviour with tests"
```

### Task 5: Build ArticleToc

**Files:**
- Create: `src/components/ArticleToc.tsx`
- Modify: `src/app/globals.css`

One component, two presentations. Above 1320px it renders a sticky rail in the
left margin; below that, a collapsed line under the progress rail that expands on
tap. CSS decides which is visible, so there is no viewport listener and no
hydration mismatch.

- [ ] **Step 1: Create the component**

```tsx
"use client";

import { useEffect, useRef, useState } from "react";

type Item = { id: string; title: string };

// Both TOC presentations. Which one is visible is decided entirely in CSS at
// the 1320px breakpoint, so there is no viewport listener here and nothing that
// could differ between the server and client render.
export function ArticleToc({ items }: { items: Item[] }) {
  const [active, setActive] = useState(0);
  const [visible, setVisible] = useState(false);
  const [open, setOpen] = useState(false);
  const wrapRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const onScroll = () => {
      let current = 0;
      items.forEach((item, i) => {
        const el = document.getElementById(item.id);
        if (el && el.getBoundingClientRect().top < 160) current = i;
      });
      setActive(current);
      // Appear only once the reader is past the header, so the rail does not
      // compete with the title on first paint.
      setVisible(window.scrollY > 260);
    };
    window.addEventListener("scroll", onScroll, { passive: true });
    onScroll();
    return () => window.removeEventListener("scroll", onScroll);
  }, [items]);

  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") setOpen(false);
    };
    const onClick = (e: MouseEvent) => {
      if (!wrapRef.current?.contains(e.target as Node)) setOpen(false);
    };
    document.addEventListener("keydown", onKey);
    document.addEventListener("mousedown", onClick);
    return () => {
      document.removeEventListener("keydown", onKey);
      document.removeEventListener("mousedown", onClick);
    };
  }, [open]);

  if (items.length < 2) return null;

  const list = (
    <ul className="atoc-list">
      {items.map((item, i) => (
        <li key={item.id}>
          <a
            href={`#${item.id}`}
            className={i === active ? "active" : undefined}
            onClick={() => setOpen(false)}
          >
            {item.title}
          </a>
        </li>
      ))}
    </ul>
  );

  return (
    <>
      <nav
        className={`atoc-rail${visible ? " is-visible" : ""}`}
        aria-label="In this note"
      >
        <span className="atoc-label">In this note</span>
        {list}
      </nav>

      <div
        className={`atoc-bar${visible ? " is-visible" : ""}`}
        ref={wrapRef}
      >
        <button
          type="button"
          className="atoc-bar-btn"
          aria-expanded={open}
          onClick={() => setOpen((v) => !v)}
        >
          <span className="atoc-bar-label">In this note</span>
          <span className="atoc-bar-current">{items[active]?.title}</span>
          <svg width="11" height="11" viewBox="0 0 11 11" fill="none" aria-hidden="true">
            <path
              d="M2.5 4L5.5 7L8.5 4"
              stroke="currentColor"
              strokeWidth="1.4"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </svg>
        </button>
        {open && <div className="atoc-bar-panel">{list}</div>}
      </div>
    </>
  );
}
```

- [ ] **Step 2: Add the CSS**

Append to `src/app/globals.css` inside the same `@layer` block that holds
`.reading-progress` (immediately after that rule):

```css
  /* TABLE OF CONTENTS — one component, two presentations.
     Above 1320px the rail lives in the margin left of the 900px content wrap:
     it must clear 450px from centre, plus a 30px gap, plus its own 156px, plus
     a 24px gutter, so 50% - 636px >= 24px. Below that there is no margin to
     live in, and the collapsed bar takes over. That means most 1280px laptops
     get the bar, not the rail. */
  .atoc-rail { display: none; }
  .atoc-bar {
    position: fixed; top: calc(var(--nav-h) + 2px); left: 0; right: 0; z-index: 38;
    background: color-mix(in oklab, var(--nav-bg) 94%, transparent);
    backdrop-filter: blur(10px);
    border-bottom: 1px solid var(--rule);
    opacity: 0; visibility: hidden; transition: opacity 160ms ease, visibility 160ms;
  }
  .atoc-bar.is-visible { opacity: 1; visibility: visible; }
  .atoc-bar-btn {
    display: flex; align-items: center; gap: 10px;
    width: 100%; max-width: var(--col-wide); margin: 0 auto;
    padding: 9px var(--pad);
    background: none; border: 0; cursor: pointer; text-align: left;
  }
  .atoc-bar-label {
    flex: none;
    font-family: var(--font-mono), ui-monospace, monospace; font-size: 10.5px;
    letter-spacing: 0.14em; text-transform: uppercase; color: var(--ink-60);
  }
  .atoc-bar-current {
    flex: 1; min-width: 0; overflow: hidden; text-overflow: ellipsis; white-space: nowrap;
    font-family: var(--font-sans), system-ui, sans-serif; font-size: 12.5px; font-weight: 500;
    color: var(--ink);
  }
  .atoc-bar-btn svg { flex: none; color: var(--ink-60); }
  .atoc-bar-panel {
    max-width: var(--col-wide); margin: 0 auto;
    padding: 4px var(--pad) 14px;
  }
  .atoc-list { list-style: none; margin: 0; padding: 0; }
  .atoc-list li a {
    display: block; padding: 7px 0;
    font-family: var(--font-sans), system-ui, sans-serif; font-size: 12.5px; font-weight: 500;
    color: var(--ink-60); text-decoration: none; line-height: 1.35;
    border-bottom: 1px solid var(--rule);
    transition: color 100ms ease;
  }
  .atoc-list li:last-child a { border-bottom: 0; }
  .atoc-list li a:hover { color: var(--ink); }
  .atoc-list li a.active { color: var(--ink); }
  /* The active marker is a raspberry tick, not a coloured label: colouring the
     text would put the accent on running wayfinding rather than on one signal. */
  .atoc-list li a.active::before {
    content: ""; display: inline-block; vertical-align: middle;
    width: 12px; height: 2px; margin-right: 8px; background: var(--accent);
  }

  @media (min-width: 1320px) {
    .atoc-bar { display: none; }
    .atoc-rail {
      display: block;
      position: fixed; top: calc(var(--nav-h) + 56px);
      left: calc(50% - 636px); width: 156px; z-index: 30;
      opacity: 0; transition: opacity 220ms ease;
      pointer-events: none;
    }
    .atoc-rail.is-visible { opacity: 1; pointer-events: auto; }
    .atoc-label {
      display: block; margin-bottom: 10px;
      font-family: var(--font-mono), ui-monospace, monospace; font-size: 10.5px;
      letter-spacing: 0.14em; text-transform: uppercase; color: var(--ink-60);
    }
  }

  @media (prefers-reduced-motion: reduce) {
    .atoc-rail, .atoc-bar { transition: none; }
  }
```

- [ ] **Step 3: Typecheck**

Run: `npx tsc --noEmit`
Expected: clean.

- [ ] **Step 4: Commit**

```bash
git add src/components/ArticleToc.tsx src/app/globals.css
git commit -m "Add the article table of contents component"
```

### Task 6: Wire the TOC into both layouts

**Files:**
- Modify: `src/app/notes/[slug]/page.tsx`
- Modify: `src/components/TradeIdeaArticle.tsx`
- Modify: `src/app/globals.css`

Standard notes get the rail and the bar. Trade ideas keep their existing sidebar
card TOC on desktop, and gain the collapsed bar on mobile where that sidebar
currently drops below the article and helps nobody.

- [ ] **Step 1: Add the TOC to the standard layout**

In `src/app/notes/[slug]/page.tsx`, add the imports:

```tsx
import { ArticleToc } from "@/components/ArticleToc";
import { extractHeadings } from "@/lib/toc";
```

Inside `NotePage`, after `const minutes = readTime(note.body);`:

```tsx
  const headings = extractHeadings(note.body);
```

Then, inside the `<ArticleShell className="article-page">`, immediately before
`<ArticleReveal resetKey={slug}>`:

```tsx
        <ArticleToc items={headings} />
```

- [ ] **Step 2: Add the collapsed bar to the trade layout**

In `src/components/TradeIdeaArticle.tsx`, add the import:

```tsx
import { ArticleToc } from "@/components/ArticleToc";
```

Inside `<ArticleShell className="trade-page">`, immediately before
`<ArticleReveal resetKey={resetKey}>`:

```tsx
      <ArticleToc items={headings} />
```

(`headings` is already computed on line 39 of that file.)

- [ ] **Step 3: Stop the two TOCs appearing together**

The trade sidebar card and the new rail would both show on a wide screen, and the
sidebar TOC and the collapsed bar would both show on mobile. Add to
`src/app/globals.css`:

```css
  /* Trade ideas keep the sidebar card on desktop, so suppress the margin rail
     there; below the sidebar's own breakpoint the card TOC drops to the bottom
     of the page, so hide it and let the collapsed bar do the job instead. */
  .trade-page .atoc-rail { display: none; }
  @media (max-width: 980px) {
    .sidebar .toc { display: none; }
  }
  @media (min-width: 981px) {
    .trade-page .atoc-bar { display: none; }
  }
```

- [ ] **Step 4: Typecheck**

Run: `npx tsc --noEmit`
Expected: clean.

- [ ] **Step 5: Verify on a note that has headings**

Use `/notes/the-stem-beneath-the-flower` (3 headings). At 1440px wide, after
scrolling past the header:

```js
window.scrollTo(0, 600); window.dispatchEvent(new Event('scroll'));
const rail = document.querySelector('.atoc-rail');
const r = rail.getBoundingClientRect();
[getComputedStyle(rail).display, r.left, r.width, rail.classList.contains('is-visible')]
```

Expected: `["block", 84, 156, true]` at 1440px (`720 - 636 = 84`). The left value
must never be below 24.

Then resize to 1280 and confirm the swap:

```js
[getComputedStyle(document.querySelector('.atoc-rail')).display,
 getComputedStyle(document.querySelector('.atoc-bar')).display]
```

Expected: `["none", "block"]`

Also check a note with no headings (`/notes/the-price-of-opacity-in-private-credit`)
renders neither: `document.querySelector('.atoc-rail')` should be `null`.

- [ ] **Step 6: Commit**

```bash
git add src/app/notes/\[slug\]/page.tsx src/components/TradeIdeaArticle.tsx src/app/globals.css
git commit -m "Wire the table of contents into both article layouts"
```

---

## Phase 4: Glossary

### Task 7: The glossaryTerm schema

**Files:**
- Create: `sanity/schemas/glossaryTerm.ts`
- Modify: `sanity/schemas/index.ts`, `sanity/schemas/bondNote.ts`

- [ ] **Step 1: Create the document type**

```ts
import { defineType, defineField } from "sanity";

export const glossaryTerm = defineType({
  name: "glossaryTerm",
  title: "Glossary Term",
  type: "document",
  fields: [
    defineField({
      name: "term",
      type: "string",
      description: "The canonical form, e.g. 'term premium'.",
      validation: (r) => r.required(),
    }),
    defineField({
      name: "aliases",
      type: "array",
      of: [{ type: "string" }],
      description:
        "Other forms to match: plurals, abbreviations, alternate spellings. Matching is whole-word, so 'steepener' will not match 'steepeners' unless you add it here.",
    }),
    defineField({
      name: "definition",
      type: "text",
      rows: 3,
      description: "Two sentences at most. This shows in a small popover.",
      validation: (r) => r.required().max(280),
    }),
    defineField({
      name: "moreHref",
      title: "Read more link",
      type: "url",
      description: "Optional. Shown as a link at the foot of the popover.",
    }),
  ],
  preview: { select: { title: "term", subtitle: "definition" } },
});
```

- [ ] **Step 2: Register it**

In `sanity/schemas/index.ts`, import `glossaryTerm` alongside the existing
schemas and add it to the exported array, following the file's existing pattern.

- [ ] **Step 3: Add the per-note opt-out**

In `sanity/schemas/bondNote.ts`, add after the `sources` field:

```ts
    defineField({
      name: "disableGlossary",
      title: "Disable glossary highlighting",
      type: "boolean",
      initialValue: false,
      description:
        "Switch off automatic term definitions for this note, for pieces written for readers who already know the words.",
    }),
```

- [ ] **Step 4: Verify the Studio loads**

Open `/studio` in the preview. Expected: "Glossary Term" appears in the document
type list, and a Bond Note shows the new "Disable glossary highlighting" toggle.

- [ ] **Step 5: Commit**

```bash
git add sanity/schemas/glossaryTerm.ts sanity/schemas/index.ts sanity/schemas/bondNote.ts
git commit -m "Add the glossaryTerm document type and a per-note opt-out"
```

### Task 8: The matcher, test-first

**Files:**
- Create: `src/lib/glossary.test.ts`, `src/lib/glossary.ts`

This is the piece with real logic, so it is built test-first. The rules are the
spec's, plus the drop-cap exclusion discovered in the CSS.

- [ ] **Step 1: Write the failing tests**

`src/lib/glossary.test.ts`:

```ts
import { describe, it, expect } from "vitest";
import { applyGlossary, type GlossaryEntry } from "./glossary";

const entries: GlossaryEntry[] = [
  { term: "term premium", definition: "The extra yield for holding duration." },
  { term: "premium", definition: "An amount above par." },
  { term: "steepener", aliases: ["steepeners"], definition: "A curve trade." },
];

// The first block is always skipped (drop cap), so tests put a throwaway
// paragraph first and assert against later blocks.
const lead = { _type: "block", _key: "lead", style: "normal", children: [{ _type: "span", _key: "l0", text: "Opening line.", marks: [] }] };

function para(key: string, text: string, marks: string[] = []) {
  return {
    _type: "block", _key: key, style: "normal",
    children: [{ _type: "span", _key: `${key}s`, text, marks }],
  };
}

function marksOf(body: unknown[], blockKey: string) {
  const b = (body as { _key: string; children: { text: string; marks: string[] }[] }[])
    .find((x) => x._key === blockKey)!;
  return b.children.map((c) => [c.text, c.marks] as const);
}

describe("applyGlossary", () => {
  it("marks a term in a normal paragraph", () => {
    const out = applyGlossary([lead, para("a", "The steepener worked.")], entries);
    expect(marksOf(out, "a")).toEqual([
      ["The ", []],
      ["steepener", ["glossary-steepener"]],
      [" worked.", []],
    ]);
  });

  it("adds a markDef carrying the definition", () => {
    const out = applyGlossary([lead, para("a", "A steepener.")], entries) as {
      _key: string; markDefs?: { _key: string; _type: string; definition: string }[];
    }[];
    const block = out.find((b) => b._key === "a")!;
    expect(block.markDefs).toEqual([
      {
        _type: "glossary",
        _key: "glossary-steepener",
        term: "steepener",
        definition: "A curve trade.",
        moreHref: undefined,
      },
    ]);
  });

  it("marks only the first occurrence in the whole body", () => {
    const out = applyGlossary(
      [lead, para("a", "A steepener."), para("b", "Another steepener.")],
      entries,
    );
    expect(marksOf(out, "b")).toEqual([["Another steepener.", []]]);
  });

  it("skips the first paragraph so it cannot fight the drop cap", () => {
    const out = applyGlossary([para("a", "A steepener opens the note.")], entries);
    expect(marksOf(out, "a")).toEqual([["A steepener opens the note.", []]]);
  });

  it("skips headings, quotes and section labels", () => {
    const body = [
      lead,
      { _type: "block", _key: "h", style: "h2", children: [{ _type: "span", _key: "hs", text: "A steepener", marks: [] }] },
      { _type: "block", _key: "q", style: "blockquote", children: [{ _type: "span", _key: "qs", text: "A steepener", marks: [] }] },
      { _type: "block", _key: "sl", style: "sectionLabel", children: [{ _type: "span", _key: "ss", text: "A steepener", marks: [] }] },
    ];
    const out = applyGlossary(body, entries);
    expect(marksOf(out, "h")).toEqual([["A steepener", []]]);
    expect(marksOf(out, "q")).toEqual([["A steepener", []]]);
    expect(marksOf(out, "sl")).toEqual([["A steepener", []]]);
  });

  it("skips spans that already carry an annotation mark", () => {
    const body = [
      lead,
      {
        _type: "block", _key: "a", style: "normal",
        markDefs: [{ _type: "link", _key: "lnk", href: "https://example.com" }],
        children: [{ _type: "span", _key: "as", text: "A steepener", marks: ["lnk"] }],
      },
    ];
    expect(marksOf(applyGlossary(body, entries), "a")).toEqual([
      ["A steepener", ["lnk"]],
    ]);
  });

  it("keeps decorator marks on the matched span", () => {
    const out = applyGlossary([lead, para("a", "A steepener", ["strong"])], entries);
    expect(marksOf(out, "a")).toEqual([
      ["A ", ["strong"]],
      ["steepener", ["strong", "glossary-steepener"]],
    ]);
  });

  it("prefers the longest match", () => {
    const out = applyGlossary([lead, para("a", "The term premium rose.")], entries);
    expect(marksOf(out, "a")).toEqual([
      ["The ", []],
      ["term premium", ["glossary-term-premium"]],
      [" rose.", []],
    ]);
  });

  it("matches case-insensitively and preserves the original casing", () => {
    const out = applyGlossary([lead, para("a", "Steepener trades.")], entries);
    expect(marksOf(out, "a")).toEqual([
      ["Steepener", ["glossary-steepener"]],
      [" trades.", []],
    ]);
  });

  it("matches an alias", () => {
    const out = applyGlossary([lead, para("a", "Two steepeners.")], entries);
    expect(marksOf(out, "a")).toEqual([
      ["Two ", []],
      ["steepeners", ["glossary-steepener"]],
      [".", []],
    ]);
  });

  it("requires whole words", () => {
    const out = applyGlossary([lead, para("a", "Presteepenered nonsense.")], entries);
    expect(marksOf(out, "a")).toEqual([["Presteepenered nonsense.", []]]);
  });

  it("returns the body untouched when there are no entries", () => {
    const body = [lead, para("a", "A steepener.")];
    expect(applyGlossary(body, [])).toEqual(body);
  });

  it("does not mutate the input", () => {
    const body = [lead, para("a", "A steepener.")];
    const snapshot = JSON.parse(JSON.stringify(body));
    applyGlossary(body, entries);
    expect(body).toEqual(snapshot);
  });
});
```

- [ ] **Step 2: Run the tests to confirm they fail**

Run: `npx vitest run src/lib/glossary.test.ts`
Expected: FAIL, "Failed to resolve import ./glossary".

- [ ] **Step 3: Write the implementation**

`src/lib/glossary.ts`:

```ts
export type GlossaryEntry = {
  term: string;
  aliases?: string[];
  definition: string;
  moreHref?: string;
};

type Span = { _type: string; _key: string; text: string; marks: string[] };
type MarkDef = { _type: string; _key: string; [k: string]: unknown };
type Block = {
  _type: string;
  _key: string;
  style?: string;
  children?: Span[];
  markDefs?: MarkDef[];
};

const escapeRe = (s: string) => s.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");

/** Deterministic so the server and client renders agree. */
export function glossaryMarkKey(term: string): string {
  return `glossary-${term.toLowerCase().replace(/[^\w]+/g, "-").replace(/^-|-$/g, "")}`;
}

/**
 * Wrap the first occurrence of each glossary term in the body with a `glossary`
 * mark, and attach the definition as a markDef on the block that carries it.
 *
 * The rules exist to stop the feature becoming noise:
 *  - first occurrence per article only, never every mention
 *  - normal paragraphs and list items only, never headings, quotes or labels
 *  - never inside a span that already carries an annotation (a link, a citation)
 *  - never in the first paragraph, which carries a CSS drop cap that a button
 *    element would fight (see .ap-col > p:first-of-type::first-letter)
 *  - longest match wins, so "term premium" beats "premium"
 */
export function applyGlossary(
  body: unknown[],
  entries: GlossaryEntry[],
): unknown[] {
  if (!entries.length || !body?.length) return body;

  const byPhrase = new Map<string, GlossaryEntry>();
  for (const e of entries) {
    for (const phrase of [e.term, ...(e.aliases ?? [])]) {
      if (phrase) byPhrase.set(phrase.toLowerCase(), e);
    }
  }
  const phrases = [...byPhrase.keys()].sort((a, b) => b.length - a.length);
  const re = new RegExp(`\\b(${phrases.map(escapeRe).join("|")})\\b`, "gi");

  const used = new Set<string>();
  let seenFirstParagraph = false;

  return (body as Block[]).map((block) => {
    if (block?._type !== "block" || block.style !== "normal") return block;
    if (!seenFirstParagraph) {
      seenFirstParagraph = true;
      return block;
    }

    const annotationKeys = new Set((block.markDefs ?? []).map((d) => d._key));
    const newDefs: MarkDef[] = [];
    let changed = false;

    const children = (block.children ?? []).flatMap((span): Span[] => {
      if (span._type !== "span" || span.marks?.some((m) => annotationKeys.has(m))) {
        return [span];
      }

      const out: Span[] = [];
      let last = 0;
      let part = 0;
      re.lastIndex = 0;
      for (const match of span.text.matchAll(re)) {
        const entry = byPhrase.get(match[0].toLowerCase());
        if (!entry || used.has(entry.term)) continue;
        used.add(entry.term);
        changed = true;

        const key = glossaryMarkKey(entry.term);
        newDefs.push({
          _type: "glossary",
          _key: key,
          term: entry.term,
          definition: entry.definition,
          moreHref: entry.moreHref,
        });

        const at = match.index!;
        if (at > last) {
          out.push({ ...span, _key: `${span._key}-${part++}`, text: span.text.slice(last, at) });
        }
        out.push({
          ...span,
          _key: `${span._key}-${part++}`,
          text: match[0],
          marks: [...(span.marks ?? []), key],
        });
        last = at + match[0].length;
      }

      if (!out.length) return [span];
      if (last < span.text.length) {
        out.push({ ...span, _key: `${span._key}-${part++}`, text: span.text.slice(last) });
      }
      return out;
    });

    if (!changed) return block;
    return {
      ...block,
      children,
      markDefs: [...(block.markDefs ?? []), ...newDefs],
    };
  });
}
```

- [ ] **Step 4: Run the tests**

Run: `npx vitest run src/lib/glossary.test.ts`
Expected: PASS, 13 tests.

- [ ] **Step 5: Commit**

```bash
git add src/lib/glossary.ts src/lib/glossary.test.ts
git commit -m "Add the glossary term matcher"
```

### Task 9: Fetch the glossary and apply it

**Files:**
- Modify: `src/lib/queries.ts`, `src/app/notes/[slug]/page.tsx`

- [ ] **Step 1: Add the query and types**

In `src/lib/queries.ts`, add the import at the top:

```ts
import type { GlossaryEntry } from "./glossary";
```

Add `disableGlossary?: boolean;` to the `BondNote` type (beside `sources`), then
add at the end of the file:

```ts
export async function getGlossaryTerms(): Promise<GlossaryEntry[]> {
  return sanityClient.fetch(
    `*[_type == "glossaryTerm"]{ term, aliases, definition, moreHref }`,
    {},
    { next: { revalidate: 60, tags: ["glossaryTerm"] } },
  );
}
```

Then add `disableGlossary` to the field list in `getNoteBySlug`'s projection,
following the existing pattern in that function.

- [ ] **Step 2: Apply the pass on the page**

In `src/app/notes/[slug]/page.tsx`, add the imports:

```tsx
import { getGlossaryTerms } from "@/lib/queries";
import { applyGlossary } from "@/lib/glossary";
```

(fold `getGlossaryTerms` into the existing `@/lib/queries` import rather than
adding a second one.)

Change the parallel fetch to include the glossary, and derive the body once:

```tsx
  const [{ prev, next }, replies, glossary] = await Promise.all([
    getAdjacentNotes(slug),
    getReplies(note._id),
    getGlossaryTerms(),
  ]);

  const body = note.disableGlossary
    ? note.body
    : applyGlossary(note.body, glossary);
```

Then pass `body` rather than `note.body` to `<PortableText />` in the standard
layout, and give the trade layout the glossed body too by replacing its element
with:

```tsx
      <TradeIdeaArticle
        note={{ ...note, body }}
        dateLabel={formatDateLong(note.publishedAt)}
        readLabel={`${minutes} read`}
        resetKey={slug}
      />
```

- [ ] **Step 3: Typecheck**

Run: `npx tsc --noEmit`
Expected: clean.

- [ ] **Step 4: Commit**

```bash
git add src/lib/queries.ts src/app/notes/\[slug\]/page.tsx
git commit -m "Fetch glossary terms and apply the matcher to note bodies"
```

### Task 10: The term popover

**Files:**
- Create: `src/components/GlossaryTerm.tsx`
- Modify: `src/components/PortableText.tsx`, `src/app/globals.css`

- [ ] **Step 1: Create the component**

```tsx
"use client";

import { useEffect, useId, useRef, useState } from "react";

// A glossed term. The word itself carries no colour: colouring every matched
// term would scatter the accent through body copy and cost it its meaning, so
// the affordance is a dotted underline and the raspberry lives in the popover.
export function GlossaryTerm({
  term,
  definition,
  moreHref,
  children,
}: {
  term: string;
  definition: string;
  moreHref?: string;
  children: React.ReactNode;
}) {
  const [open, setOpen] = useState(false);
  const id = useId();
  const wrapRef = useRef<HTMLSpanElement>(null);
  const timer = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") setOpen(false);
    };
    const onDown = (e: MouseEvent) => {
      if (!wrapRef.current?.contains(e.target as Node)) setOpen(false);
    };
    document.addEventListener("keydown", onKey);
    document.addEventListener("mousedown", onDown);
    return () => {
      document.removeEventListener("keydown", onKey);
      document.removeEventListener("mousedown", onDown);
    };
  }, [open]);

  useEffect(() => () => { if (timer.current) clearTimeout(timer.current); }, []);

  const hoverOpen = () => {
    if (!window.matchMedia("(hover: hover)").matches) return;
    timer.current = setTimeout(() => setOpen(true), 120);
  };
  const hoverClose = () => {
    if (timer.current) clearTimeout(timer.current);
    if (!window.matchMedia("(hover: hover)").matches) return;
    setOpen(false);
  };

  return (
    <span className="gloss" ref={wrapRef}>
      <button
        type="button"
        className="gloss-term"
        aria-expanded={open}
        aria-describedby={open ? id : undefined}
        onClick={() => setOpen((v) => !v)}
        onFocus={() => setOpen(true)}
        onMouseEnter={hoverOpen}
        onMouseLeave={hoverClose}
      >
        {children}
      </button>
      {open && (
        <span className="gloss-pop" id={id} role="tooltip">
          <span className="gloss-pop-term">{term}</span>
          <span className="gloss-pop-def">{definition}</span>
          {moreHref && (
            <a className="gloss-pop-more" href={moreHref} target="_blank" rel="noopener noreferrer">
              Read more
            </a>
          )}
        </span>
      )}
    </span>
  );
}
```

- [ ] **Step 2: Register the mark**

In `src/components/PortableText.tsx`, add the import:

```tsx
import { GlossaryTerm } from "@/components/GlossaryTerm";
```

and add to the `marks` object, after `link`:

```tsx
    glossary: ({ children, value }) => (
      <GlossaryTerm
        term={value.term}
        definition={value.definition}
        moreHref={value.moreHref}
      >
        {children}
      </GlossaryTerm>
    ),
```

- [ ] **Step 3: Add the CSS**

Append to `src/app/globals.css`, after the sources rules:

```css
  /* GLOSSARY — the term stays ink with a dotted underline; the accent appears
     only inside the popover, so the One Working Color Rule survives having a
     definable term every few paragraphs. */
  .gloss { position: relative; }
  .gloss-term {
    font: inherit; color: inherit; background: none; border: 0; padding: 0;
    cursor: help;
    text-decoration: underline dotted var(--rule-strong);
    text-underline-offset: 4px; text-decoration-thickness: 1.5px;
  }
  .gloss-term:hover { text-decoration-color: var(--accent); }
  .gloss-pop {
    position: absolute; bottom: calc(100% + 10px); left: 0; z-index: 60;
    display: block; width: max-content; max-width: min(300px, calc(100vw - 2 * var(--pad)));
    background: var(--surface); border: 1px solid var(--rule);
    border-radius: var(--radius-card); padding: 14px 16px;
    box-shadow: 0 18px 50px rgba(25, 19, 22, 0.16);
    text-align: left;
  }
  .gloss-pop-term {
    display: block; margin-bottom: 6px;
    font-family: var(--font-mono), ui-monospace, monospace; font-size: 10.5px;
    letter-spacing: 0.14em; text-transform: uppercase; color: var(--accent);
  }
  .gloss-pop-def {
    display: block;
    font-family: var(--font-serif), Georgia, serif; font-size: 15.5px;
    line-height: 1.55; color: var(--ink-72);
  }
  .gloss-pop-more {
    display: inline-block; margin-top: 8px;
    font-family: var(--font-sans), system-ui, sans-serif; font-size: 12px;
    color: var(--accent);
  }
  /* Near the right edge the popover would overflow the column, so flip it. */
  .ap-col .gloss:nth-last-child(-n+2) .gloss-pop,
  .article-body .gloss:nth-last-child(-n+2) .gloss-pop { left: auto; right: 0; }
```

- [ ] **Step 4: Typecheck**

Run: `npx tsc --noEmit`
Expected: clean.

- [ ] **Step 5: Verify with a real term**

Create one `glossaryTerm` in the Studio (term "term premium", definition "The
extra yield investors demand for holding a longer-dated bond rather than rolling
short ones."). Then load a note that uses the phrase and check:

```js
const t = document.querySelector('.gloss-term');
[t.tagName, getComputedStyle(t).textDecorationStyle, t.getAttribute('aria-expanded')]
```

Expected: `["BUTTON", "dotted", "false"]`

Click it and confirm `document.querySelector('.gloss-pop')` exists and that
`t.getAttribute('aria-describedby')` matches its `id`. Press Escape and confirm
the popover is removed. Tab to the term and confirm the focus ring appears
(`DESIGN.md`'s unlayered focus rule should apply automatically since it is a
`<button>`).

- [ ] **Step 6: Commit**

```bash
git add src/components/GlossaryTerm.tsx src/components/PortableText.tsx src/app/globals.css
git commit -m "Render glossary terms with a hover and keyboard definition popover"
```

---

## Phase 5: Citations

### Task 11: Migrate sources to keyed objects

**Files:**
- Create: `scripts/migrate-sources.mjs`
- Modify: `sanity/schemas/bondNote.ts`, `src/lib/queries.ts`

An array of plain strings has no `_key`, so a citation marker has nothing stable
to point at: reordering sources would silently repoint every marker. The stored
shape changes; the authoring experience does not, because the object has exactly
one text field.

- [ ] **Step 1: Change the schema**

In `sanity/schemas/bondNote.ts`, replace the `sources` field with:

```ts
    defineField({
      name: "sources",
      title: "Sources",
      type: "array",
      description:
        "Optional citation list shown at the end of the article. Cite one from the body text with the Citation annotation.",
      of: [
        {
          type: "object",
          name: "source",
          fields: [{ name: "text", type: "text", rows: 2, title: "Source" }],
          preview: { select: { title: "text" } },
        },
      ],
    }),
```

- [ ] **Step 2: Update the type**

In `src/lib/queries.ts`, change `sources?: string[];` on `BondNote` to:

```ts
    sources?: { _key: string; text: string }[];
```

- [ ] **Step 3: Write the migration script**

`scripts/migrate-sources.mjs`, following the pattern of the existing scripts in
that folder:

```js
// One-time: convert bondNote.sources from an array of strings to an array of
// { _key, text } objects, so citation markers in the body can reference a
// source that survives reordering. Idempotent: entries that are already
// objects are left alone.
import { createClient } from "@sanity/client";
import { readFileSync } from "node:fs";

const env = Object.fromEntries(
  readFileSync(new URL("../.env.local", import.meta.url), "utf8")
    .split("\n")
    .filter((l) => l.includes("="))
    .map((l) => [l.slice(0, l.indexOf("=")).trim(), l.slice(l.indexOf("=") + 1).trim()]),
);

const client = createClient({
  projectId: env.NEXT_PUBLIC_SANITY_PROJECT_ID,
  dataset: env.NEXT_PUBLIC_SANITY_DATASET,
  apiVersion: env.NEXT_PUBLIC_SANITY_API_VERSION,
  token: env.SANITY_API_WRITE_TOKEN,
  useCdn: false,
});

const key = () => Math.random().toString(36).slice(2, 12);

const notes = await client.fetch(
  `*[_type == "bondNote" && defined(sources)]{ _id, title, sources }`,
);

let changed = 0;
for (const note of notes) {
  if (!note.sources.some((s) => typeof s === "string")) continue;
  const sources = note.sources.map((s) =>
    typeof s === "string" ? { _type: "source", _key: key(), text: s } : s,
  );
  await client.patch(note._id).set({ sources }).commit();
  changed++;
  console.log(`migrated ${note.title} (${sources.length} sources)`);
}
console.log(`done: ${changed} of ${notes.length} notes changed`);
```

- [ ] **Step 4: Dry-run the query before writing**

Confirm what will change without patching anything:

```bash
curl -sG "https://msoznebi.apicdn.sanity.io/v2024-10-01/data/query/production" --data-urlencode 'query=*[_type=="bondNote" && defined(sources)]{title, sources}'
```

Expected: JSON showing each note's sources as plain strings. Count how many notes
have at least one string entry; the script should report exactly that many
migrated.

- [ ] **Step 5: Run the migration**

Requires `SANITY_API_WRITE_TOKEN` in `.env.local`. If it is absent, stop and ask
for one rather than inventing a workaround.

```bash
node scripts/migrate-sources.mjs
```

Expected: one "migrated" line per note that had string sources, then a summary.
Re-run it once and confirm it reports `done: 0 of N notes changed`, proving
idempotency.

- [ ] **Step 6: Verify the site still renders sources**

Load a note with sources. The list at the foot should look exactly as it did
before. If it renders `[object Object]`, the render in Task 12 has not landed
yet, which is expected at this point; do not patch around it here.

- [ ] **Step 7: Commit**

```bash
git add scripts/migrate-sources.mjs sanity/schemas/bondNote.ts src/lib/queries.ts
git commit -m "Give each source a stable key so citations can reference it"
```

### Task 12: The citation annotation and markers

**Files:**
- Create: `sanity/components/SourceSelectInput.tsx`
- Modify: `sanity/schemas/bondNote.ts`, `src/components/PortableText.tsx`, `src/app/notes/[slug]/page.tsx`, `src/components/TradeIdeaArticle.tsx`, `src/app/globals.css`

- [ ] **Step 1: Build the Studio input**

Picking a source by key is unusable, so the annotation gets a dropdown listing
the note's own sources.

```tsx
import { useFormValue, set, unset, type StringInputProps } from "sanity";
import { Select } from "@sanity/ui";

type Source = { _key: string; text?: string };

// The citation annotation stores a source's _key. Nobody can type a key, so the
// field renders as a dropdown of the sources on the note being edited.
export function SourceSelectInput(props: StringInputProps) {
  const sources = (useFormValue(["sources"]) as Source[] | undefined) ?? [];
  const { value, onChange } = props;

  return (
    <Select
      value={value ?? ""}
      onChange={(e) => {
        const next = e.currentTarget.value;
        onChange(next ? set(next) : unset());
      }}
    >
      <option value="">
        {sources.length ? "Choose a source…" : "Add sources to this note first"}
      </option>
      {sources.map((s, i) => (
        <option key={s._key} value={s._key}>
          {i + 1}. {(s.text ?? "").slice(0, 70)}
        </option>
      ))}
    </Select>
  );
}
```

- [ ] **Step 2: Add the annotation**

In `sanity/schemas/bondNote.ts`, add the import at the top:

```ts
import { SourceSelectInput } from "../components/SourceSelectInput";
```

and add to the block's `marks.annotations` array, after `link`:

```ts
              {
                name: "citation",
                type: "object",
                title: "Citation",
                fields: [
                  {
                    name: "sourceKey",
                    type: "string",
                    title: "Source",
                    components: { input: SourceSelectInput },
                  },
                ],
              },
```

- [ ] **Step 3: Render the marker**

`PortableText` needs the note's sources to turn a key into a number, so the
module-level `components` constant becomes a factory that closes over them.
Replace the whole of `src/components/PortableText.tsx`:

```tsx
import { PortableText as PT, type PortableTextComponents } from "@portabletext/react";
import Image from "next/image";
import { urlFor } from "@/lib/sanity.client";
import { blockText, headingId } from "@/lib/toc";
import { GlossaryTerm } from "@/components/GlossaryTerm";

type Source = { _key: string; text: string };

// A factory rather than a constant because the citation mark has to turn a
// source key into the number the reader sees, which means it needs the note's
// own source list.
function buildComponents(sources: Source[]): PortableTextComponents {
  const indexOf = (key: string) => sources.findIndex((s) => s._key === key) + 1;

  return {
    types: {
      execSummary: ({ value }) => (
        <div className="exec-summary">
          <span className="exec-summary-label">Executive Summary</span>
          <p>{value.text}</p>
        </div>
      ),
      callout: ({ value }) => (
        <div className="callout">
          <span className="callout-label">{value.label ?? "Key Insight"}</span>
          <p>{value.text}</p>
        </div>
      ),
      annotation: ({ value }) => (
        <div className="annotation">
          <span className="annotation-label">{value.label ?? "Note"}</span>
          <p>{value.text}</p>
        </div>
      ),
      dataStrip: ({ value }) => (
        <div className="data-strip">
          {(value.items ?? []).map(
            (item: { value?: string; label?: string }, i: number) => (
              <div className="ds-item" key={i}>
                <div className="ds-val">{item.value}</div>
                <div className="ds-label">{item.label}</div>
              </div>
            ),
          )}
        </div>
      ),
      image: ({ value }) => {
        const url = urlFor(value).width(1600).url();
        return (
          <figure className="read-figure">
            <Image src={url} alt={value.alt ?? ""} width={1600} height={900} />
            {value.caption && (
              <figcaption className="read-figure-cap">{value.caption}</figcaption>
            )}
          </figure>
        );
      },
    },
    block: {
      normal: ({ children }) => <p>{children}</p>,
      h2: ({ children, value }) => (
        <h2 id={headingId(blockText(value as { children?: { text?: string }[] }))}>
          {children}
        </h2>
      ),
      h3: ({ children, value }) => (
        <h3 id={headingId(blockText(value as { children?: { text?: string }[] }))}>
          {children}
        </h3>
      ),
      sectionLabel: ({ children }) => <p className="section-label">{children}</p>,
      blockquote: ({ children }) => <blockquote>{children}</blockquote>,
    },
    marks: {
      link: ({ children, value }) => (
        <a href={value.href} target="_blank" rel="noopener noreferrer">
          {children}
        </a>
      ),
      glossary: ({ children, value }) => (
        <GlossaryTerm
          term={value.term}
          definition={value.definition}
          moreHref={value.moreHref}
        >
          {children}
        </GlossaryTerm>
      ),
      citation: ({ children, value }) => {
        const n = indexOf(value.sourceKey);
        // A citation pointing at a source that has since been deleted renders
        // as plain text rather than a dead marker.
        if (n < 1) return <>{children}</>;
        return (
          <>
            {children}
            <a
              className="cite"
              href={`#source-${value.sourceKey}`}
              title={sources[n - 1]?.text}
            >
              {n}
            </a>
          </>
        );
      },
    },
  };
}

export function PortableText({
  value,
  sources = [],
}: {
  value: unknown[];
  sources?: Source[];
}) {
  return <PT value={value as never} components={buildComponents(sources)} />;
}
```

- [ ] **Step 4: Pass sources in and add anchors**

In `src/app/notes/[slug]/page.tsx`, change the render to
`<PortableText value={body} sources={note.sources ?? []} />`, and change the
sources list to carry anchors and render `s.text`:

```tsx
                  <ol>
                    {note.sources.map((s) => (
                      <li key={s._key} id={`source-${s._key}`}>
                        {s.text}
                      </li>
                    ))}
                  </ol>
```

Make the identical change to the sources list and the `PortableText` call in
`src/components/TradeIdeaArticle.tsx`.

- [ ] **Step 5: Style the marker**

Append to `src/app/globals.css`:

```css
  /* Citation marker — mono because it is a number, raspberry because it is a
     link, superscript because that is what a citation looks like. */
  .cite {
    font-family: var(--font-mono), ui-monospace, monospace; font-size: 0.62em;
    vertical-align: super; line-height: 0; color: var(--accent);
    text-decoration: none; padding-left: 2px;
  }
  .cite:hover { text-decoration: underline; }
  .sources ol li:target { color: var(--ink); }
```

- [ ] **Step 6: Typecheck**

Run: `npx tsc --noEmit`
Expected: clean.

- [ ] **Step 7: Verify end to end**

In the Studio, add a source to a note, select a phrase in the body, apply the
Citation annotation, and pick that source from the dropdown. Then on the note:

```js
const c = document.querySelector('.cite');
[c.textContent, c.getAttribute('href'), document.querySelector(c.getAttribute('href')) !== null]
```

Expected: `["1", "#source-<key>", true]`

- [ ] **Step 8: Commit**

```bash
git add sanity/components/SourceSelectInput.tsx sanity/schemas/bondNote.ts src/components/PortableText.tsx src/app/notes/\[slug\]/page.tsx src/components/TradeIdeaArticle.tsx src/app/globals.css
git commit -m "Add inline citation markers linked to the sources list"
```

---

## Phase 6: Pull quote

### Task 13: A pull quote distinct from the blockquote

**Files:**
- Modify: `sanity/schemas/bondNote.ts`, `src/components/PortableText.tsx`, `src/app/globals.css`

Today `blockquote` is the only quote treatment and the CSS comment at
`globals.css:1062` even labels it "Pull quote", so a quotation and a pulled line
look identical. The blockquote keeps its left raspberry rule, which stays the one
sanctioned stripe in body copy. The pull quote is bigger, breaks out of the
column, and uses rules above and below instead of a stripe.

- [ ] **Step 1: Add the block type**

In `sanity/schemas/bondNote.ts`, add to the `body` array's `of` list, after
`callout`:

```ts
        {
          type: "object",
          name: "pullQuote",
          title: "Pull quote",
          description:
            "A line lifted out of the flow, set large and breaking the column. For quoting someone else, use the Quote style instead.",
          fields: [
            { name: "text", type: "text", rows: 3, title: "Text" },
            { name: "attribution", type: "string", title: "Attribution" },
          ],
          preview: {
            select: { title: "text", subtitle: "attribution" },
          },
        },
```

- [ ] **Step 2: Render it**

In `src/components/PortableText.tsx`, add to `types` inside `buildComponents`:

```tsx
    pullQuote: ({ value }) => (
      <figure className="pull-quote">
        <p>{value.text}</p>
        {value.attribution && <figcaption>{value.attribution}</figcaption>}
      </figure>
    ),
```

- [ ] **Step 3: Style it**

Append to `src/app/globals.css`:

```css
  /* Pull quote — breaks out to the content wrap, with rules above and below.
     No left stripe: the blockquote's rule is the one sanctioned stripe in body
     copy, and repeating it here would make the two indistinguishable, which is
     the problem this block exists to solve. */
  .ap-col .pull-quote,
  .article-body .pull-quote {
    position: relative; left: 50%; transform: translateX(-50%);
    width: min(var(--col-wide), calc(100vw - 2 * var(--pad)));
    margin: 3em 0; padding: 30px 0;
    border-top: 1px solid var(--rule); border-bottom: 1px solid var(--rule);
  }
  .pull-quote p {
    margin: 0; text-align: center;
    font-family: var(--font-serif), Georgia, serif; font-size: 28px; font-weight: 400;
    line-height: 1.34; letter-spacing: -0.014em; color: var(--ink); text-wrap: balance;
  }
  .pull-quote figcaption {
    margin-top: 14px; text-align: center;
    font-family: var(--font-mono), ui-monospace, monospace; font-size: 10.5px;
    letter-spacing: 0.14em; text-transform: uppercase; color: var(--ink-60);
  }
  @media (max-width: 760px) {
    .pull-quote p { font-size: 22px; }
  }
```

- [ ] **Step 4: Fix the misleading comment on the blockquote**

At `globals.css:1062`, change the comment `/* Pull quote */` above
`.ap-col blockquote` to:

```css
  /* Blockquote — quoted material. The left rule is the one sanctioned stripe in
     body copy. A line pulled out of the author's own prose is .pull-quote. */
```

- [ ] **Step 5: Typecheck**

Run: `npx tsc --noEmit`
Expected: clean.

- [ ] **Step 6: Verify**

Add a pull quote to a note in the Studio, then:

```js
const q = document.querySelector('.pull-quote');
const c = document.querySelector('.ap-col');
[q.getBoundingClientRect().width, c.getBoundingClientRect().width, getComputedStyle(q).borderLeftWidth]
```

Expected: the quote is wider than the text column (roughly 900 vs 684 at desktop
width), and `borderLeftWidth` is `"0px"`.

- [ ] **Step 7: Commit**

```bash
git add sanity/schemas/bondNote.ts src/components/PortableText.tsx src/app/globals.css
git commit -m "Add a pull-quote block distinct from the blockquote"
```

---

## Phase 7: Verification

### Task 14: Full pass

**Files:** none (verification only)

- [ ] **Step 1: Unit tests**

Run: `npm test`
Expected: PASS, all files, no skips.

- [ ] **Step 2: Typecheck**

Run: `npx tsc --noEmit`
Expected: no output.

- [ ] **Step 3: Build**

From the mirror described in the environment notes:

```bash
cd /tmp/tbp-mirror && npx next build
```

Expected: build succeeds and `/notes/[slug]` is listed as statically generated.
A failure mentioning `icon.png` or `opengraph-image` means the mirror is stale;
re-run the rsync.

- [ ] **Step 4: Check every note still renders**

Load all 11 notes in the preview and confirm none 500s. The three that matter
most are `/notes/brazil-s-winning-formation` (trade layout, sidebar TOC),
`/notes/the-stem-beneath-the-flower` (3 headings, gets the rail), and
`/notes/the-price-of-opacity-in-private-credit` (no headings, gets no TOC).

- [ ] **Step 5: Reduced motion**

```js
[...document.styleSheets].flatMap(s => { try { return [...s.cssRules] } catch { return [] } })
  .filter(r => r.conditionText?.includes('prefers-reduced-motion'))
  .map(r => r.cssText.slice(0, 90))
```

Expected: rules covering `.reading-progress`, `.atoc-rail`, and `.atoc-bar`.

- [ ] **Step 6: Keyboard pass**

Tab through an article. Every one of these must show the focus ring: the TOC bar
toggle, each TOC link, each glossary term, each citation marker. Escape must
close both the glossary popover and the TOC panel.

- [ ] **Step 7: Mobile**

Resize to 375px. Confirm the collapsed TOC bar appears below the progress rail
and does not overlap it, the glossary popover stays inside the viewport, and the
pull quote does not cause horizontal page scroll:

```js
document.documentElement.scrollWidth <= window.innerWidth
```

Expected: `true`

- [ ] **Step 8: Convert the one mis-styled note**

In the Studio, open Super El Niño and change "Bearish for Bonds" and "Bullish for
Bonds" from bold paragraphs to the "Section heading" style. Confirm the note then
shows a two-entry TOC.

- [ ] **Step 9: Commit any fixes and open the PR**

```bash
git push -u origin feat/article-reading-experience
gh pr create --title "Article reading experience" --body "Implements docs/superpowers/specs/2026-09-06-article-reading-experience-design.md"
```

---

## Out of scope

Time-remaining readout, related-notes-by-category, and an opening-paragraph
treatment. The last of these is already present: `globals.css:1039` sets a drop
cap on the first paragraph of every standard note.
