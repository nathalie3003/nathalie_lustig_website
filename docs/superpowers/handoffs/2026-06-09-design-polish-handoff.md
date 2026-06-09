# Design Polish Handoff — Nathalie Lustig Personal Website

**Date:** 2026-06-09
**From:** Engineering session
**To:** Design pass (aesthetic polish only — no structural changes)
**Repo:** https://github.com/nathalie3003/nathalie_lustig_website
**Live URL:** https://nathalie-lustig-website.vercel.app

---

## What this site is

A personal website for Nathalie Lustig — recent LSE graduate, ex-J.P. Morgan summer analyst, CFA Level I, interest in bonds. Two audiences:

1. **Primary: recruiters in DCM / Fixed Income Sales** who land here from a CV, LinkedIn, or referral. They should immediately get *who she is* and see *evidence she writes about bonds regularly*.
2. **Secondary: Nathalie herself**, who uses it as her daily homepage (footer has icon links to the 5 publications she reads every morning).

The bond-notes feed (twice-weekly short pieces) is the strongest recruiter signal. Everything else (About, Projects, daily reads) supports it.

---

## What is already built

- Next.js 15 (App Router) + TypeScript + Tailwind CSS v4 (CSS-first `@theme` config)
- Sanity (v4 + next-sanity v11) for the CMS, embedded at `/studio`
- Vercel auto-deploys on push to `main`
- Sanity → Vercel webhook for instant revalidation on publish
- All pages live and functional. Real content is in.

### Routes

| Path | Status |
|---|---|
| `/` | Hero + 3 latest notes |
| `/notes` | Full chronological list |
| `/notes/[slug]` | Single note (Portable Text rendering with images) |
| `/about` | Bio + CV download + Get in touch section |
| `/projects` | LittleMissLondon + Book Portfolio cards |
| `/studio` | Password-protected Sanity Studio (do not touch) |
| `/api/revalidate` | Webhook receiver (do not touch) |

### Tech notes for the design pass

- **Tailwind v4 — CSS-first config.** Design tokens live in `src/app/globals.css` under `@theme`, not in a `tailwind.config.ts`. To add or change a color, edit the `--color-*` custom property in that file.
- **Fonts:** Source Serif 4 (headlines, body in notes) + Inter (UI, dates). Loaded via `next/font/google` in `src/app/layout.tsx`.
- **Studio routes are dynamic** (`/studio/[[...tool]]`). Do not break or restyle these — they're Sanity's own UI living inside our site shell.
- **Path warning:** project directory contains an apostrophe (`/Users/nathalielustig/Documents/Nathalie's Website`) which breaks Next 15's favicon metadata loader. Favicon lives at `src/app/icon.png` (NOT `src/app/favicon.ico`) for this reason. Don't rename.

---

## Current design system

These are the baselines — adjust freely if you have a stronger view, but understand the intent before changing.

| Token | Value | Use |
|---|---|---|
| `--color-background` | `#FAF8F3` | Off-white page background |
| `--color-ink` | `#1A1A1A` | Near-black body text |
| `--color-navy` | `#0A2540` | Links, buttons, accent rules |
| `--color-warm` | `#B45309` | Hover state only (links, button hover) |
| `--color-rule` | `#E5E0D5` | Hairline dividers |
| `--font-serif` | Source Serif 4 | All headlines, all body text in notes |
| `--font-sans` | Inter | Nav, metadata, dates, UI labels |
| `--container-prose` | `680px` | Max width for reading columns |

**Aesthetic intent:** editorial / FT-style. Restrained. Generous white space. Narrow reading column. Hairline dividers. No drop shadows, no gradients. Hover underlines on links (subtle). Dates set in small caps (`.smallcaps` class).

Why: the audience is recruiters in serious markets jobs. The site itself is a signal — disciplined typography says "this person can think clearly."

---

## What the design pass should focus on

Things most likely to want refinement, in priority order:

### 1. Typographic hierarchy

- The current headline scale (`text-5xl` hero, `text-4xl` page, `text-2xl` section) is fine but un-tuned. Look at line-height, letter-spacing, the relationship between sizes on real content.
- Body text inside notes uses `text-lg leading-relaxed` (about 18px). Verify this feels like a comfortable read on a real note, not too cramped, not too sparse.
- Dates currently use the `.smallcaps` utility in `src/app/globals.css`. Check that the spacing (`letter-spacing: 0.08em`) feels right.

### 2. Hero section

- File: `src/app/page.tsx`
- Currently text-only (no headshot). The block is just name + tagline + CV button. There may be more elegant compositions — a thin rule below the name, a tighter tagline alignment, something subtle.
- Tagline: *"Writing on bond markets, twice a week. LSE graduate, ex-J.P. Morgan, CFA Level I."*

### 3. Notes index

- File: `src/app/notes/page.tsx` + `src/components/NoteCard.tsx`
- Cards are currently a stack of: date (small caps) → title (serif 2xl) → optional excerpt → hairline divider.
- Worth asking: does this scan well when there are 5 notes? 15? Does it need more breathing room? Should excerpts be styled differently?

### 4. Single note page

- File: `src/app/notes/[slug]/page.tsx` + `src/components/PortableText.tsx`
- The PortableText renderer styles headings, paragraphs, blockquotes, links, and inline images. Walk through a real note and check the rhythm — paragraph spacing, blockquote treatment, caption styling on images.

### 5. About page

- File: `src/app/about/page.tsx`
- Three paragraphs of bio, CV download button, then a "Get in touch" section with email / LinkedIn / phone in a small `dl` grid. The contact `dl` styling is rough — could be more elegant.

### 6. Projects page

- File: `src/app/projects/page.tsx` + `src/components/ProjectCard.tsx`
- Two cards in a 2-column grid (on `sm:` breakpoint and up). Image aspect 4:3, title in serif, description below. Hover state turns title warm-color.

### 7. Footer

- File: `src/components/Footer.tsx`
- 5 daily-read icon links as 36×36 circles with 2-3 letter short codes. The short-code typography is functional but plain; could be more refined.

---

## What the design pass should NOT do

- **Do not restructure routes.** The site map is approved and shipped.
- **Do not change the CMS or Sanity integration.** Anything under `sanity/`, `sanity.config.ts`, `src/app/studio/`, `src/app/api/revalidate/`, `src/lib/sanity.client.ts`, `src/lib/queries.ts` is structural — leave it alone.
- **Do not introduce a new tech dep** (e.g., Framer Motion, a UI kit, a new font library) unless it earns its weight. The site is fast and dependency-light; keep it that way.
- **Do not introduce dark mode.** The off-white editorial palette is the brand.
- **Do not soften the recruiter focus.** This site is professional first.

---

## Outstanding content TODOs (deferred — not the design pass's job)

The user is handling these separately:
- Real headshot for the homepage hero (currently skipped — hero is text-only)
- A custom `NL` monogram favicon (currently a navy placeholder — user will replace with a designed monogram, like Monica Vinader's MV)
- A custom OG image for social sharing (currently default)
- Real project card image for Book Portfolio (currently navy placeholder)
- Domain purchase (`nathalielustig.com`)

If the design pass produces *recommendations* for the headshot framing, monogram style, or OG image composition, those are welcome as notes — but don't generate the assets here.

---

## Voice and tone of the writing

For reference when judging whether design choices match the content's tone. From Nathalie's About page (her own voice):

> Hi, I'm Nathalie. I recently graduated from the London School of Economics with a BSc in Economics and Social Policy, and passed CFA Level I earlier this year. Last summer I worked at J.P. Morgan's Global Private Bank as a Summer Analyst — supporting bankers and investors on client portfolios, market analysis, and weekly updates for senior management.
>
> What I keep coming back to are bonds — rates, credit, sovereign issuance, restructuring — the way these moving parts price the economy in real time.

Warm, personal, but quantitatively confident. The design should match that — humane editorial, not corporate template.

---

## Files map (quick reference)

```
src/
├── app/
│   ├── globals.css           ← all design tokens live here (@theme)
│   ├── layout.tsx            ← fonts, metadata, Chrome wrapper
│   ├── page.tsx              ← homepage hero + latest notes
│   ├── icon.png              ← favicon (placeholder; user will replace)
│   ├── about/page.tsx
│   ├── notes/page.tsx
│   ├── notes/[slug]/page.tsx
│   ├── projects/page.tsx
│   ├── studio/[[...tool]]/   ← DO NOT TOUCH
│   └── api/revalidate/       ← DO NOT TOUCH
├── components/
│   ├── Nav.tsx
│   ├── Footer.tsx
│   ├── Chrome.tsx            ← hides nav/footer on /studio
│   ├── NoteCard.tsx
│   ├── ProjectCard.tsx
│   └── PortableText.tsx      ← rich-text renderer for notes
├── content/
│   ├── about.ts              ← bio paragraphs
│   ├── projects.ts           ← project cards data
│   └── dailyReads.ts         ← footer icon links
└── lib/
    ├── sanity.client.ts      ← DO NOT TOUCH
    └── queries.ts            ← DO NOT TOUCH
```

---

## How to verify your changes

1. Local dev: `npm run dev` → http://localhost:3000
2. Production build: `npm run build` (must pass before pushing)
3. Push to `main` → Vercel auto-deploys → live in ~60s

Real content to test against:
- A published bond note exists at `/notes/private-credit` (the user's test note — feel free to view it for spacing checks)
- About has a 3-paragraph bio
- Projects has 2 real cards
- Footer has 5 real icon links

Good luck. Keep it restrained — the content does the talking.
