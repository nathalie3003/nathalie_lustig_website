# Homepage Redesign — Phase 1

**Date:** 2026-06-22
**Branch:** new branch off `main` (separate from `ticker-editorial`)
**Scope:** Structural reorder, content cleanup, and a new Alfie-Rees-inspired hero. Excludes any deeper visual reskin of About / Projects / Notes / Ticker — those stay as-is.

## Goals

1. Eliminate redundancy (duplicate name on homepage, redundant CV / "See my projects" buttons, redundant phrases like "Bloomberg.com" and "back in London").
2. Reorder the homepage so a recruiter sees who Nathalie is, then her work, then her writing, then the market band — not the other way around.
3. Introduce a confident, single-statement hero modeled on the Alfie Rees portfolio (big serif name, bio, one CTA, portrait on the right).
4. Make the navbar a Cole-Adrian-style strip: monogram on the left, links in the middle, a single "Hire Me!" pill on the right.
5. Fix the Notes-dropdown hover glitch.
6. Normalize the contact area so Email and LinkedIn render in the same slim format.

## Non-goals (deferred to a later phase)

- Visual reskin of the About, Projects, or Notes sections.
- Any change to Sanity schemas, queries, or content beyond the literal text edits listed below.
- New routes, new pages, or any change to `/notes`, `/projects`, `/about`, `/cv`.
- Mobile-first redesign (existing mobile menu stays; only the desktop nav structure changes, with mobile menu mirroring the new structure).

## Navbar

**Component:** `src/components/Nav.tsx` (`TopBar`).

**Desktop layout, left → right:**

- **NL monogram** — replaces the current "Nathalie Lustig" text link. Uses the existing favicon mark (`src/app/icon.png`) rendered inline as an `<img>` or inline SVG. Links to `/#top`. Small (~28–32px square).
- **Nav links** (plain text): `Home`, `About`, `Projects`, `Notes ▾`, `CV`.
  - `Home` is new; jumps to `#top` (same behavior as the existing monogram click).
  - `CV` is a plain text link (`/cv.pdf`, `download`) — no button styling.
  - `Notes` keeps its dropdown of categories.
- **Hire Me! →** — dark pill button (filled), right-aligned. Scrolls to the `#contact` section (same `jump("contact")` pattern as other anchor links).

**Notes hover fix.** Today the hover popover disappears when the cursor moves from the trigger into the popover, because there is a 0px gap between them. Fix:

- Add `padding-top` / `margin-top` to `.notes-pop` so trigger and pop overlap visually, and add a transparent bridge `::before` pseudo-element on `.notes-pop` covering the gap.
- Replace the immediate `onMouseLeave` close with an intent-style close: clear-on-enter timer + 120ms close-on-leave timer. Both trigger and pop share the same open/close handlers.
- Keep keyboard / Escape / outside-click behavior unchanged.

**Mobile menu.** Update the mobile pop list to match the new desktop structure: `Home`, `About`, `Projects`, `Notes`, category list, `CV`, and a `Hire Me!` row at the bottom.

**Content edits:**

- Drop the standalone `Download CV` button currently rendered between the links and the mobile-menu trigger (it's absorbed into the inline `CV` text link).
- Remove the `Nathalie Lustig` text from the top-left.

## Hero

**Component:** rewrite the `<section className="hero hero-slim">` block in `src/app/page.tsx`. Lift the markup into a new `src/components/Hero.tsx` server component for clarity.

**Layout.** Two-column grid on desktop (`grid-template-columns: 1fr 1fr` with a comfortable gap), stacking to a single column on narrow viewports. Full-width band, no right rail (the rail moves out — see "Right Now strip" below).

**Left column, top → bottom:**

1. Eyebrow: `PORTFOLIO · 2026` — small, uppercase, letter-spaced, muted color.
2. Headline: `Nathalie Lustig.` — large serif (existing display face), with the trailing period rendered in the accent color via a `<span>`.
3. Bio paragraph — uses the existing `hero.lead` string from `src/content/tone.ts`. (If the existing copy doesn't read well at this size, we can tighten it in implementation; no copy change required for this spec.)
4. Single CTA: `Read latest note →` — dark pill, links to the latest note (current `latestHref` logic).

**Right column.** The existing portrait already in `/public` (with the recent 80px crop nudge). Wrap in a `<figure>` with the four-corner-bracket frame seen in the Alfie reference: four small absolutely-positioned spans (`top-left`, `top-right`, `bottom-left`, `bottom-right`) drawn as L-shapes in the muted text color. The image itself uses `next/image` with priority loading.

**Removed from hero:**

- The big `Nathalie Lustig` `<h1>` is gone (replaced by the styled headline above).
- The `Download CV` button is gone.
- The right rail (`<RightRail />`) no longer sits beside the hero.

## "Right Now" strip

The contents of `src/components/RightRail.tsx` (which renders `RightNowBlock`) become a slim **horizontal** band sitting directly below the hero on `/`, before the About section. One row, three columns at desktop width, stacked at mobile.

**Three items:**

1. **Where I am** — current value, with `Bloomberg.com` removed from the body text. (Today the rail shows something like "Reading Points of Return on Bloomberg.com" — drop the trailing "on Bloomberg.com".)
2. **My go-to resources** — renamed from "What I'm reading". Same list of items.
3. **Next up** — drop the "back in London" prefix; show only the destination/event.

Implementation: edit `RightNowBlock.tsx` (or whichever component owns the labels) to use the new labels and trimmed strings, and adjust the wrapping `RightRail` (or a new wrapper) so it renders horizontally inside its own band on the homepage.

`RightRail` is currently only rendered inside the `.home` grid in `page.tsx`. Move the render into its own `<section className="band band-right-now">` (or similar) directly after the hero, and remove it from the `.home-main` grid.

## Section order

`/` now reads, top to bottom:

1. Hero (new)
2. Right Now strip
3. `AboutSection`
4. `ProjectsSection`
5. Notes block (the current homepage "Recent commentary" markup — feature note + recent rows + "View all notes →")
6. `MarketTickerPlaceholder`
7. `ContactSection`

The Notes block currently lives inside `.home-main` next to the right rail. It moves out into its own `<section className="section section-notes">` between Projects and the Ticker. The `.home-main` two-column grid goes away entirely.

`ContactFooter` continues to render below `ContactSection` from the layout (it is already rendered by `src/app/layout.tsx`).

## About section

**Component:** `src/components/AboutSection.tsx`.

**Edits only:**

- Remove the `<a href="/cv.pdf" download className="l-btn l-btn-cv">` button.
- Remove the `<Link href="/#projects" className="l-btn l-btn-ghost">See my projects →</Link>` button.
- Remove the wrapping `<div>` that held the two buttons if it becomes empty.

No other change.

## Projects section

No change.

## Notes block on homepage

No content change. Only structural: it moves out of the `.home-main` two-column grid and into a full-width section (see Section order). Markup and queries are untouched.

## Ticker

**Component:** `src/components/MarketTickerPlaceholder.tsx`.

No internal change. Only its position in `page.tsx` moves — from directly under the hero to between Notes and Contact.

## Contact section

**Component:** `src/components/ContactSection.tsx`.

**Layout change.** The `.contact-direct` block today renders Email as a large three-line block and LinkedIn / CV as slim two-line links. Replace with **two equal slim blocks side by side**, both following the existing `.contact-link` shape:

```
EMAIL                              LINKEDIN
nathalie.lustig03@gmail.com        linkedin.com/in/nathalie-lustig ↗
Copy →                             Open ↗
```

- Email becomes a `<button>` with the same `.contact-link` styles as LinkedIn (label / value / action rows). The on-click handler is the existing `onCopy` flow. The "Copied ✓" flash continues to work.
- LinkedIn is the existing slim link.
- **CV link is removed.**
- Both blocks share the same width / padding / typography. The grid that holds them becomes a 2-column equal grid.

Contact form below it is unchanged.

## Footer

**Component:** `src/components/Footer.tsx` (`ContactFooter`).

The `<dl className="foot-contact">` already renders Email and LinkedIn as `<dt>`/`<dd>` pairs. Audit the existing CSS so the two rows render with identical label widths and value alignment. No structural change expected — likely a small CSS pass.

## Content / copy edits summary

All literal text changes live in:

- `src/content/tone.ts` and/or `src/content/about.ts` (right-now strings, if currently sourced here)
- The "Right Now" component(s) for label rename ("What I'm reading" → "My go-to resources")

No new strings beyond the eyebrow (`PORTFOLIO · 2026`) and the section label changes.

## CSS

Existing class names stay where possible. New / changed classes:

- `.top-mark` (NL monogram) — small image / svg wrapper.
- `.top-link.top-link-cv` — plain text variant of CV link.
- `.l-btn-hire` or reuse of an existing dark pill class for `Hire Me! →`.
- `.notes-pop` — adjusted padding + transparent bridge; intent-style hover handled in TS, not CSS.
- `.hero-v2` (or similar) — new two-column hero grid; old `.hero-slim` styles can be dropped.
- `.hero-portrait`, `.hero-portrait-frame` — image + bracket frame.
- `.band-right-now` — full-width slim band.
- `.contact-link-grid` — 2-col equal grid for Email + LinkedIn.

The current `.home` / `.home-main` two-column grid is removed.

## Architecture / boundaries

- `Hero.tsx` (new) — pure presentation server component. Inputs: `latestHref: string`. Imports `hero` from `tone.ts`.
- `RightNowStrip.tsx` (new wrapper, or rename `RightRail` and reshape) — slim horizontal band; same underlying `RightNowBlock` data.
- `Nav.tsx` — adds NL monogram, restructures links, adds Hire Me pill, fixes hover intent. State for `notesOpen` continues to live here.
- `AboutSection.tsx` — button block removed.
- `ContactSection.tsx` — Email becomes a slim block; CV removed.
- `Footer.tsx` — no logic change.
- `page.tsx` — flat list of sections in the new order, no `.home-main` grid.

Each component is independently testable / understandable. The reorder reduces coupling: `page.tsx` becomes a clean sequence rather than a grid hosting overlapping responsibilities.

## Out of scope (explicit)

- The `Notes ▾` dropdown content stays as today (note categories). Newsletters / "go-to resources" live only in the Right Now strip.
- No change to the favicon itself; only its use as a nav monogram.
- No new content in About; only the buttons leave.
- No reskin of the Ticker (band already redesigned recently).

## Risks / open items

- The portrait crop may need a slight re-tune for the Alfie-style two-column hero (existing 80px nudge was tuned to the old layout). Implementation will check this against the new container ratio and adjust if needed.
- The Notes hover fix relies on a small bridge pseudo-element; we will sanity-check that it doesn't catch clicks meant for elements behind it.
- "Hire Me!" copy: confirmed; if the tone feels too informal in context, easy single-line copy swap later (not blocking).
