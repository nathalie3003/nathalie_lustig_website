# In-Page Motion Language Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Add three disciplined entrance-motion moments — masthead wipe, first-visit wordmark reveal, and article-open choreography — to The Basis Point, all reduced-motion-guarded and built on the existing class-toggle + CSS pattern.

**Architecture:** The masthead wipe is pure CSS (a one-shot `@keyframes` on a `.top::before` bar that runs on hard load and never re-runs because `TopBar` persists across App Router navigations). The wordmark reveal is JS-gated in `Nav.tsx` via a `sessionStorage` flag so it plays only on a genuine first visit. The article-open choreography wraps each note in a `display:contents` `ArticleReveal` client component (keyed per note so it replays on each note-open) that toggles an `is-ready` class driving staggered CSS transitions; the title reuses the existing `ScrollReveal` primitive with a new `trigger="mount"` mode. `display:contents` was verified safe: no direct-child (`>`) selectors exist on the article roots.

**Tech Stack:** Next.js 15 (App Router), React 19, TypeScript, plain CSS in `src/app/globals.css`. No animation library (the house pattern is vanilla class-toggle + CSS; `framer-motion` is present but intentionally unused here for consistency).

**Testing note:** This repo has no JS test framework (no `test` script, no Jest/Vitest), and every prior spec verifies via `tsc --noEmit` + `eslint` + live browser observation. This feature is pure CSS/DOM entrance motion — the meaningful verification is observing behavior in the running app. Adding a test harness for one `sessionStorage` helper would be YAGNI and inconsistent with the codebase. Each task therefore verifies by typecheck, lint, and driving the dev server in the Browser pane.

**Dev server:** Start once with the Browser pane's `preview_start` using `.claude/launch.json` (create it if missing: `next dev`, port 3000). Reuse across tasks; Next HMR picks up edits. Never run `next dev` via a raw shell.

---

### Task 1: Add `trigger` and `delay` props to ScrollReveal

Give the existing headline-reveal primitive a mount-triggered mode (for above-the-fold titles) and a base delay (to slot into a staggered sequence). Default behavior is unchanged.

**Files:**
- Modify: `src/components/ScrollReveal.tsx`

- [ ] **Step 1: Extend the Props type**

Replace the `Props` type (lines 5–11) with:

```tsx
type Props = {
  children: string;
  as?: "h1" | "h2" | "h3" | "span" | "p";
  className?: string;
  /** Stagger between characters, in ms. */
  stagger?: number;
  /** "scroll" (default) reveals on viewport entry; "mount" reveals on load. */
  trigger?: "scroll" | "mount";
  /** Base delay before the first character animates, in ms. */
  delay?: number;
};
```

- [ ] **Step 2: Add the new params to the function signature**

Replace the destructured signature (lines 22–27) with:

```tsx
export function ScrollReveal({
  children,
  as = "h2",
  className,
  stagger = 25,
  trigger = "scroll",
  delay = 0,
}: Props) {
```

- [ ] **Step 3: Branch the effect on `trigger`**

Replace the entire `useEffect` block (lines 31–52) with:

```tsx
  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    if (reduce) {
      el.classList.add("sr-visible");
      return;
    }
    if (trigger === "mount") {
      // Reveal on load. rAF ensures the hidden start state paints first,
      // so the transition actually animates.
      const raf = requestAnimationFrame(() => el.classList.add("sr-visible"));
      return () => cancelAnimationFrame(raf);
    }
    const io = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            el.classList.add("sr-visible");
            io.disconnect();
          }
        });
      },
      { threshold: 0.25 },
    );
    io.observe(el);
    return () => io.disconnect();
  }, [trigger]);
```

- [ ] **Step 4: Apply the base `delay` to each character**

Find the per-character delay line (line 67):

```tsx
              const delay = charIdx * stagger;
```

Replace it with (rename the local to avoid shadowing the new prop):

```tsx
              const charDelay = delay + charIdx * stagger;
```

Then update the `style` a few lines below (line 73) from `${delay}ms` to `${charDelay}ms`:

```tsx
                    style={{ transitionDelay: `${charDelay}ms` }}
```

- [ ] **Step 5: Typecheck and lint**

Run: `npx tsc --noEmit && npx eslint src/components/ScrollReveal.tsx`
Expected: no errors.

- [ ] **Step 6: Commit**

```bash
git add src/components/ScrollReveal.tsx
git commit -m "ScrollReveal: add trigger=mount and delay props"
```

---

### Task 2: Create the ArticleReveal client wrapper

A layout-neutral (`display:contents`) wrapper that toggles an `is-ready` class on mount and re-triggers when its `resetKey` changes, so the article choreography replays on each note-open.

**Files:**
- Create: `src/components/ArticleReveal.tsx`

- [ ] **Step 1: Write the component**

```tsx
"use client";

import { useEffect, useState, type ReactNode } from "react";

// Wraps a note's content and drives the article-open choreography. Renders a
// display:contents element (no layout box — verified safe: no direct-child
// selectors exist on the article roots), toggling `is-ready` on mount to
// trigger the staggered CSS transitions in globals.css. `resetKey` (the note
// slug) re-runs the reveal when navigating between notes, since App Router may
// reconcile rather than remount the [slug] page.
export function ArticleReveal({
  children,
  resetKey,
}: {
  children: ReactNode;
  resetKey?: string;
}) {
  const [ready, setReady] = useState(false);
  useEffect(() => {
    setReady(false);
    const raf = requestAnimationFrame(() => setReady(true));
    return () => cancelAnimationFrame(raf);
  }, [resetKey]);
  return (
    <div className={`article-reveal${ready ? " is-ready" : ""}`}>{children}</div>
  );
}
```

- [ ] **Step 2: Typecheck and lint**

Run: `npx tsc --noEmit && npx eslint src/components/ArticleReveal.tsx`
Expected: no errors (the component is not yet imported anywhere — that's fine).

- [ ] **Step 3: Commit**

```bash
git add src/components/ArticleReveal.tsx
git commit -m "Add ArticleReveal wrapper for article-open choreography"
```

---

### Task 3: Masthead wipe (pure CSS)

The 3px French Blue rule draws in left-to-right once on load.

**Files:**
- Modify: `src/app/globals.css` (near the `.top` rules, ~line 134)

- [ ] **Step 1: Add the wipe CSS**

Immediately after the `.top { … }` rule block (the one ending with `border-bottom: 1px solid var(--rule);` around line 140), add:

```css
  /* Masthead wipe — the accent rule draws in once on load. Pure CSS: the
     one-shot animation runs on hard loads only; the persistent TopBar never
     re-creates the element on client navigations, so it does not replay. */
  .top { border-top-color: transparent; }
  .top::before {
    content: "";
    position: absolute;
    top: -3px;
    left: 0;
    right: 0;
    height: 3px;
    background: var(--accent);
    transform: scaleX(0);
    transform-origin: left center;
    animation: mast-wipe 0.55s cubic-bezier(0.4, 0, 0.2, 1) both;
  }
  @keyframes mast-wipe {
    to { transform: scaleX(1); }
  }
  @media (prefers-reduced-motion: reduce) {
    .top::before { animation: none; transform: scaleX(1); }
  }
```

- [ ] **Step 2: Verify in the browser**

Ensure the dev server is running (`preview_start`). Hard-reload `http://localhost:3000/`. Observe: the top blue rule sweeps in left-to-right once. Take a screenshot for confirmation.

- [ ] **Step 3: Verify reduced motion**

With the Browser pane, emulate reduced motion (resize_window supports color scheme; for reduced motion use `javascript_tool` is not needed — instead confirm via DevTools emulation or trust the CSS). At minimum confirm the rule is fully present (scaleX(1)) as the resting state by checking computed style of `.top::before` is `scaleX(1)` after the animation completes.

- [ ] **Step 4: Typecheck (sanity) and commit**

Run: `npx tsc --noEmit`
Expected: no errors.

```bash
git add src/app/globals.css
git commit -m "Masthead wipe: accent rule draws in on load (Tier A)"
```

---

### Task 4: Wordmark reveal (first visit only)

On a genuine first visit per session, the "bp" badge settles in and "The Basis Point" reveals with a left-to-right ink-clip. Repeat visits and reduced-motion render it statically.

**Files:**
- Modify: `src/components/Nav.tsx`
- Modify: `src/app/globals.css` (near `.top-name-word`, ~line 159)
- Modify: `src/app/layout.tsx` (add a `<noscript>` reveal fallback)

- [ ] **Step 1: Add wordmark reveal state to TopBar**

In `src/components/Nav.tsx`, inside `TopBar`, add a state hook after the existing `const onHome = pathname === "/";` line (line 27):

```tsx
  const [wordmarkPhase, setWordmarkPhase] = useState<"" | "wm-animate" | "wm-instant">("");

  useEffect(() => {
    const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    let seen = false;
    try {
      seen = sessionStorage.getItem("bp-wordmark-seen") === "1";
    } catch {}
    setWordmarkPhase(reduce || seen ? "wm-instant" : "wm-animate");
    try {
      sessionStorage.setItem("bp-wordmark-seen", "1");
    } catch {}
  }, []);
```

- [ ] **Step 2: Apply the phase class to the wordmark link**

In the same file, update the wordmark `Link` `className` (line 78) from:

```tsx
            className="top-name top-name-mark"
```

to:

```tsx
            className={`top-name top-name-mark ${wordmarkPhase}`.trim()}
```

- [ ] **Step 3: Add the wordmark reveal CSS**

In `src/app/globals.css`, immediately after the `.top-name-word { … }` rule (ends around line 162), add:

```css
  /* Wordmark reveal — plays only on a genuine first visit per session
     (JS-gated in Nav.tsx). Hidden start state mirrors the ScrollReveal model;
     repeat visits and reduced motion render it statically via .wm-instant. */
  .top-name-mark .bp-mark { opacity: 0; transform: scale(0.92); }
  .top-name-word {
    display: inline-block;
    clip-path: inset(0 100% 0 0);
    transform: translateY(5px);
  }
  .top-name-mark.wm-animate .bp-mark {
    animation: wm-badge 0.5s cubic-bezier(0.2, 0.7, 0.2, 1) 0.35s both;
  }
  .top-name-mark.wm-animate .top-name-word {
    animation: wm-word 0.55s cubic-bezier(0.4, 0, 0.2, 1) 0.5s both;
  }
  .top-name-mark.wm-instant .bp-mark { opacity: 1; transform: none; }
  .top-name-mark.wm-instant .top-name-word {
    clip-path: inset(0 0 0 0);
    transform: none;
  }
  @keyframes wm-badge { to { opacity: 1; transform: scale(1); } }
  @keyframes wm-word {
    to { clip-path: inset(0 0 0 0); transform: translateY(0); }
  }
  @media (prefers-reduced-motion: reduce) {
    .top-name-mark .bp-mark { opacity: 1; transform: none; }
    .top-name-word { clip-path: none; transform: none; }
    .top-name-mark.wm-animate .bp-mark,
    .top-name-mark.wm-animate .top-name-word { animation: none; }
  }
```

- [ ] **Step 4: Add a no-JS fallback so the wordmark is never hidden without JS**

In `src/app/layout.tsx`, inside the `<head>` (if there is no explicit `<head>`, add one inside the `<html>` element), add:

```tsx
        <noscript>
          <style>{`.top-name-mark .bp-mark{opacity:1;transform:none}.top-name-word{clip-path:none;transform:translateY(0)}`}</style>
        </noscript>
```

- [ ] **Step 5: Verify first-visit vs repeat in the browser**

Ensure dev server running. In the Browser pane:
- Clear the flag: `javascript_tool` → `sessionStorage.removeItem('bp-wordmark-seen'); location.reload();`
- Observe: badge fades/scales in, then "The Basis Point" clips in left-to-right. Screenshot.
- Reload again (flag now set): wordmark appears immediately, no animation. Confirm via `javascript_tool` → `sessionStorage.getItem('bp-wordmark-seen')` returns `"1"`.

- [ ] **Step 6: Typecheck, lint, commit**

Run: `npx tsc --noEmit && npx eslint src/components/Nav.tsx src/app/layout.tsx`
Expected: no errors.

```bash
git add src/components/Nav.tsx src/app/globals.css src/app/layout.tsx
git commit -m "Wordmark reveal: first-visit-only badge + name reveal (Tier A)"
```

---

### Task 5: Article-open choreography CSS

Staggered entrance styles keyed off the `.article-reveal` wrapper. Shared by both note templates. General template has no header rule (only trade does), so the rule step targets `.trade-rule` only.

**Files:**
- Modify: `src/app/globals.css` (add near the end of the article styles, after the `.ap-rule` rule ~line 1146, or any coherent spot among the article rules)

- [ ] **Step 1: Add the choreography CSS**

Add this block to `src/app/globals.css`:

```css
  /* ARTICLE-OPEN CHOREOGRAPHY (Tier B) — staggered entrance driven by the
     display:contents .article-reveal wrapper (ArticleReveal.tsx), keyed per
     note so it replays on each note-open. The title itself is handled by
     ScrollReveal (trigger="mount"). */
  .article-reveal { display: contents; }

  .article-reveal .trade-back,
  .article-reveal .ap-back,
  .article-reveal .article-meta-top,
  .article-reveal .ap-meta,
  .article-reveal .article-deck,
  .article-reveal .ap-deck,
  .article-reveal .article-body > p:first-of-type,
  .article-reveal .ap-col > p:first-of-type {
    opacity: 0;
    transform: translateY(6px);
    transition:
      opacity 0.5s ease,
      transform 0.5s cubic-bezier(0.2, 0.7, 0.2, 1);
  }
  .article-reveal .trade-rule {
    transform: scaleX(0);
    transform-origin: left center;
    transition: transform 0.5s cubic-bezier(0.4, 0, 0.2, 1);
  }

  .article-reveal .trade-back,
  .article-reveal .ap-back { transition-delay: 0.15s; }
  .article-reveal .trade-rule { transition-delay: 0.25s; }
  .article-reveal .article-meta-top,
  .article-reveal .ap-meta { transition-delay: 0.4s; }
  .article-reveal .article-deck,
  .article-reveal .ap-deck { transition-delay: 1.05s; }
  .article-reveal .article-body > p:first-of-type,
  .article-reveal .ap-col > p:first-of-type { transition-delay: 1.2s; }

  .article-reveal.is-ready .trade-back,
  .article-reveal.is-ready .ap-back,
  .article-reveal.is-ready .article-meta-top,
  .article-reveal.is-ready .ap-meta,
  .article-reveal.is-ready .article-deck,
  .article-reveal.is-ready .ap-deck,
  .article-reveal.is-ready .article-body > p:first-of-type,
  .article-reveal.is-ready .ap-col > p:first-of-type {
    opacity: 1;
    transform: none;
  }
  .article-reveal.is-ready .trade-rule { transform: scaleX(1); }

  @media (prefers-reduced-motion: reduce) {
    .article-reveal .trade-back,
    .article-reveal .ap-back,
    .article-reveal .article-meta-top,
    .article-reveal .ap-meta,
    .article-reveal .article-deck,
    .article-reveal .ap-deck,
    .article-reveal .article-body > p:first-of-type,
    .article-reveal .ap-col > p:first-of-type,
    .article-reveal .trade-rule {
      opacity: 1;
      transform: none;
      transition: none;
    }
  }
```

- [ ] **Step 2: Typecheck (sanity) and commit**

Run: `npx tsc --noEmit`
Expected: no errors. (No visible effect yet — the wrapper isn't wired in until Tasks 6–7.)

```bash
git add src/app/globals.css
git commit -m "Article-open choreography CSS (shared, reduced-motion guarded)"
```

---

### Task 6: Wire the choreography into the trade template

**Files:**
- Modify: `src/components/TradeIdeaArticle.tsx`
- Modify: `src/app/notes/[slug]/page.tsx` (pass `resetKey`)

- [ ] **Step 1: Import ArticleReveal and ScrollReveal**

In `src/components/TradeIdeaArticle.tsx`, add to the imports at the top:

```tsx
import { ArticleReveal } from "@/components/ArticleReveal";
import { ScrollReveal } from "@/components/ScrollReveal";
```

- [ ] **Step 2: Add a `resetKey` prop**

In the `TradeIdeaArticle` props destructuring and type (lines 22–34), add `resetKey`:

```tsx
export function TradeIdeaArticle({
  note,
  prev,
  next,
  dateLabel,
  readLabel,
  resetKey,
}: {
  note: BondNote;
  prev: BondNoteCard | null;
  next: BondNoteCard | null;
  dateLabel: string;
  readLabel: string;
  resetKey: string;
}) {
```

- [ ] **Step 3: Wrap the content in ArticleReveal**

The return currently opens with:

```tsx
    <div className="trade-page">
      <ReadingProgress />

      <header className="trade-hero">
```

Change it to wrap everything after `<ReadingProgress />` up to the closing `</div>` of `.trade-page` in `<ArticleReveal>`:

```tsx
    <div className="trade-page">
      <ReadingProgress />

      <ArticleReveal resetKey={resetKey}>
      <header className="trade-hero">
```

…and add the matching `</ArticleReveal>` immediately before the final `</div>` that closes `.trade-page`. (Find the last `</div>` of the component's outer `.trade-page` container and insert `</ArticleReveal>` just before it.)

- [ ] **Step 4: Replace the title with ScrollReveal**

Change the title (line 64) from:

```tsx
          <h1 className="article-h1">{note.title}</h1>
```

to:

```tsx
          <ScrollReveal as="h1" className="article-h1" trigger="mount" delay={520}>
            {note.title}
          </ScrollReveal>
```

- [ ] **Step 5: Pass `resetKey` from the page**

In `src/app/notes/[slug]/page.tsx`, update the `<TradeIdeaArticle … />` usage (lines 40–46) to add `resetKey={slug}`:

```tsx
      <TradeIdeaArticle
        note={note}
        prev={prev}
        next={next}
        dateLabel={formatDateLong(note.publishedAt)}
        readLabel={`${minutes} read`}
        resetKey={slug}
      />
```

- [ ] **Step 6: Verify in the browser**

Open a trade-ideas note (category `trade-ideas`) at `http://localhost:3000/notes/<a-trade-slug>`. Observe the sequence: back-link → rule draws → tag+date → title rises character-by-character → deck → drop-cap paragraph. Screenshot the settled state (title fully visible, not clipped). Navigate to another trade note and confirm it replays.

- [ ] **Step 7: Typecheck, lint, commit**

Run: `npx tsc --noEmit && npx eslint src/components/TradeIdeaArticle.tsx "src/app/notes/[slug]/page.tsx"`
Expected: no errors.

```bash
git add src/components/TradeIdeaArticle.tsx "src/app/notes/[slug]/page.tsx"
git commit -m "Wire article choreography into trade template"
```

---

### Task 7: Wire the choreography into the general template

**Files:**
- Modify: `src/app/notes/[slug]/page.tsx`

- [ ] **Step 1: Import ArticleReveal and ScrollReveal**

At the top of `src/app/notes/[slug]/page.tsx`, add:

```tsx
import { ArticleReveal } from "@/components/ArticleReveal";
import { ScrollReveal } from "@/components/ScrollReveal";
```

- [ ] **Step 2: Wrap the general article content**

The general return currently is:

```tsx
    <div className="article-page">
      <ReadingProgress />

      <header className="ap-head col-wide">
```

Change to:

```tsx
    <div className="article-page">
      <ReadingProgress />

      <ArticleReveal resetKey={slug}>
      <header className="ap-head col-wide">
```

…and add the matching `</ArticleReveal>` immediately before the final `</div>` that closes `.article-page`.

- [ ] **Step 3: Replace the general title with ScrollReveal**

Change (line 73):

```tsx
        <h1 className="ap-title">{note.title}</h1>
```

to:

```tsx
        <ScrollReveal as="h1" className="ap-title" trigger="mount" delay={520}>
          {note.title}
        </ScrollReveal>
```

- [ ] **Step 4: Verify in the browser**

Open a non-trade note (any category except `trade-ideas`) at `http://localhost:3000/notes/<a-general-slug>` — e.g. the geopolitical-tensions note in progress if published, otherwise any published general note. Observe: back-link → tag+date → title rises → deck → drop-cap paragraph (no rule step for general). Screenshot the settled state. Navigate between two general notes and confirm replay.

- [ ] **Step 5: Typecheck, lint, commit**

Run: `npx tsc --noEmit && npx eslint "src/app/notes/[slug]/page.tsx"`
Expected: no errors.

```bash
git add "src/app/notes/[slug]/page.tsx"
git commit -m "Wire article choreography into general template"
```

---

### Task 8: Full verification matrix

Confirm the whole motion language behaves across the required conditions.

**Files:** none (verification only)

- [ ] **Step 1: Typecheck and lint the whole project**

Run: `npx tsc --noEmit && npx eslint`
Expected: no errors.

- [ ] **Step 2: Hard-load behavior**

Reload `http://localhost:3000/` (clear the flag first via `javascript_tool`: `sessionStorage.removeItem('bp-wordmark-seen')`). Confirm: masthead wipes in AND wordmark reveals. Reload again: masthead still wipes, wordmark static. Screenshot both.

- [ ] **Step 3: Persistent-header (no replay on in-site nav)**

From home, click into a note, then click "The Basis Point" to return home. Confirm the masthead and wordmark do NOT replay (header persists). 

- [ ] **Step 4: Both article templates**

Open one trade note and one general note; confirm each plays its choreography and the title is fully revealed (not stuck hidden). Navigate note→note to confirm replay per note.

- [ ] **Step 5: Reduced motion**

In the Browser pane, enable reduced-motion emulation (DevTools rendering emulation, or run with an OS reduced-motion setting). Reload home and a note. Confirm: no masthead wipe animation (rule present), wordmark static, article content fully visible with no motion. Screenshot.

- [ ] **Step 6: Mobile width**

Resize the Browser pane to mobile (375px). Confirm: no horizontal layout shift from the masthead band; badge reveal still plays; article choreography still plays; wordmark word is hidden per existing mobile rule (badge still reveals). Screenshot.

- [ ] **Step 7: Final commit (if any tuning was needed)**

If any timing/threshold tweaks were made during verification:

```bash
git add -A
git commit -m "Motion language: verification-pass tuning"
```

Otherwise, no commit — the feature is complete.

---

## Notes for the implementer

- **Do not** introduce `framer-motion` for any of this; the house pattern is class-toggle + CSS.
- **Timings are tunable.** The ms values (0.55s wipe, 0.35s/0.5s wordmark offsets, the article stagger 0.15→1.2s, `delay={520}` on titles) are calibrated to the approved prototype but may be nudged during Step 8 verification if the pace feels off.
- **`display:contents` safety** was verified: no direct-child (`>`) selectors target `.trade-page`, `.article-page`, `.trade-hero`, `.ap-head`, or `.ap-body`, so the `ArticleReveal` wrapper does not break any layout.
- **Out of scope** (own future specs): the Remotion LinkedIn share-card, the yield-curve draw-on-scroll, and scroll-reveal/reading-progress polish.
