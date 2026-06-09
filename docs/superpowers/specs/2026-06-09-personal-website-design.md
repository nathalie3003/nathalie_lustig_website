# Nathalie's Personal Website — Design

**Date:** 2026-06-09
**Status:** Approved — ready for implementation planning

## Purpose

A personal website that doubles as (a) a public, professional landing page aimed at recruiters in DCM and Fixed Income Sales, and (b) Nathalie's own daily-use homepage. The single strongest signal to recruiters is a consistent stream of short bond-market notes, published twice a week.

## Audience & priorities

Primary audience: recruiters and professionals in DCM / Fixed Income Sales who land on the site from a CV, LinkedIn, or referral.
Secondary audience: Nathalie herself, who wants quick access to her daily-read sources, her in-progress jewelry site (LittleMissLondon), and her book-review portfolio.

When design tensions arise, the recruiter audience wins.

## Tech stack & hosting

- **Framework:** Next.js (App Router) with TypeScript and Tailwind CSS.
- **CMS:** Sanity (free tier). Sanity Studio embedded at `/studio`, password-protected, provides a Base44-style form editor for bond notes.
- **Repository:** GitHub.
- **Hosting:** Vercel, auto-deploying on push to `main`.
- **Domain:** start on the free `*.vercel.app` URL; purchase `nathalielustig.com` (or similar) once ready.

## Site map

| Path | Purpose |
|---|---|
| `/` | Homepage — hero (name, tagline, CV button, small headshot) + 3 most recent bond notes as cards + "All notes →" link. |
| `/notes` | Reverse-chronological list of all bond notes, paginated after ~20. |
| `/notes/[slug]` | Individual bond note: title, publish date, body (rich text + images), back link. |
| `/about` | Written bio (a few paragraphs in Nathalie's voice — who she is, what she's aiming at, why bonds) + "Download CV" button. |
| `/projects` | Two cards: LittleMissLondon and the book-review portfolio. Each has image, name, one-line description, link out. |
| `/studio` | Password-protected Sanity Studio. Not linked from the public nav. |

**Global nav (every page):** *Notes · About · Projects* + "Download CV" button.
**Global footer (every page):** small icon row linking to ~6 daily-read sources (e.g., FT, Bloomberg, Reuters) + copyright line. The daily-reads list is intentionally subtle, not a main section.

## Homepage detail

Above the fold:
- Name set large in serif.
- One-line tagline aimed at the recruiter audience, e.g. *"Graduate aiming for DCM / Fixed Income Sales. Writing on bond markets twice a week."*
- "Download CV" button (deep-navy fill).
- Small headshot to the right (or below on mobile).

Below the fold:
- Section header: *Latest notes*.
- 3 most recent bond notes as cards (title, date in small caps, 1-line excerpt).
- "All notes →" link at the bottom of the section.

## Visual design

- **Type:** Serif (e.g., *Source Serif* or *EB Garamond*) for headlines and body. Sans-serif (*Inter*) for UI labels, metadata, dates.
- **Palette:**
  - Background: off-white, around `#FAF8F3`.
  - Text: near-black, around `#1A1A1A`.
  - Accent (links, buttons, section rules): deep navy, around `#0A2540`.
  - Reserve one warm tone for hover states.
- **Layout:**
  - Bond notes and About: narrow text column (~680px max) for comfortable reading.
  - Homepage hero and projects grid: wider container.
- **Components:** thin hairline dividers, no drop shadows, no gradients. Subtle hover underlines on links. Dates set in small caps. Restraint is the aesthetic.
- **Responsive:** mobile-first. Hero compresses, nav collapses to a hamburger, note cards stack vertically on phones.

## Content model

**Sanity schema — one document type: `bondNote`**

| Field | Type | Notes |
|---|---|---|
| `title` | string | required |
| `slug` | slug | auto-generated from title, editable |
| `publishedAt` | datetime | auto-filled to "now" on first publish |
| `excerpt` | string | optional; falls back to first ~25 words of body if blank |
| `coverImage` | image | optional; shown at top of the note |
| `body` | Portable Text | rich text: paragraphs, headings, bold/italic, links, inline image uploads with captions |

Graphs are uploaded as images inside `body` — no extra tooling needed.

**Content edited in code (not CMS) because it changes rarely:**
- About page body text.
- Projects cards (LittleMissLondon, book portfolio).
- Daily-read footer links.
- CV PDF file (stored in `/public`).

Any of these can be promoted to Sanity later if editing in code becomes a friction point.

## Authoring flow

1. Visit `nathalielustig.com/studio`, log in with password.
2. Click "New Bond Note".
3. Type title → slug and `publishedAt` auto-populate.
4. Write body in the rich-text editor; drag images in.
5. Click "Publish". Vercel rebuilds within ~30 seconds; the note appears on `/` and `/notes`.

## Data flow

- Sanity is the source of truth for bond notes.
- Next.js pages fetch from Sanity at build time (Incremental Static Regeneration) so pages stay fast and static.
- A Sanity webhook triggers a Vercel rebuild on publish, so new notes appear without manual redeploy.

## Out of scope (deliberately deferred)

- Comments, reactions, or social-style interaction on notes.
- Email subscription / newsletter integration.
- Analytics dashboard. (Vercel Analytics free tier may be enabled at deploy time, but no custom dashboards.)
- Search across notes. (Add once there are >20 notes and it actually hurts to browse.)
- Tags or categories on notes. (Single chronological stream is enough at this volume.)
- Light/dark mode toggle. (Editorial palette is the brand.)
- Promoting About / Projects / footer-link content into the CMS.

## Success criteria

- Nathalie can publish a new bond note end-to-end in under 10 minutes without touching code.
- A recruiter landing on `/` understands within 5 seconds: who Nathalie is, what she's aiming at, and that she writes regularly.
- The site loads in under 2 seconds on a typical mobile connection.
- Total ongoing cost is near zero (Sanity free tier + Vercel free tier + domain renewal only).
