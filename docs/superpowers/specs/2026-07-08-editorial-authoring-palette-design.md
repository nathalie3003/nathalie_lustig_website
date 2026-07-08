# Editorial Authoring Palette for Note Bodies

**Date:** 2026-07-08
**Status:** Approved (Nathalie), executed autonomously (she delegated + is offline)

## Problem

The design handoff (Article.html / Trade Idea v2.html) has a rich editorial
component palette — section-label eyebrows, headings, sub-headings, pull-quotes,
data strips, callouts, annotations, exec summaries. The renderer and CSS already
support most of these, but two gaps make the design invisible in practice:

1. **Authoring gap.** The note-body editor exposes only Sanity's stock text
   styles (Normal, H1–H6, Quote). There is no French Blue section-label eyebrow,
   no distinct sub-heading, and the four rich blocks (exec summary, callout,
   annotation, data strip) are present but unlabelled and undiscovered. So notes
   get written as flat paragraphs and the design never appears.
2. **Preview gap.** Sanity Studio renders body content in generic typography, so
   the author "doesn't see the design in Sanity" while writing.

## Goal

Give the note-body editor a purposeful, **optional** palette of editorial pieces
that map 1:1 to the design system, with in-Studio visual cues, so authoring a
note naturally surfaces the design features. Everything remains optional — skip a
style and the note flows as plain paragraphs, exactly as today.

## Scope

### 1. Text-style dropdown (schema: `body` block config)

Replace the bare `{ type: "block" }` with an explicit config:

| Style | value | Renders as | In TOC? |
|---|---|---|---|
| Normal | `normal` | serif body paragraph (auto drop-cap on first) | — |
| Section heading | `h2` | large serif + hairline top rule | ✅ |
| Sub-heading | `h3` | smaller serif heading, no rule | ✕ |
| Section label | `sectionLabel` (new) | French Blue small-caps eyebrow, above a heading | ✕ |
| Quote | `blockquote` | French Blue left-rule pull-quote, italic | ✕ |

- Lists: bullet only (design uses em-dash bullets; no numbered lists in body —
  the ordered Sources list is its own `sources` field).
- Marks: Strong, Emphasis (defaults). Annotation: Link (url field).
- Styles are declared `{ title, value }` only. Custom Studio render components
  (in-editor French Blue preview) are **deferred** — the Sanity 4
  `BlockStyleDefinition` type doesn't declare the `component` prop, and a wrong
  Studio API risks breaking the live editor. Add later once `/studio` can be
  verified interactively. The live-site rendering below does not depend on it.

### 2. Insert menu ("+") — relabel existing blocks

Add plain-English `description`s to `execSummary`, `callout`, `annotation`,
`dataStrip`, `image` so each is self-explanatory. No new block types.

### 3a. Studio preview — DEFERRED

In-editor French Blue / smaller rendering of the new styles is a follow-up
(needs live `/studio` verification). Not in this pass.

### 3. Renderer (`src/components/PortableText.tsx`)

- `h3` → real `<h3 id=…>` (stop aliasing to `<h2>`); distinct lighter styling.
- `sectionLabel` → `<p class="section-label-fb">` French Blue small-caps.
- `extractHeadings` (`src/lib/toc.ts`) → filter to `h2` only, so sub-headings
  don't clutter the sidebar TOC.

### 4. CSS (`src/app/globals.css`)

Scoped to both `.article-body` (trade) and `.ap-col` (general):

- `.section-label-fb`: sans 10px/600, `letter-spacing 0.14em`, uppercase,
  `color: var(--accent)`; carries the hairline top rule + top margin.
- `.section-label-fb + h2`: reset the heading's own top rule/padding/margin so
  rule → eyebrow → heading read as one unit (matches design `.section-block`).
- `.article-body h3` / `.ap-col h3`: serif 19px/600, no rule, tighter margins —
  visibly lighter than the 22px ruled H2.

### 5. Demo content on the Brazil note (additive, non-destructive script)

`scripts/demo-brazil-blocks.mjs`, matched by block text (idempotent):

- Insert `sectionLabel` "Rates & Policy" above the "The Macro Backdrop" heading.
- Insert `sectionLabel` "Positioning" above the "The Trade" heading.
- Insert a `dataStrip` after the macro paragraph: `14.25%` / Selic rate (Jun 2026),
  `4.7%` / IPCA inflation, `125bps` / 5Y CDS spread — all real figures from the note.

**No prose is deleted or reworded.** Pull-quote is left as an available style
rather than surgically extracting a sentence while the author is offline.

## Out of scope

- No new block object types beyond the four that already exist.
- No colored-serif heading text (French Blue stays on the eyebrow/labels/links
  only, per DESIGN.md's one-working-color rule).
- No changes to the general-article or trade layouts, hero, or trade card.

## Verification

- `tsc --noEmit` passes.
- Live: Brazil note shows two French Blue eyebrows above its headings and a data
  strip; sub-heading style renders distinct from H2 if used; TOC still lists only
  the two H2 sections. Studio editor shows the section-label in French Blue.
