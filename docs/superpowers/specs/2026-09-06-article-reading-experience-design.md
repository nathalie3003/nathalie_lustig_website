# Article Reading Experience

**Date:** 2026-09-06
**Scope:** The note detail page, both layouts (`/notes/[slug]`)

## Goal

Make a long technical note easier to read on a laptop and on a phone, by
orienting the reader in the piece and supporting them inside the prose. Five
changes: a reading progress rail, a table of contents for standard notes, an
auto-matched glossary, inline citation markers, and a pull-quote block.

## Content survey (2026-09-06)

`extractHeadings` in `src/lib/toc.ts` selects `h2` blocks only, and the table of
contents hides itself below two entries. Queried against the live `production`
dataset, 11 notes:

- **5 already use real `h2` blocks** and get a TOC with no content work: The Stem
  Beneath the Flower (3), What your Gym Membership Can Teach Us (2), When the Gale
  Changes Course (2), The Gilded Age of Private Credit (2), Brazil's Winning
  Formation (2).
- **1 fakes headings with bold paragraphs and would gain a TOC if converted:**
  Super El Niño ("Bearish for Bonds", "Bullish for Bonds").
- **2 have a single section marker** and stay below the threshold either way: A
  Clear Picture of the Wrong Problem (one bold line), Lending Against Obsolescence
  (one `sectionLabel`).
- **3 are continuous prose with no sections** and correctly get nothing: The Price
  of Opacity (5 paragraphs), Could a Railway Change the Price of War? (9), Tech
  Giants and the New Logic of Bond Issuance (6).

So the content prerequisite is one note, not a blocker. The honest consequence is
that the TOC is the lowest-reach change in this spec: it affects 5 notes today,
typically showing two entries, while the progress rail and glossary affect all 11
and every future note. It is worth building because it grows with the writing
rather than shrinking, and because the collapsed line fixes trade ideas on mobile
where the sidebar TOC currently lands below everything it was meant to help with.
But it is the first piece to cut if this needs to be smaller.

## 1. Reading progress rail

`src/components/ReadingProgress.tsx` exists and renders on both layouts. Two
defects:

- It is `position: fixed; top: 0`, painting over the 3px raspberry masthead rule,
  so it reads as the masthead thickening rather than as a separate instrument.
- It measures `document.documentElement.scrollHeight`, so the replies section and
  the keep-reading cards count toward "read". The bar never fills at the end of
  the prose.

**Changes**

- Position at the bottom edge of the sticky nav via a new `--nav-h` token.
  `.top` sets its own `min-height` from the same token so the two cannot drift.
  A mobile override sets both together if the bar is shorter there.
- Measure the article element. The component takes a ref to the element that
  wraps the body copy. Progress runs from the article top clearing the nav to the
  article bottom clearing the viewport bottom, clamped to 0..1.
- `z-index: 39`, below the nav's 40, so the mobile menu popover always wins.
- 2px, `var(--accent)`. `prefers-reduced-motion` drops the 80ms transition.

## 2. Table of contents

One heading source, two presentations, one new component (`ArticleToc`) shared by
both article layouts.

### Desktop, 1240px and up

A sticky rail in the whitespace left of the content column.

- Label "In this note" in mono meta.
- Entries in sans at 12.5px, `--ink-60`. Sans because this is wayfinding, per the
  Three-Voice Rule. Mono would be wrong here and would also wrap badly at this
  width.
- Active entry goes to full `--ink` with a short raspberry tick beside it.
- Fades in once the reader has scrolled past the header. Reduced motion shows it
  without the fade.

**Width constraint.** The content wrap is `--col-wide: 900px`. A 170px rail plus
its gap needs roughly 1240px of viewport to sit outside that wrap without
crowding. A 1280px laptop qualifies; a 1152px one does not. The collapsed
treatment below is therefore not a phone fallback, it is what a meaningful share
of laptops will see, and should be designed to that standard.

### Below 1240px

A single line directly under the progress rail: mono label, current section name,
chevron. Tapping expands the full list as a popover using the existing
hairline-card treatment and the ambient popover shadow.

This also fixes trade ideas on mobile, where `.sidebar` currently becomes
`position: static` and drops the TOC to the bottom of the page, past everything
it was meant to help with.

### Layout split

- Standard notes: margin rail on desktop, collapsed line below 1240px.
- Trade ideas: keep the existing `TradeToc` sidebar card on desktop (the sidebar
  is already earned by the trade card), collapsed line on mobile. The sidebar TOC
  hides at the mobile breakpoint so the two never both appear.

## 3. Glossary

### Content model

New Sanity document `glossaryTerm`:

- `term` (string, required)
- `aliases` (array of string) for plurals and variants
- `definition` (text, capped so it stays a definition rather than an essay)
- `moreHref` (url, optional)

Fetched once at build via a new `getGlossaryTerms` in `src/lib/queries.ts`. The
page is statically generated, so there is no request-time cost.

New field on `bondNote`: `disableGlossary` (boolean) to switch the pass off for a
note written for readers who already know the words.

### Matching

A pass in `src/lib/glossary.ts` over the Portable Text body before rendering,
splitting spans and attaching a `glossary` mark. Rules:

- Whole-word matches only, using word boundaries.
- Longest match first, so "term premium" wins over "premium".
- First occurrence per article only. Every later occurrence renders as plain text.
- Only in `normal` blocks and list items. Never in `h2`, `h3`, `sectionLabel`,
  `blockquote`, the pull quote, or the standfirst.
- Never inside a span that already carries a `link` mark.
- Case-insensitive matching, original casing preserved in output.

False positives are controlled editorially, by what enters the dictionary, not by
code. Common words ("yield", "duration") do not belong in it; genuinely technical
terms ("term premium", "convexity", "steepener", "NTN-B") do.

### Presentation

`GlossaryTerm` client component:

- Dotted `--rule-strong` underline on the term in the prose. No colour: colouring
  matched terms would scatter raspberry through body copy and break the One
  Working Color Rule.
- A real `<button>` with `aria-describedby` pointing at the popover, so hover,
  tap, and keyboard all reach it.
- Opens on hover after a short delay on pointer devices, on click or tap, and on
  keyboard focus. Closes on Escape, blur, and outside click.
- Popover uses the card surface, hairline border, and ambient popover shadow.
  The term label inside it is mono raspberry; the definition is serif. Clamps to
  the viewport with a gutter so it never overflows on a phone.
- Reduced motion removes the fade and transform.

## 4. Citations

### Storage change

`sources` is currently `array of string`. Sanity does not give array-of-primitive
entries a `_key`, so a marker in the prose has nothing stable to reference:
reordering sources would silently repoint every marker.

`sources` becomes an array of objects with a single `text` field. In the Studio
this is still one free-text box per row, so authoring is unchanged, but each row
gains a key.

A one-time migration script in `scripts/` converts existing string entries. It
runs once and requires no manual editing of documents.

### Marker

New `citation` annotation on the body block, referencing a source by key.

- Renders as a superscript numeral in mono raspberry.
- Clicking jumps to the sources list.
- Hover previews the source text.
- Each entry in the sources list back-links to where it was cited.

**Optional by design.** An article with sources and no markers renders exactly as
it does today. No back-filling of published notes is expected or required.

## 5. Pull quote

New block object `pullQuote` on `bondNote`: `text`, optional `attribution`.

- Serif around 28px.
- Breaks out from `--col-text` (620px) to `--col-wide` (900px).
- Hairline rules above and below. No left stripe.
- Attribution in mono meta.

`blockquote` is unchanged and keeps its left raspberry rule, which remains the one
sanctioned stripe in body copy per `DESIGN.md`.

## Authoring impact

| Feature | Setup | Per note |
| --- | --- | --- |
| Progress rail | none | none |
| Table of contents | convert Super El Niño's two bold lines | use "Section heading" style |
| Glossary | write the dictionary once | none |
| Citations | migration script runs once | optional, by hand |
| Pull quote | none | optional, by hand |

## Design system compliance

- **One Working Color Rule.** Raspberry is added only to the progress rail (which
  already used it), the TOC active tick, the citation numeral, and the glossary
  popover's term label. Matched terms in the prose carry no colour.
- **Three-Voice Rule.** TOC entries are sans (wayfinding). Labels, the citation
  numeral, and attribution are mono. Definitions and the pull quote are serif.
- **No side-stripe.** The pull quote uses rules above and below, not a left
  border. The blockquote's left rule stays the single exception.
- **Hairline before shadow.** The glossary popover and the mobile TOC popover are
  the only new shadows, both using the existing ambient popover value, both
  earned by being floating layers.
- **Focus is not optional.** The glossary term, citation marker, TOC entries, and
  the mobile TOC toggle are all focusable controls carrying the shared ring.

## Files

**New**

- `sanity/schemas/glossaryTerm.ts`
- `src/lib/glossary.ts`
- `src/components/GlossaryTerm.tsx`
- `src/components/ArticleToc.tsx`
- `scripts/migrate-sources.ts`

**Changed**

- `sanity/schemas/bondNote.ts` (pull quote block, citation annotation,
  `disableGlossary`, `sources` shape)
- `sanity/schemas/index.ts`
- `src/components/PortableText.tsx`
- `src/components/ReadingProgress.tsx`
- `src/components/TradeIdeaArticle.tsx`
- `src/app/notes/[slug]/page.tsx`
- `src/lib/queries.ts`
- `src/app/globals.css`

## Out of scope

Time-remaining readout, opening-paragraph drop cap, and related-notes-by-category
were considered and deferred. Prev/next keep-reading stays as it is.
