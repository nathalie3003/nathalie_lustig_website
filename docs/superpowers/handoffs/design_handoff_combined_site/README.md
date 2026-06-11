# Handoff: Nathalie Lustig — Combined Personal Site

## Overview
A personal site for Nathalie Lustig — an LSE Economics graduate and ex-J.P. Morgan
analyst who writes twice-weekly notes on bond markets (rates, credit, sovereign
issuance). The "combined site" unifies what were previously separate explorations
(home, notes, about, projects) into **one cohesive architecture**:

- A **sticky top bar** with the name, inline section links, a burger "Menu"
  dropdown, and a persistent "Download CV" button.
- A **single long-scroll home page**: hero → latest notes (with a sticky right
  rail) → About band → Projects band.
- **Full-width detail views** that swap into the main column: an individual
  **note reading page** and a **CV page**.
- A **persistent contact footer** on every view.
- A **tone switcher** (floating pill, bottom-center) that swaps the site's voice
  copy between three packs — "Desk note", "Personal", "Punchy" — without changing
  the underlying content.

The visual language is **"Ink & Cobalt"**: near-black ink on a cool off-white,
a single cobalt-blue accent, Source Serif 4 for editorial type, Inter for UI/meta.

## About the Design Files
The files in this bundle are **design references created in HTML/React-via-Babel** —
a prototype demonstrating the intended look, layout, copy, and interaction model.
They are **not production code to ship directly**. The Babel-in-the-browser setup,
the `image-slot.js` web component, and the `localStorage` route persistence are
prototype scaffolding.

**The task is to recreate this design in the target codebase's environment.** The
live site is a Next.js app deployed on Vercel (`nathalie-lustig-website.vercel.app`),
so the natural target is **React + Next.js**. Rebuild the screens below as Next.js
pages/components using the project's existing conventions (file-based routing,
real `<Image>`, real CMS/MDX content), reproducing the visual design pixel-for-pixel.
If you are starting fresh, any modern React framework is fine — the CSS in
`site.css` is plain and portable.

## Fidelity
**High-fidelity (hifi).** Final colors, typography, spacing, radii, shadows, and
interactions are all specified here and in `site.css`. Recreate the UI
pixel-perfectly. The only deliberately unfinished pieces:
- **Images** are drag-to-fill placeholders (`<image-slot>`) in the prototype —
  the portrait, project favicons, and book covers. Replace with real images.
- The **CV "Download PDF"** button is a stub (`href="#"`) — wire it to the real PDF.
- The note-detail **chart figure** is a CSS-gradient placeholder — replace with a
  real chart (rebuilt from Bloomberg/market data) or an image.

---

## Design Tokens
All defined as CSS custom properties at the top of `site.css` (`:root`).

### Color
| Token | Value | Use |
|---|---|---|
| `--bg` | `#F7F8FA` | Page background (cool off-white) |
| `--surface` | `#FFFFFF` | Cards, top bar fill, footer, About band |
| `--ink` | `#14161A` | Primary text / headings |
| `--ink-72` | `rgba(20,22,26,0.72)` | Body text, leads |
| `--ink-60` | `rgba(20,22,26,0.60)` | Excerpts, secondary body |
| `--ink-45` | `rgba(20,22,26,0.45)` | Meta, smallcaps, captions |
| `--accent` | `#2F6FED` | Cobalt accent — links, primary buttons, tags, kickers |
| `--accent-soft` | `#EAF1FE` | Tag/hover backgrounds, slot placeholders |
| `--rule` | `#E6E8EC` | Hairline borders / dividers |

Status pills (Projects): live = `#1F7A4D` on `#E6F4EC`; in-build = `#9A6B00` on `#FBF1DC`.

### Type
- **Serif** `--font-serif`: `'Source Serif 4', Georgia, serif` — names, headings,
  note titles, body prose, menu rows.
- **Sans** `--font-sans`: `'Inter', -apple-system, system-ui, sans-serif` — buttons,
  kickers, smallcaps, meta, nav, rail role, captions.
- Google Fonts import (in `<head>`): Source Serif 4 (opsz 8–60, wght 400/500/600/700)
  + Inter (400/500/600).

Key sizes (see `site.css` for the full set):
| Element | Size / weight / tracking / line-height |
|---|---|
| Hero name (`.hero-name`) | 56px / 600 / -0.028em / 1.0 |
| Hero lead (`.hero-lead`) | 21px / 1.5 / `--ink-72`, max-width 22em |
| Note title in list (`.note-title`) | 23px / 600 / -0.014em / 1.22 |
| Note excerpt (`.note-excerpt`) | 16px / 1.5 / `--ink-60` |
| Read page title (`.read-title`) | 42px / 600 / -0.024em / 1.06, `text-wrap: balance` |
| Read body `p` | 19px / 1.72 / `--ink` |
| Read pull-quote (`.read-quote`) | 23px / italic / 500, 3px left accent border |
| About / Projects title | 38px / 600 / -0.022em |
| Footer lead (`.foot-lead`) | 28px / 600 / -0.018em / 1.25 |
| Kicker (`.l-kicker`) | 12px Inter 600, 0.12em tracking, uppercase, accent |
| Smallcaps (`.l-smallcaps`) | 12px Inter 500, 0.1em, uppercase, `--ink-45`, tabular nums |
| Tag (`.l-tag`) | 11px Inter 600, 0.06em, uppercase, accent on accent-soft, pill |

### Spacing / radius / shadow
- `--pad: 56px` (page gutter; → 32px ≤920w, 20px ≤560w) · `--maxw: 1180px`.
- Radii: `--radius: 12px`, `--radius-sm: 9px`, `--radius-card: 16px`, pills `999px`.
- Button (`.l-btn`): 11px/20px padding, 13.5px Inter 500, radius 12px,
  `translateY(-1px)` on hover.
  - Primary: white on `--accent`, shadow `0 2px 8px rgba(47,111,237,0.22)` →
    `0 6px 16px rgba(47,111,237,0.28)` on hover.
  - Ghost: `--ink` on `--surface`, 1px `--rule` border → `--ink-45` border on hover.
  - `.l-btn-sm`: 9px/16px, 13px.
- Card shadow on hover (Projects): `0 8px 24px rgba(20,22,26,0.07)`.
- Menu dropdown shadow: `0 18px 50px rgba(20,22,26,0.16)`.
- Transitions: 120ms ease for color/background/transform; menu pop 140ms
  `cubic-bezier(0.2,0.7,0.2,1)`.

---

## Screens / Views

### 1. Top Bar (persistent) — `TopBar` in `site-parts.jsx`
- **Layout**: sticky, `z-index 40`, translucent `--bg` at 85% + `backdrop-filter: blur(10px)`,
  1px bottom rule. Inner row maxw 1180, padding `15px 56px`, space-between.
- **Left**: name "Nathalie Lustig" (17px serif 600) — click scrolls to `#top`.
- **Right** (`gap: 12px`): inline links Notes / About / Projects (14px Inter 500,
  `--ink-72`, hover → ink on `--accent-soft`, hidden ≤760px); a **Menu** button
  (bordered, animated 3-bar → X icon on open); a primary **Download CV** small button.
- **Dropdown** (`.menu-pop`): 280px card, opens below-right with a 140ms pop. Rows:
  Notes (+ 3 category sub-rows: Rates / Credit / Sovereigns, each with a sub-label),
  a divider, About, Projects. Each row shows a serif title + Inter sub-label; hover
  fills `--accent-soft`. Closes on outside-click or Escape.
- **Behavior**: link/row clicks call `scrollToSection(id)` when on home; from a
  detail view they `navigate({name:'home', scroll:id})` and the app scrolls after render.

### 2. Home — `HomePage` in `site-parts.jsx`
Two-column grid: `minmax(0,1fr) 312px`, `gap: 60px`, gutter 56px. Right rail collapses below content ≤920px.

**Hero** (`.hero`, padding `72px 0 26px`):
- Kicker (tone-driven, e.g. "Fixed income notes") · `Nathalie Lustig` H1 (56px) ·
  lead paragraph (21px, max 22em) · creds smallcaps · CTA row:
  primary "Read the latest →" (→ latest note) + ghost "About me →" (scrolls to About).

**Latest notes** (`.section`, top rule):
- Eyebrow head (tone-driven). List of `.note-row` buttons, grid
  `124px minmax(0,1fr) auto`, gap 22px, 22px vertical padding, bottom rule each.
  - Col 1: date smallcaps (tabular). Col 2: title (23px serif) + excerpt (16px).
    Col 3: category tag pill (centered). Hover turns the title cobalt.
  - Click → note detail. Five notes seeded (one real "Private Credit !", four sample).
  - ≤560px collapses to one column and hides the tag.

**Right rail** (`.rail-card`, `RightRail`): white card, 1px rule, radius 16, sticky
`top: 86px`. Square portrait slot → role paragraph (Inter 13.5) → stacked CTAs
(primary "Read the latest →", ghost "Download CV") → **"What I'm reading"** block
(newsletter links: FT, Bloomberg, Points of Return, WSJ, Eye on the Market — each a
row with name + host, bottom rule) → **"On the bedside table"** block (book rows:
46×68 cover slot + status/title/author).

**About band** (`.band-about`, `AboutSection`): `--surface` bg, top rule, padding
`60px 0 64px`. Kicker "About" + H2 "A bit more about me". Grid `minmax(0,1fr) 300px`,
gap 56: bio (3 paragraphs, 18px/1.72) + actions (primary "Download CV", ghost
"See my projects →") on the left; sticky 3:4 portrait slot (`top: 90px`) on the right.

**Projects band** (`.band-projects`, `ProjectsSection`): `--bg` bg, padding
`60px 0 72px`. Kicker "Projects" + H2 "Things I'm building". Stacked `.proj-card`s
(max-width 760, gap 16): grid `64px minmax(0,1fr)` — favicon slot + body
(title + status pill + url + description + status-note). Hover lifts the card with a
cobalt-tinted border and soft shadow. Two projects: "Little Miss London Jewellery"
(in-build) and "Book Portfolio" (live).

### 3. Note detail — `NotePage` in `site-pages.jsx`
- Replaces the home content in `<main>`; maxw 880, gutter 56, scrolls to top on open.
- "← All notes" back button (→ home, scroll to notes).
- Header: tag pill + date·read-time smallcaps; title (42px, balance); excerpt (20px);
  byline ("By Nathalie Lustig", or "Sample note · seeded to show typography").
- Body renders typed blocks: `p` (19px/1.72), `h2` (26px), `quote` (italic 23px with
  left accent rule), `figure` (16:8 cobalt-gradient placeholder + caption).
- Footer: "Next note" smallcaps + ghost button to the next note (wraps around).

### 4. CV page — `CVPage` in `site-pages.jsx`
- maxw 880; "← Back to site" button. Kicker "Curriculum Vitae" + name H1 + creds lead.
- Actions: primary "Download PDF" (**stub — wire up**) + ghost "Read the long version →"
  (→ home, scroll to About). Below: the About bio paragraphs (max 640).

### 5. Contact footer (persistent) — `ContactFooter` in `site-parts.jsx`
- `--surface` bg, top rule, `margin-top: 64px`. Inner grid `minmax(0,1fr) auto`, gap 48:
  lead "Happy to chat about bonds, books, or anything in between." (28px, balance) +
  a contact `<dl>` (Email / LinkedIn / Phone, `76px 1fr` grid).
- Bottom bar: "© 2026 Nathalie Lustig" · "Notes on the fixed income market".

### 6. Tone switcher — in `site-app.jsx`
- Fixed pill, bottom-center, `z-index 60`, dark translucent bg. "Tone" label + three
  options (Desk note / Personal / Punchy); active = white pill on ink. Persists to
  `localStorage` key `nl_tone`.
- **This is a prototype affordance for comparing voices** — in production, pick ONE
  tone with Nathalie and drop the switcher (or keep it as an internal toggle only).

---

## Interactions & Behavior
- **Routing**: prototype uses in-app state, not URLs. `route` is `{name, slug?}` where
  `name ∈ {home, note, cv}`, persisted to `localStorage` key `nl_route`. In Next.js,
  map these to real routes: `/` (home), `/notes/[slug]` (note), `/cv` (CV).
- **Section navigation**: `window.scrollToSection(id)` smooth-scrolls to `#top`,
  `#notes`, `#about`, `#projects`, offset 70px for the sticky bar. From a detail view,
  navigation routes home first, then scrolls after paint (double-rAF in `site-app.jsx`).
- **Menu dropdown**: toggle button; closes on outside mousedown or Escape; animated
  hamburger↔X; 140ms pop-in.
- **Hover states**: buttons lift 1px; note-row title → accent; project card lifts +
  tinted border + shadow; links underline / shift to accent.
- **Tone switch**: swaps all voice copy live from `window.TONES` (see below).
- **Reduced motion**: `html { scroll-behavior: smooth }` — gate behind
  `prefers-reduced-motion` in production.

### Responsive
- ≤920px: rail and About portrait drop below content; gutter 32px; hero 46px; read 34px.
- ≤760px: inline top-links hidden (Menu button remains).
- ≤560px: gutter 20px; note rows single-column, tag hidden; menu dropdown full-width;
  tone label hidden.

## State Management
- `toneKey` → which tone pack is active (localStorage `nl_tone`).
- `route` → `{name, slug?}` current view (localStorage `nl_route`).
- `open` (TopBar) → dropdown visibility.
- `pendingScroll` ref → section to scroll to after a home re-render from a detail view.
- Production: replace localStorage routing with the framework router; content
  (`SITE_CONTENT`) and tone copy (`TONES`) should come from a CMS/MDX, not a JS literal.

---

## Content & Data
- **`content.js`** → `window.SITE_CONTENT`: the real, tone-independent content —
  name, tagline, `dailyReads` (newsletters), `about` (bio paragraphs + contact),
  `projects`, `books`, and `notes` (5; note 1 real, 2–5 sample, flagged `sample:true`).
  Each note: `slug, title, date, dateLong, excerpt, sample, body[]` where body blocks
  are `{type:'p'|'h2'|'quote'|'figure', ...}`.
- **`site-content.js`** → `window.TONES` (3 voice packs) plus helpers
  `window.readHost(href)` (pretty newsletter host) and `window.noteCat(slug)`
  (category + read-time map). Only *voice* copy differs between tones; notes,
  projects, contacts, newsletters are constant. The contact-footer line is identical
  across all tones (kept verbatim by request).

## Assets
No raster assets are shipped — all imagery is a fillable `<image-slot>` placeholder:
- Hero/rail **portrait** (square + 3:4 in About) — needs a real photo.
- **Project favicons** (`proj-lml`, `proj-books`) — 64×64 logos.
- **Book covers** (`book-age-of-innocence`, `book-investors-handbook`) — 46×68.
- Note-detail **chart figure** — CSS gradient placeholder; replace with a real chart/image.
- CV **PDF** — `Download PDF` is a stub.
In production, use the framework's image component and real files; `image-slot.js` is
prototype-only and can be discarded.

## Files (in this bundle)
| File | Role |
|---|---|
| `Combined Site.html` | Entry point — open this to view the prototype |
| `site.css` | All styles + tokens (392 lines, the source of truth for visuals) |
| `site-app.jsx` | App shell: routing, tone state, tone switcher |
| `site-parts.jsx` | TopBar, RightRail, ContactFooter, HomePage + `scrollToSection` |
| `site-pages.jsx` | NotePage, AboutSection, ProjectsSection, ProjectCard, CVPage |
| `content.js` | `SITE_CONTENT` — real content (notes, projects, about, reads, books) |
| `site-content.js` | `TONES` voice packs + `readHost` / `noteCat` helpers |
| `image-slot.js` | Prototype-only drag-to-fill image placeholder web component |

### Running the prototype
Open `Combined Site.html` over HTTP (e.g. `npx serve` in this folder) — the JSX is
compiled in-browser by Babel and the scripts load by relative path, so a `file://`
open may be blocked by CORS. React, ReactDOM, and Babel load from unpkg CDN.

## Notes for the developer
- `site.css` is plain, portable CSS with custom properties — lift it wholesale and
  split per-component as your conventions prefer.
- The **tone switcher is a comparison tool**, not a shipping feature — confirm the
  final tone and remove it.
- Five notes are seeded; only "Private Credit !" is real. The four sample notes exist
  to prove typography/density — don't ship them as Nathalie's writing.
- Keep the cobalt accent single-use and the serif/sans split intact — that pairing is
  the identity.
