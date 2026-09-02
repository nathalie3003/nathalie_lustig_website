# The Basis Point: structure and layout redesign

Date: 2026-09-02
Source: Claude Design project `3cc303b6-ed23-449f-802b-38d50aaa0724`, exported as
`The Basis Point redesign-handoff.zip`. Primary file: `project/The Basis Point.dc.html`.

## Goal

Rebuild the site's structure and layout to match the exported design: a blush-paper
and raspberry palette replacing French Blue on cool grey, a three-face type system,
a restructured header, and reworked Home, Notes, Article and About pages.

Shipped in five reviewable steps. Each step is its own branch and PR with a Vercel
preview; nothing merges before Nathalie reviews the preview.

## Decisions taken

| Question | Decision |
| --- | --- |
| Shared chrome vs page-by-page | Foundations ship first as step 1; pages follow one at a time |
| Market ticker strip | **Out of scope.** Gilt and JGB aren't in the Treasury feed |
| Curve maturity selector | **In scope**, backed by real FRED history, not the prototype's synthetic series |
| Replies / comments | **In scope.** Publish immediately, email notification on each |
| Design system page | **Out of scope** |
| Replies availability | Every note |
| Review mechanism | Branch + Vercel preview per step |
| Execution | Claude designs the edits; Sonnet subagents apply them; verification is central |
| Contact band sky image | `sky-lilies.jpeg` for now. Provenance unresolved, Nathalie to replace later |

## Structural change worth calling out

In the prototype, nav "About" changes view while "Projects" scroll-jumps to a home
section. So:

- `/about` becomes a **real page** (currently a `permanentRedirect` to `/#about`)
- `AboutSection` leaves the homepage
- `/projects` stays a redirect to `/#projects`; Projects remains a home section
- The contact band renders on **every** page (in the prototype it sits outside the
  view switch), not just the homepage

Nav link targets do **not** change during foundations. `About` keeps pointing at
`/#about` until step 5 builds the real page, so no step ever ships a broken link.

## Design tokens

Existing CSS custom property *names* are kept and repointed. Renaming would mean
touching every consumer at once; repointing keeps each step's diff readable.

| Token | Old | New | Role |
| --- | --- | --- | --- |
| `--bg` | `#F7F8FA` | `#FCFAF9` | Blush paper, page ground |
| `--surface` | `#FFFFFF` | `#FFF7F9` | Card, raised surfaces |
| `--tint` *(new)* | n/a | `#F5EBEA` | Bands, thumbnails |
| `--rule` | `#E6E8EC` | `#EADFDD` | Hairlines |
| `--rule-strong` | `#D4D7DD` | `#E0C6CE` | Emphasised hairlines |
| `--ink` | `#14161A` | `#191316` | Text, dark band |
| `--ink-72/60/45/20` | `rgba(20,22,26,…)` | `rgba(25,19,22,…)` | Ink at opacity |
| `--accent` | `#3A5F8A` | `#B23A63` | Raspberry: actions, links, labels |
| `--accent-deep` *(new)* | n/a | `#7A2246` | Plum: hover, depth |
| `--accent-soft` | `#E7ECF3` | `#F7ECEF` | Hover fills |
| `--petal` *(new)* | n/a | `#F7D9E3` | Selection, gradients |
| `--card-dark` | `#0F1C2E` | `#191316` | Dark cards |
| `--french-blue-soft` | `rgba(58,95,138,.09)` | `rgba(178,58,99,.09)` | Tinted fills |
| `--nav-bg` | `#FFFFFF` | `#FCFAF9` | Header ground |
| `--accent-warm` | `#A87B5C` | **removed** | Defined but never consumed |

Eight hardcoded `rgba(58,95,138,…)` shadows in `globals.css` move to raspberry.
`src/app/opengraph-image.tsx` carries hardcoded `20,22,26` ink and needs the same
treatment.

## Typography

Three faces, all via `next/font/google` so there is no layout shift:

- **Source Serif 4**: headings, body, editorial. Unchanged.
- **Instrument Sans**: UI, buttons, nav. Replaces Inter on `--font-sans`.
- **IBM Plex Mono**: dates, read times, category labels, numbers. New, on `--font-mono`.

## Step 1: Foundations

Shared chrome only. No page layout changes; every page reskins.

1. Copy `sky-lilies.jpeg` from the export into `public/`.
2. `layout.tsx`: swap Inter for Instrument Sans, add IBM Plex Mono, register
   `--font-mono` on `<html>`.
3. `globals.css`: repoint tokens per the table above, update hardcoded rgba,
   `::selection` becomes petal.
4. `BasisPointMark.tsx`: replace the navy aurora-rim badge with the design's flat
   ink circle and `#FCFAF9` "bp" in Source Serif 4. The aurora gradient runs blue
   through orange and cannot survive the palette change.
5. `Nav.tsx`: three-zone grid, badge and wordmark left, nav centred, "Get in touch"
   outline button right. Button label changes from "Let's talk more". Notes
   dropdown keeps its blurbs.
6. `Chrome.tsx`: render `ContactSection` above the footer on every non-studio page.
7. `ContactSection.tsx`: sky background with gradient wash, two columns. Eyebrow,
   heading and italic line left; email row with copy button and LinkedIn row right.
   Fold-in on scroll.
8. `Footer.tsx`: reduce to the single bar. Drop the article-only contact block, now
   superseded by the site-wide contact band. No design-system link.

The existing masthead wipe and first-visit wordmark reveal are accent-coloured and
structural; both survive and come through in raspberry.

## Step 2: Home

Hero at 76px display with the rotating category word (`DeskNotesRotator`, restyled),
Treasury curve card in the right column, featured-note card, note rows with 96px
thumbnails, sticky rail whose portrait collapses to an avatar on scroll, then the
projects stack. `AboutSection` and the standalone `YieldCurve` section come out;
the curve moves into the hero.

`StackingProjects.tsx` already implements the sticky scroll-stack with framer-motion
and lenis. It is a restyle, not a rebuild.

### Curve data

`getYieldCurve()` keeps fetching Treasury CSV for today's snapshot, which is a full
business day fresher than FRED. A new FRED fetcher supplies per-tenor history using
the existing `FRED_API_KEY`: series `DGS3MO`, `DGS6MO`, `DGS1`, `DGS2`, `DGS3`,
`DGS5`, `DGS7`, `DGS10`, `DGS20`, `DGS30`, from 2021, downsampled to quarterly.

"All maturities" renders today's real curve; selecting a tenor renders that tenor's
real history. Both fall back to the existing snapshot behaviour on fetch failure.

## Step 3: Notes archive

Three-column rows (date, title plus deck, read time) with category pills above.
Existing `?category=` filtering is unchanged.

## Step 4: Article

Reading-progress bar, mono meta strip, cover, body, sources, replies, keep-reading.
`sources` already exists on the `bondNote` schema, so no schema work for it.

### Replies

New Sanity document type `reply`: reference to the note, name, text, timestamp,
`hidden` boolean.

`POST /api/replies`:

1. Validate name and text length; reject empty text.
2. Check the honeypot field, a CSS-hidden input humans never see. Non-empty means
   a bot: discard silently and return success.
3. Rate limit by IP.
4. Write via `SANITY_API_WRITE_TOKEN`.
5. Send a notification email via Resend.

Replies render live, newest first, with `hidden` filtered out, so pulling a bad one
is a single toggle in Studio. Anonymous posting, no account, as the prototype reads.

**Blocked on Nathalie:** Resend account and `RESEND_API_KEY`. Claude cannot create
accounts. Everything else uses credentials already in `.env.local`.

## Step 5: About

`/about` becomes a real page: bio, "Right now" two-column card grid, six-photo life
carousel with captions and dots, get-in-touch card. Nav "About" flips from `/#about`
to `/about`. The six `life-*.jpg` files copy over from the export into `public/`.

## Out of scope

- Market ticker strip
- Design system page
- Replacing the sky image (Nathalie will choose one she owns)
- Re-tagging existing CMS content

## Known follow-ups

`DESIGN.md` at the project root documents the old French Blue system (`#3A5F8A`,
cool paper `#F7F8FA`, Desk Tan) and the masthead grammar built around it. It is
stale from step 1 onward, and `CLAUDE.md` instructs agents to read it before any
design work, so it will actively misdirect. Needs rewriting for the blush palette.

## Open risk

The four `sky-*` images have unresolved provenance. The default, `sky-lilies.jpeg`,
entered the design project from a file named after the Museum of Fine Arts Boston's
Monet Zoom-background page. The painting is out of copyright; a museum's photograph
of it released for video calls is not obviously cleared as a site background.
Shipping it for now at Nathalie's direction, to be replaced before this matters.
