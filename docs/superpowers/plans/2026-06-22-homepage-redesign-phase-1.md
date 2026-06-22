# Homepage Redesign — Phase 1 Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Restructure the homepage of `nathalielustig.com` (Next.js portfolio) per `docs/superpowers/specs/2026-06-22-homepage-redesign-phase-1-design.md` — new Alfie-style hero, NL monogram nav with Hire Me pill, section reorder, button cleanup, contact normalization, and small content fixes.

**Architecture:** All changes are local edits to existing components plus one new `Hero.tsx` server component. The two-column `.home` grid in `page.tsx` is removed and the homepage becomes a flat sequence of full-width sections. No Sanity schema or query changes. Some content lives in Sanity Studio (live) and in TypeScript "fallback" files; the plan calls out where both need editing.

**Tech Stack:** Next.js (App Router, this project's pinned breaking-changes version — read `node_modules/next/dist/docs/` for any unfamiliar API), React server components, Sanity CMS for content, plain CSS in `src/app/globals.css`.

**No tests in this repo.** Verification = `npm run lint`, `npm run build`, and visual inspection via `npm run dev` in a browser. Each task ends with a build + a visual check before commit.

**Branch:** Already on `homepage-redesign-phase-1` (created during spec). All commits land on this branch.

**Sanity caveat:** Several content files (`dailyReads.ts`, `books.ts`) are marked "FALLBACK ONLY — edit via Sanity Studio at /studio". The live site may render different data. The plan edits the fallback files (so the build is correct in isolation); the **user should also remove / rename the equivalent items in Sanity Studio** after deploy. Each affected task flags this.

---

## File map

**New files:**
- `src/components/Hero.tsx` — new Alfie-style hero (server component).

**Modified files:**
- `src/components/Nav.tsx` — NL monogram, new link order, Hire Me pill, fix Notes hover.
- `src/components/AboutSection.tsx` — remove CTAs.
- `src/components/ContactSection.tsx` — Email becomes slim block, CV link removed.
- `src/components/RightRail.tsx` — drop the portrait (moved to hero); render as horizontal slim strip.
- `src/components/Footer.tsx` — small CSS audit only (no TS change expected).
- `src/app/page.tsx` — flat section sequence in new order; uses new `Hero`.
- `src/app/globals.css` — new classes for hero, monogram, hire-me pill, right-now strip; tweaks to `.notes-pop`; tweak to `.foot-contact` for alignment.
- `src/content/tone.ts` — rename `readsHead`.
- `src/content/dailyReads.ts` — remove standalone Bloomberg entry.
- `src/content/books.ts` — fix "Next up, back in London" status.

---

## Task 1: Content / copy edits

Smallest surface-area change. Land it first so subsequent visual tasks render against the correct copy.

**Files:**
- Modify: `src/content/tone.ts:15`
- Modify: `src/content/dailyReads.ts:6`
- Modify: `src/content/books.ts:22`

- [ ] **Step 1: Rename the reads heading**

Edit `src/content/tone.ts` line 15:

```ts
export const readsHead = "My go-to resources";
```

(was: `"What I'm reading"`)

- [ ] **Step 2: Drop the standalone Bloomberg entry from daily reads fallback**

Edit `src/content/dailyReads.ts`. Delete the line:

```ts
  { name: "Bloomberg", url: "https://www.bloomberg.com", short: "BB" },
```

Leave the `Points of Return (John Authers)` entry directly below — that's the one we keep.

- [ ] **Step 3: Fix the "back in London" book status**

Edit `src/content/books.ts`. Change the second book's `status`:

```ts
status: "Next up",
```

(was: `"Next up, back in London"`)

- [ ] **Step 4: Verify build**

Run: `npm run lint && npm run build`
Expected: both succeed with no new warnings.

- [ ] **Step 5: Visual check**

Run: `npm run dev`. Open `http://localhost:3000`. In the right rail beside the hero, confirm:
- The reads block heading reads "My go-to resources".
- There's no standalone "Bloomberg" entry (only "Points of Return").
- The second book's status reads "Next up" (no "back in London").

Stop the dev server.

- [ ] **Step 6: Flag the Sanity Studio twin edits**

Note for the user (don't act): the live site's daily reads + books come from Sanity Studio. After deploy they should open `/studio` and (a) delete the standalone "Bloomberg" daily-read item if it exists, (b) change the book status from "Next up, back in London" to "Next up".

- [ ] **Step 7: Commit**

```bash
git add src/content/tone.ts src/content/dailyReads.ts src/content/books.ts
git commit -m "content: rename reads heading, drop Bloomberg dup, fix book status"
```

---

## Task 2: Navbar — NL monogram, new structure, Hire Me pill

**Files:**
- Modify: `src/components/Nav.tsx`
- Modify: `src/app/globals.css`

- [ ] **Step 1: Rewrite the desktop links section of `Nav.tsx`**

In `src/components/Nav.tsx`, replace the contents of `<header className="top"><div className="top-inner">…</div></header>` so that:

1. The top-left becomes an NL monogram (img wrapping `src/app/icon.png`):

```tsx
<Link href="/#top" className="top-mark" onClick={jump("top")} aria-label="Home">
  <img src="/icon.png" alt="" width={28} height={28} />
</Link>
```

Move `src/app/icon.png` to `public/icon.png` so the `<img src="/icon.png">` resolves (alternatively, import it as a static asset — pick whichever is conventional in this Next.js version per `node_modules/next/dist/docs/`).

2. The nav links order becomes Home · About · Projects · Notes ▾ · CV. Replace the existing `<nav className="top-links">` children with:

```tsx
<nav className="top-links">
  <Link href="/#top" className="top-link" onClick={jump("top")}>Home</Link>
  <Link href="/#about" className="top-link" onClick={jump("about")}>About</Link>
  <Link href="/#projects" className="top-link" onClick={jump("projects")}>Projects</Link>

  <div
    className="notes-menu"
    ref={notesRef}
    onMouseEnter={openNotes}
    onMouseLeave={scheduleCloseNotes}
  >
    <Link
      href="/notes"
      className="top-link notes-trigger"
      aria-expanded={notesOpen}
      aria-haspopup="true"
      onClick={() => setNotesOpen(false)}
    >
      Notes <span className="notes-caret" aria-hidden="true">▾</span>
    </Link>
    {notesOpen && (
      <div
        className="notes-pop"
        role="menu"
        onMouseEnter={cancelCloseNotes}
        onMouseLeave={scheduleCloseNotes}
      >
        <Link href="/notes" className="np-row np-all" onClick={() => setNotesOpen(false)}>
          <span className="np-title">All notes</span>
          <span className="np-sub">Every post, newest first</span>
        </Link>
        <div className="np-rule" />
        {CATEGORIES.map((c) => (
          <Link
            key={c.slug}
            href={`/notes?category=${c.slug}`}
            className="np-row"
            onClick={() => setNotesOpen(false)}
          >
            <span className="np-title">{c.label}</span>
            <span className="np-sub">{c.blurb}</span>
          </Link>
        ))}
      </div>
    )}
  </div>

  <a href="/cv.pdf" download className="top-link top-link-cv">{cvLabel}</a>
</nav>
```

3. Replace the standalone CV button with a Hire Me pill on the far right:

```tsx
<Link href="/#contact" className="l-btn l-btn-hire" onClick={jump("contact")}>
  Hire Me! <span aria-hidden="true">→</span>
</Link>
```

4. Delete the prior `<Link href="/#top" className="top-name">Nathalie Lustig</Link>` and the standalone `<a href="/cv.pdf" download className="l-btn l-btn-cv l-btn-sm cv-btn">…</a>`.

- [ ] **Step 2: Mirror the new structure in the mobile menu**

In the same file, update the `mobile-menu` pop so its rows read in order: Home, About, Projects, Notes (then category list), CV, Hire Me!. Reuse the existing `<Link>` patterns; for Hire Me use `jump("contact")`.

- [ ] **Step 3: Add Notes hover intent timers**

Above the `return` in `TopBar`, add a ref + helpers so the close has a 120ms delay and can be cancelled:

```tsx
const closeTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
const cancelCloseNotes = () => {
  if (closeTimer.current) {
    clearTimeout(closeTimer.current);
    closeTimer.current = null;
  }
};
const openNotes = () => { cancelCloseNotes(); setNotesOpen(true); };
const scheduleCloseNotes = () => {
  cancelCloseNotes();
  closeTimer.current = setTimeout(() => setNotesOpen(false), 120);
};
```

Add `useRef` to the React import and ensure `useEffect` cleanup clears the timer on unmount.

- [ ] **Step 4: Add CSS — monogram, CV text link, Hire Me pill, hover bridge**

In `src/app/globals.css`, append (find the existing `.top` / `.top-link` block and add nearby for cohesion):

```css
.top-mark { display: inline-flex; align-items: center; line-height: 0; }
.top-mark img { display: block; height: 28px; width: 28px; }

.top-link-cv { /* same visual weight as other text links */
  font-weight: inherit;
}

.l-btn-hire {
  display: inline-flex; align-items: center; gap: 6px;
  padding: 10px 16px;
  border-radius: 999px;
  background: var(--ink, #111);
  color: var(--paper, #fff);
  text-decoration: none;
  white-space: nowrap;
}
.l-btn-hire:hover { opacity: 0.9; }

/* Hover bridge so the popover doesn't disappear when the cursor crosses the gap. */
.notes-menu { position: relative; }
.notes-pop { margin-top: 0; padding-top: 8px; }
.notes-pop::before {
  content: "";
  position: absolute;
  top: -10px; left: 0; right: 0; height: 12px;
  background: transparent;
}
```

If `.cv-btn` / `.top-name` rules are no longer referenced anywhere, delete them.

- [ ] **Step 5: Lint + build**

Run: `npm run lint && npm run build`
Expected: succeed.

- [ ] **Step 6: Visual check**

Run: `npm run dev`. At `http://localhost:3000`:

- Top-left shows the NL favicon mark, no "Nathalie Lustig" text.
- Links read `Home · About · Projects · Notes ▾ · CV` with a dark `Hire Me! →` pill on the right.
- Clicking Hire Me scrolls to the contact band.
- Hovering "Notes" opens the dropdown; moving the cursor *into* the dropdown keeps it open; moving out closes it after a beat (no flicker).
- Resize to mobile width: hamburger menu opens with the new order including Hire Me!.

Stop the dev server.

- [ ] **Step 7: Commit**

```bash
git add src/components/Nav.tsx src/app/globals.css public/icon.png
git commit -m "nav: NL monogram, Hire Me pill, Notes hover intent"
```

If `src/app/icon.png` is also kept in `src/app/` for favicon purposes (Next.js convention), leave it; only `public/icon.png` needs to exist for the `<img>` tag.

---

## Task 3: New `Hero.tsx` component

**Files:**
- Create: `src/components/Hero.tsx`
- Modify: `src/app/globals.css`

- [ ] **Step 1: Create `src/components/Hero.tsx`**

```tsx
import Link from "next/link";
import Image from "next/image";
import { hero, readLatest } from "@/content/tone";

export function Hero({ latestHref }: { latestHref: string }) {
  return (
    <section className="hero-v2" id="top">
      <div className="hero-v2-inner">
        <div className="hero-v2-left">
          <span className="hero-v2-eyebrow">PORTFOLIO · 2026</span>
          <h1 className="hero-v2-name">
            Nathalie Lustig<span className="hero-v2-dot">.</span>
          </h1>
          <p className="hero-v2-lead">{hero.lead}</p>
          <div className="hero-v2-cta">
            <Link href={latestHref} className="l-btn l-btn-primary">
              {readLatest}
            </Link>
          </div>
        </div>

        <figure className="hero-v2-portrait">
          <Image
            src="/rail-portrait.jpg"
            alt="Portrait of Nathalie Lustig"
            width={720}
            height={720}
            priority
            className="hero-v2-portrait-img"
          />
          <span className="hpb hpb-tl" aria-hidden="true" />
          <span className="hpb hpb-tr" aria-hidden="true" />
          <span className="hpb hpb-bl" aria-hidden="true" />
          <span className="hpb hpb-br" aria-hidden="true" />
        </figure>
      </div>
    </section>
  );
}
```

- [ ] **Step 2: Add hero styles to `globals.css`**

Append (place near other `.hero` / `.section` rules):

```css
.hero-v2 { padding: 64px 0 48px; }
.hero-v2-inner {
  max-width: 1180px;
  margin: 0 auto;
  padding: 0 24px;
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 56px;
  align-items: center;
}
.hero-v2-eyebrow {
  display: block;
  font-size: 12px;
  letter-spacing: 0.18em;
  text-transform: uppercase;
  color: var(--muted, #6b6b6b);
  margin-bottom: 24px;
}
.hero-v2-name {
  /* match the existing display serif used by .hero-name */
  font-family: inherit;
  font-size: clamp(56px, 8vw, 112px);
  line-height: 0.95;
  margin: 0 0 28px;
  letter-spacing: -0.01em;
}
.hero-v2-dot { color: var(--accent, #2a4dd0); }
.hero-v2-lead {
  font-size: 18px;
  line-height: 1.55;
  max-width: 48ch;
  margin: 0 0 28px;
}
.hero-v2-cta { display: flex; gap: 12px; }

.hero-v2-portrait { position: relative; margin: 0; aspect-ratio: 1 / 1; }
.hero-v2-portrait-img {
  width: 100%; height: 100%;
  object-fit: cover;
  display: block;
}
/* Corner brackets, Alfie-style */
.hpb { position: absolute; width: 22px; height: 22px; border: 2px solid var(--ink, #111); }
.hpb-tl { top: -10px; left: -10px; border-right: 0; border-bottom: 0; }
.hpb-tr { top: -10px; right: -10px; border-left: 0; border-bottom: 0; }
.hpb-bl { bottom: -10px; left: -10px; border-right: 0; border-top: 0; }
.hpb-br { bottom: -10px; right: -10px; border-left: 0; border-top: 0; }

@media (max-width: 820px) {
  .hero-v2-inner { grid-template-columns: 1fr; gap: 32px; }
  .hero-v2-portrait { max-width: 420px; margin: 0 auto; }
}
```

If `--ink`, `--paper`, `--accent`, `--muted` aren't defined in the project's CSS variables, replace with the project's existing color tokens (grep `globals.css` for `--` to find the actual palette).

- [ ] **Step 3: Lint + build**

Run: `npm run lint && npm run build`
Expected: succeed.

- [ ] **Step 4: Commit (no wiring yet)**

The component isn't rendered yet — it gets wired into `page.tsx` in Task 4.

```bash
git add src/components/Hero.tsx src/app/globals.css
git commit -m "feat(hero): new Alfie-style Hero component"
```

---

## Task 4: Page reorder + RightRail slim strip

**Files:**
- Modify: `src/app/page.tsx`
- Modify: `src/components/RightRail.tsx`
- Modify: `src/app/globals.css`

- [ ] **Step 1: Rewrite `src/app/page.tsx` as a flat sequence**

Replace the whole `HomePage` body with:

```tsx
import Link from "next/link";
import { getAllNotes } from "@/lib/queries";
import { RightRail } from "@/components/RightRail";
import { AboutSection } from "@/components/AboutSection";
import { ProjectsSection } from "@/components/ProjectsSection";
import { ContactSection } from "@/components/ContactSection";
import { HashScroll } from "@/components/HashScroll";
import { MarketTickerPlaceholder } from "@/components/MarketTickerPlaceholder";
import { Hero } from "@/components/Hero";
import { noteCat } from "@/lib/noteCat";
import { ScrollReveal } from "@/components/ScrollReveal";

function formatDateShort(iso: string) {
  return new Date(iso).toLocaleDateString("en-GB", {
    day: "numeric",
    month: "short",
    year: "numeric",
  });
}

export default async function HomePage() {
  const notes = await getAllNotes();
  const latest = notes[0];
  const recent = notes.slice(1, 3);
  const latestHref = latest ? `/notes/${latest.slug}` : "/#notes";

  return (
    <>
      <HashScroll />
      <Hero latestHref={latestHref} />
      <RightRail />
      <AboutSection />
      <ProjectsSection />

      <section className="band band-notes" id="notes">
        <div className="page-wide">
          <div className="section-head">
            <ScrollReveal as="span" className="l-eyebrow" stagger={18}>
              Recent commentary
            </ScrollReveal>
          </div>
          {latest ? (
            <>
              <Link href={`/notes/${latest.slug}`} className="latest-feature">
                <div className="latest-feature-row">
                  <span className="latest-feature-cat">
                    {noteCat(latest.category).cat}
                  </span>
                  <span className="latest-feature-date">
                    {formatDateShort(latest.publishedAt)}
                  </span>
                </div>
                <ScrollReveal as="h2" className="latest-feature-title">
                  {latest.title}
                </ScrollReveal>
                {latest.excerpt ? (
                  <p className="latest-feature-excerpt">{latest.excerpt}</p>
                ) : null}
                <span className="latest-feature-more">Read this note →</span>
              </Link>

              {recent.length > 0 ? (
                <ul className="recent-list">
                  {recent.map((n) => (
                    <li key={n._id} className="recent-row">
                      <Link href={`/notes/${n.slug}`} className="recent-link">
                        <span className="recent-cat">
                          {noteCat(n.category).cat}
                        </span>
                        <span className="recent-title">{n.title}</span>
                        <span className="recent-date">
                          {formatDateShort(n.publishedAt)}
                        </span>
                      </Link>
                    </li>
                  ))}
                </ul>
              ) : null}

              <Link href="/notes" className="view-all-notes">
                View all notes →
              </Link>
            </>
          ) : (
            <p className="rail-block-note" style={{ padding: "20px 0" }}>
              No notes published yet.
            </p>
          )}
        </div>
      </section>

      <MarketTickerPlaceholder />
      <ContactSection />
    </>
  );
}
```

This removes the `.scroll-home`, `.home`, `.home-main` wrappers. The `hero` import from `tone.ts` is also no longer needed in `page.tsx`.

- [ ] **Step 2: Reshape `RightRail.tsx` into a slim horizontal band**

Edit `src/components/RightRail.tsx`. Remove the portrait `Image` (it moved to the hero). Wrap the two existing blocks (`reads` and `books`) in a horizontal band:

```tsx
return (
  <section className="band band-rightnow">
    <div className="page-wide rightnow-strip">
      <div className="rail-block rs-block">
        <span className="l-eyebrow rail-block-head">{readsHead}</span>
        <p className="rail-block-note">{readsNote}</p>
        <div className="reads">
          {reads.map((r) => (
            <a
              className="read-link"
              key={r.key}
              href={r.url}
              target="_blank"
              rel="noopener noreferrer"
            >
              <span className="read-name">{r.name.replace(/\s*\(.*\)$/, "")}</span>
              <span className="read-url">{readHost(r.url)}</span>
            </a>
          ))}
        </div>
      </div>

      <div className="rail-block rs-block">
        <span className="l-eyebrow rail-block-head">On the bedside table</span>
        <p className="rail-block-note">The books I&apos;m working through right now.</p>
        <div className="books">
          {books.map((b) => (
            <div className="book" key={b.key}>
              {b.coverSrc ? (
                <Image
                  src={b.coverSrc}
                  alt={`${b.title} cover`}
                  width={192}
                  height={288}
                  className="book-cover"
                />
              ) : (
                <span className="book-cover" aria-hidden="true" />
              )}
              <div className="book-meta">
                <span className="book-status">{b.status}</span>
                <span className="book-title">{b.title}</span>
                <span className="book-author">{b.author}</span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  </section>
);
```

Remove the now-unused `Image` import only if no other `Image` use remains in the file (the books loop still uses it — keep it).

- [ ] **Step 3: Add right-now strip styles**

Append to `globals.css`:

```css
.band-rightnow { padding: 32px 0; border-top: 1px solid var(--rule, #eee); border-bottom: 1px solid var(--rule, #eee); }
.rightnow-strip {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 48px;
  align-items: start;
}
.rs-block { min-width: 0; }
@media (max-width: 820px) {
  .rightnow-strip { grid-template-columns: 1fr; gap: 32px; }
}
```

- [ ] **Step 4: Remove dead styles**

Search `globals.css` for `.scroll-home`, `.home`, `.home-main`, `.hero`, `.hero-slim`, `.hero-name`, `.hero-lead`, `.hero-cta`, `.home-rail`, `.rail-card`, `.rail-portrait`. Delete any rules that are now unreachable. Leave anything still referenced elsewhere (e.g., `.rail-block`, `.rail-block-head`, `.rail-block-note` are still used by the strip).

- [ ] **Step 5: Lint + build**

Run: `npm run lint && npm run build`
Expected: succeed. (If the build complains about an unused `hero` import in `page.tsx`, remove it.)

- [ ] **Step 6: Visual check**

Run: `npm run dev`. At `http://localhost:3000`:

- New hero renders: eyebrow, big "Nathalie Lustig.", lead, single "Read the latest →" CTA, portrait on the right with corner brackets.
- Directly below: slim band with "My go-to resources" on the left and "On the bedside table" on the right (no portrait).
- Then About → Projects → Notes ("Recent commentary") → Ticker → Contact.
- Resize narrow: hero stacks (text above portrait); right-now strip stacks (reads above books).

Stop the dev server.

- [ ] **Step 7: Commit**

```bash
git add src/app/page.tsx src/components/RightRail.tsx src/app/globals.css
git commit -m "feat(home): Alfie-style hero, flat section order, slim right-now strip"
```

---

## Task 5: About section — drop CTAs

**Files:**
- Modify: `src/components/AboutSection.tsx`

- [ ] **Step 1: Remove the button block**

Delete the entire `<div className="about-actions">…</div>` from `AboutSection.tsx` (lines 25–32 in the current file). Also remove the now-unused `cvLabel` import:

```tsx
// remove this line:
import { cvLabel } from "@/content/tone";
```

And remove the `Link` import if it becomes unused (it likely still appears nowhere else in this file — confirm; if unused, remove).

- [ ] **Step 2: Lint + build**

Run: `npm run lint && npm run build`
Expected: succeed with no unused-import warnings.

- [ ] **Step 3: Visual check**

`npm run dev`. Scroll to About — confirm bio paragraphs render, no buttons below them, `RightNowBlock` sidebar still shows. Stop dev server.

- [ ] **Step 4: Commit**

```bash
git add src/components/AboutSection.tsx
git commit -m "about: drop Download CV + See my projects buttons"
```

---

## Task 6: Contact section — slim Email block, drop CV

**Files:**
- Modify: `src/components/ContactSection.tsx`
- Modify: `src/app/globals.css`

- [ ] **Step 1: Restructure the `.contact-direct` block**

In `src/components/ContactSection.tsx`, replace the existing `<div className="contact-direct">…</div>` with two side-by-side slim blocks. The Email block is a `<button>` that copies on click; the LinkedIn block is an `<a>`. Both share the same `.contact-link` styles.

```tsx
<div className="contact-direct contact-link-grid">
  <button
    type="button"
    className="contact-link contact-link-btn"
    onClick={onCopy}
    aria-label={`Copy email address ${EMAIL}`}
  >
    <span className="cl-label">Email</span>
    <span className="cl-value">{EMAIL}</span>
    <span className="cl-action">{copied ? "Copied ✓" : "Copy →"}</span>
  </button>

  {linkedIn ? (
    <a
      className="contact-link"
      href={linkedIn.href}
      target="_blank"
      rel="noopener noreferrer"
    >
      <span className="cl-label">LinkedIn</span>
      <span className="cl-value">{linkedIn.value}</span>
      <span className="cl-action">Open ↗</span>
    </a>
  ) : null}
</div>
```

Also remove the imports/usages of `cvLabel` from this file if no other reference remains.

- [ ] **Step 2: Add `.contact-link-grid` styles**

Append to `globals.css`:

```css
.contact-link-grid {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 24px;
  align-items: stretch;
}
.contact-link-btn {
  appearance: none;
  background: none;
  border: inherit;
  font: inherit;
  color: inherit;
  text-align: left;
  cursor: pointer;
  /* inherit everything else from .contact-link */
}
.contact-link .cl-action { display: block; margin-top: 6px; }

@media (max-width: 720px) {
  .contact-link-grid { grid-template-columns: 1fr; }
}
```

If `.contact-elsewhere` styles are no longer referenced, delete them.

- [ ] **Step 3: Lint + build**

Run: `npm run lint && npm run build`
Expected: succeed.

- [ ] **Step 4: Visual check**

`npm run dev`. Scroll to Contact band:
- Two equal-size blocks side by side. Left: Email + value + "Copy →" (or "Copied ✓" after click). Right: LinkedIn + handle + "Open ↗".
- No CV link.
- Form below unchanged.

Click the Email block — value copies to clipboard, action label flashes "Copied ✓".

Stop dev server.

- [ ] **Step 5: Commit**

```bash
git add src/components/ContactSection.tsx src/app/globals.css
git commit -m "contact: equal Email/LinkedIn blocks, drop CV link"
```

---

## Task 7: Footer — email/LinkedIn alignment

**Files:**
- Modify: `src/app/globals.css`

The `<dl className="foot-contact">` already renders Email and LinkedIn as `<dt>`/`<dd>` pairs. This task only ensures their visual alignment matches.

- [ ] **Step 1: Inspect current alignment**

`npm run dev`. Open the homepage, scroll to the very bottom footer band. Note whether Email and LinkedIn labels (or values) are misaligned (different label width, different baseline, different value gap). If they already look identical, skip to Step 4.

- [ ] **Step 2: Lock label width + grid layout**

In `globals.css`, find or add a `.foot-contact` rule. Replace/append:

```css
.foot-contact {
  display: grid;
  grid-template-columns: minmax(80px, max-content) 1fr;
  column-gap: 24px;
  row-gap: 12px;
  align-items: baseline;
}
.foot-contact dt { white-space: nowrap; }
.foot-contact dd { margin: 0; }
```

(`display: contents` on the inner wrappers in `Footer.tsx` already lets `<dt>`/`<dd>` participate directly in the grid — leave the TSX alone.)

- [ ] **Step 3: Lint + build**

Run: `npm run lint && npm run build`
Expected: succeed.

- [ ] **Step 4: Visual check**

`npm run dev`. Footer:
- Email and LinkedIn labels align in the same column.
- Values align in the same column.
- Baselines match.

Stop dev server.

- [ ] **Step 5: Commit**

```bash
git add src/app/globals.css
git commit -m "footer: align email + LinkedIn rows"
```

---

## Task 8: Full-site sanity sweep

**Files:** none (verification only)

- [ ] **Step 1: Production build**

Run: `npm run lint && npm run build`
Expected: both succeed. No unused-import warnings.

- [ ] **Step 2: Cold dev sweep**

Run `npm run dev` and walk the homepage top to bottom in a browser:

- [ ] Nav: NL monogram top-left, plain links `Home · About · Projects · Notes ▾ · CV`, dark `Hire Me! →` pill far right. Hire Me scrolls to Contact. Notes hover doesn't flicker.
- [ ] Hero: eyebrow, big serif "Nathalie Lustig." with accent dot, bio line, single "Read the latest →" CTA, portrait with corner brackets.
- [ ] Right Now strip: two columns — "My go-to resources" (no Bloomberg standalone entry) + "On the bedside table" (second book reads "Next up", no "back in London"). No portrait in the strip.
- [ ] About: bio + sticky `RightNowBlock`; no Download CV or See my projects buttons.
- [ ] Projects: unchanged.
- [ ] Notes section: feature note + recent rows + "View all notes →".
- [ ] Ticker.
- [ ] Contact: header, two equal Email/LinkedIn blocks, no CV link, copy-on-click on Email works.
- [ ] Footer: Email and LinkedIn rows aligned identically.

- [ ] **Step 3: Mobile sweep**

Resize browser to ~390px wide:

- [ ] Hero stacks (text above portrait).
- [ ] Right-now strip stacks (reads above books).
- [ ] Contact links stack.
- [ ] Hamburger menu opens with Home · About · Projects · Notes (+ categories) · CV · Hire Me!.

- [ ] **Step 4: Other routes still render**

- [ ] `/notes` — index loads.
- [ ] `/notes/<some-slug>` — single note loads.
- [ ] `/about` — about page loads (header reused from layout).
- [ ] `/projects/<slug>` — a project case study loads.
- [ ] `/studio` — Sanity studio loads.

If any route breaks, the cause is almost certainly stale CSS deletions in Task 4 Step 4 — re-add the rule.

- [ ] **Step 5: Final commit (if any cleanup landed)**

If you adjusted anything during the sweep:

```bash
git add -A
git commit -m "homepage: final sweep cleanup"
```

Otherwise nothing to do.

- [ ] **Step 6: Remind user of Sanity Studio edits**

Surface to the user: "After deploy, open `/studio` and (a) delete the standalone 'Bloomberg' daily-read entry if it exists in CMS, (b) change the second book's status from 'Next up, back in London' to 'Next up'. The fallback files are now correct, but the live data may still come from Sanity."

---

## Self-review notes

- All spec sections (nav, hero, right-now strip, section order, About, Projects, Notes, Ticker, Contact, Footer) map to one or more tasks.
- The spec's `RightNowBlock` reference was a mis-naming — the actual homepage component is `RightRail`. The plan operates on `RightRail` (correct) and explicitly leaves the About-page `RightNowBlock` alone.
- The Sanity fallback caveat is called out at the top and at Task 1 / Task 8.
- No TBD / TODO / "handle edge cases" placeholders. Each code change shows full code.
