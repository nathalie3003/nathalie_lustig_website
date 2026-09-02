---
name: The Basis Point
description: "Editorial bond-market notes site: publication grammar, raspberry masthead, serif-first reading experience on blush paper"
colors:
  raspberry: "#B23A63"
  plum: "#7A2246"
  accent-soft: "#F7ECEF"
  petal: "#F7D9E3"
  blush-paper: "#FCFAF9"
  card: "#FFF7F9"
  tint: "#F5EBEA"
  ink: "#191316"
  ink-72: "rgba(25, 19, 22, 0.72)"
  ink-60: "rgba(25, 19, 22, 0.60)"
  ink-45: "rgba(25, 19, 22, 0.45)"
  hairline: "#EADFDD"
  hairline-strong: "#E0C6CE"
typography:
  display:
    fontFamily: "var(--font-serif), Georgia, serif"
    fontSize: "clamp(2.25rem, 4vw, 4.75rem)"
    fontWeight: 600
    lineHeight: 0.98
    letterSpacing: "-0.034em"
  headline:
    fontFamily: "var(--font-serif), Georgia, serif"
    fontSize: "2.375rem"
    fontWeight: 600
    lineHeight: 1.1
    letterSpacing: "-0.022em"
  title:
    fontFamily: "var(--font-serif), Georgia, serif"
    fontSize: "1.5625rem"
    fontWeight: 600
    lineHeight: 1.2
    letterSpacing: "-0.024em"
  body:
    fontFamily: "var(--font-serif), Georgia, serif"
    fontSize: "1.21875rem"
    fontWeight: 400
    lineHeight: 1.78
  ui:
    fontFamily: "var(--font-sans), system-ui, sans-serif"
    fontSize: "0.90625rem"
    fontWeight: 500
    lineHeight: 1.2
  meta:
    fontFamily: "var(--font-mono), ui-monospace, monospace"
    fontSize: "0.65625rem"
    fontWeight: 400
    lineHeight: 1
    letterSpacing: "0.14em"
    fontFeature: "uppercase"
rounded:
  hair: "3px"
  xs: "6px"
  sm: "9px"
  md: "12px"
  card: "16px"
  stack: "20px"
  pill: "999px"
spacing:
  xs: "4px"
  sm: "12px"
  md: "22px"
  lg: "36px"
  xl: "60px"
components:
  button-primary:
    backgroundColor: "{colors.raspberry}"
    textColor: "{colors.card}"
    typography: "{typography.ui}"
    rounded: "{rounded.md}"
    padding: "11px 20px"
  button-primary-hover:
    backgroundColor: "{colors.plum}"
    textColor: "{colors.card}"
  button-outline:
    backgroundColor: "transparent"
    textColor: "{colors.raspberry}"
    rounded: "6px"
    padding: "9px 16px"
  button-outline-hover:
    backgroundColor: "{colors.raspberry}"
    textColor: "{colors.card}"
  button-ghost:
    backgroundColor: "{colors.card}"
    textColor: "{colors.ink}"
    rounded: "{rounded.md}"
    padding: "11px 20px"
  button-cv:
    backgroundColor: "{colors.card}"
    textColor: "{colors.ink}"
    rounded: "{rounded.md}"
    padding: "10px 18px"
  button-cv-hover:
    backgroundColor: "{colors.ink}"
    textColor: "{colors.card}"
  card-rail:
    backgroundColor: "#FFFFFF"
    rounded: "{rounded.card}"
    padding: "22px"
  chip-category:
    backgroundColor: "transparent"
    textColor: "{colors.ink-60}"
    rounded: "{rounded.pill}"
    padding: "7px 14px"
  chip-category-active:
    backgroundColor: "{colors.raspberry}"
    textColor: "{colors.card}"
    rounded: "{rounded.pill}"
    padding: "7px 14px"
---

# Design System: The Basis Point

> Rewritten 2026-09-02 for the blush-paper redesign. The previous system was built
> on French Blue (`#3A5F8A`) over cool grey with a reserved Desk Tan accent. None of
> those colours survive. If you find French Blue or Desk Tan referenced anywhere
> outside a dated `docs/superpowers/` record, it is stale.

## 1. Overview

**Creative North Star: "The Research Note"**

The Basis Point reads like an analyst's desk note, not a marketing site: a raspberry
masthead rule at the very top (the same publication grammar move as the Economist's
red bar or the FT's salmon strip), mono small-caps department labels, and long-form
serif body copy set to be read closely rather than skimmed. Density is editorial,
with generous line-height, real paragraphs and a right rail for supporting context.
Never dashboard-dense, never marketing-sparse.

The paper is warm. Blush rather than cool grey is the single decision that most
changes the site's temperature: it reads as a printed page rather than an interface,
and it lets one saturated colour do all the signalling without ever feeling clinical.

This system explicitly rejects the fintech-SaaS look: no glossy dashboards, no
gradient hero sections, no hero-metric templates, no stock trading-floor
photography, no numbered-section scaffolding that reads as generated. Confidence
comes from restraint and specificity. The writing and the yield curve carry the
page, not visual decoration.

**Key Characteristics:**
- One working accent colour (raspberry) used sparingly, with plum as its hover and depth partner
- Three type voices with strict jobs: serif reads, sans navigates, mono counts
- Publication grammar: masthead rule, section hairlines, mono department labels
- Warm blush paper throughout; white is reserved for genuinely raised surfaces
- Flat by default; the only shadows are soft ambient lifts on interactive cards and popovers, never structural

## 2. Colors

A warm, near-white blush paper carries most of the surface. One raspberry accent and
a near-black warm ink do all the signalling work.

### Primary
- **Raspberry** (#B23A63): The system's one working colour. Used for the masthead
  rule, section-label hairlines and mono labels, links, the primary button, active
  chips, and the yield-curve line. Never used for large fills.
- **Plum** (#7A2246): Raspberry's darker partner. Hover states, pressed depth, and
  the darker end of accent gradients. It is not a second accent and never appears
  where raspberry has not already established the meaning.

### Neutral
- **Blush Paper** (#FCFAF9): Page background.
- **Card** (#FFF7F9): Raised surfaces, note covers, the contact band's warm tone.
  Distinct from pure white, which is reserved for the rail card and the footer bar.
- **Tint** (#F5EBEA): Image placeholders, thumbnail backgrounds, quiet bands.
- **Ink** (#191316): Primary text colour, headlines, body copy, the brand disc.
- **Ink 72 / 60 / 45** (rgba(25,19,22, .72/.60/.45)): Descending text emphasis.
  Standfirsts and excerpts at 72%, secondary bylines at 60%, metadata and captions
  at 45%.
- **Hairline** (#EADFDD): Every rule, border, and divider in the system.
- **Hairline Strong** (#E0C6CE): The emphasised variant, for dropdown borders and
  rules that need to read as a step up from an ordinary divider.

### Support
- **Petal** (#F7D9E3): Text selection and the light end of the rail's accent
  gradient. It is a tint, never a text or border colour.
- **Accent Soft** (#F7ECEF): Hover fills behind nav links and dropdown rows.

### State
Two colours exist outside the palette because they encode state rather than
brand, and only ever appear as a 6px dot beside a mono status line on a project
card. They are the single sanctioned exception to the one-working-colour rule.
- **Live** (#4C7A54): A project that is up and reachable.
- **In progress** (#C8A96A): A project being rebuilt.

The dot is never the only signal; the status word beside it carries the same
meaning, so the pair stays readable without colour vision.

### Named Rules
**The One Working Color Rule.** Raspberry is the only saturated colour on any given
screen. Its rarity, a hairline here, a label there, one primary button, is what makes
it read as considered rather than decorative. Plum is not an exception to this rule;
it is raspberry's own darker state.

## 3. Typography

**Display/Body Font:** Source Serif 4 (`var(--font-serif)`, Georgia fallback)
**UI Font:** Instrument Sans (`var(--font-sans)`, system-ui fallback)
**Meta/Numeric Font:** IBM Plex Mono (`var(--font-mono)`, ui-monospace fallback)

**Character:** A classic serif carries headlines, standfirsts and body copy, the
"written" voice of the site. A neutral grotesque handles interface chrome. A
monospace sets everything countable: dates, read times, category labels, tenors,
basis-point figures and chart axes. On a site about numbers, giving numbers their
own face is the point, not a flourish.

### Hierarchy
- **Display** (600, up to 76px, 0.98, tracking -0.034em): The homepage masthead and
  note-detail titles. The largest serif on the page.
- **Headline** (600, 38px, 1.1): Section titles and the contact band heading.
- **Title** (600, 25px, 1.2): Note-row and card titles.
- **Body** (400, 19.5px, 1.78; cap 65 to 75ch): Long-form note body copy. The widest
  line-height in the system, built for sustained reading.
- **UI** (500, 14.5px): Nav links, buttons, form controls. Sans only.
- **Meta** (400, 10.5px, letter-spacing 0.14em, uppercase): Department labels,
  dates, read times, chart axis values. Mono only.

### Named Rules
**The Three-Voice Rule.** Serif reads, sans navigates, mono counts. If a piece of
text is meant to be read as prose, it is serif. If it is a control or a piece of
wayfinding, it is sans. If it is a date, a duration, a tenor, a basis-point figure
or a department label, it is mono. Never mix two voices mid-sentence.

**The Mono-Means-Measurable Rule.** Mono is not a decorative "technical" texture to
sprinkle on headings. It earns its place only where the content is genuinely a
label or a quantity. A serif heading never becomes mono for effect.

## 4. Elevation

Flat by default. Most surfaces (page background, hairline-bordered cards, buttons at
rest) carry no shadow at all; depth comes from a 1px hairline border. Shadows appear
only as a response to interaction: hover lifts on interactive cards, and ambient
"resting on the desk" shadows under popovers and floating menus.

### Shadow Vocabulary
- **Ambient popover** (`0 18px 50px rgba(25,19,22,0.16)`): Under the notes dropdown
  and mobile menu popover. A soft, diffuse lift signalling "floating above the page."
- **Hover lift** (`0 6px 18px rgba(25,19,22,0.08)`): Recent-note rows on hover,
  paired with a small `translateY(-2px)`.
- **Accent glow** (`0 2px 8px rgba(178,58,99,0.22)`, hover `0 6px 16px
  rgba(178,58,99,0.28)`): Reserved for the primary raspberry button and the active
  category chip. The one place a coloured shadow is allowed, because it is tinted to
  the accent itself rather than being a generic drop shadow.
- **Stack-card shadow** (`0 30px 70px -32px rgba(25,19,22,0.24)`): The large project
  stack cards. The single most pronounced shadow in the system, reserved for that one
  signature component.

### Named Rules
**The Hairline-Before-Shadow Rule.** Reach for a 1px hairline border before reaching
for a shadow. Shadows are earned by interaction state, not applied at rest.

## 5. Components

### Buttons
- **Shape:** 12px radius (`--radius`); the outline variant uses a tighter 6px.
- **Primary:** Raspberry fill, card-coloured text, accent-tinted glow shadow, lifting
  to plum and `translateY(-1px)` on hover. One per view.
- **Outline:** Transparent with a 1px raspberry border and raspberry text, filling to
  solid raspberry on hover. This is the header's "Get in touch" action and the
  system's standard secondary call to action.
- **Ghost:** Card surface, hairline border, no shadow; border darkens on hover.
- **CV/Editorial button:** Ink-on-paper. Card surface, 1px solid ink border, no shadow
  at rest; inverts to solid ink fill on hover. The one button that behaves like a
  printed stamp rather than a UI control.

### Chips
- **Style:** Pill radius (999px), transparent, hairline border, ink-60 text.
- **State:** The active chip inverts to raspberry fill with card-coloured text and
  the accent glow; inactive chips only darken their border on hover.

### Cards / Containers
- **Corner Style:** 16px radius for rail cards and popovers; 20px for project stack
  cards; 4px or less for editorial frames (note covers, the curve card, the contact
  band's inner blocks) where a printed-page squareness is wanted.
- **Background:** Card or white on the blush-paper page. The contrast between the two
  is the only elevation most cards need.
- **Border:** 1px hairline on every card, always.
- **Internal Padding:** 22px standard rail-card padding; larger stack cards use 36 to
  46px.

### Inputs / Fields
- **Style:** Serif type, card surface, hairline border, 9px radius.
- **Focus:** Border shifts from hairline to solid ink. No glow, no colour change,
  keeping focus in the same restrained palette as everything else.

### Navigation
- **Style:** Sticky top bar on blurred blush (`color-mix(in oklab, var(--nav-bg) 92%,
  transparent)`, `backdrop-filter: blur(10px)`), topped with the signature 3px
  raspberry masthead rule and a 1px hairline beneath. The bar is a three-zone grid:
  brand mark and wordmark left, nav centred, primary action right. Nav links are
  sans, ink at rest, with an accent-soft pill on hover. Mobile collapses to a
  hamburger with a popover using the same hairline-card treatment as desktop.

### Signature Component: The Masthead Rule
A 3px solid raspberry border sits across the very top of the page, above the sticky
nav. The site's one deliberate homage to newspaper front-page grammar, translated
into the single accent colour. It appears exactly once per page, at the very top, and
draws in left-to-right once on load. It is never repeated as a decorative stripe
elsewhere.

### Signature Component: The Brand Disc
A flat ink circle carrying "bp" in Source Serif 4. Solid, unlit, no gradient and no
rim. It reads as a printer's mark or a stamp. It must never regain a gradient: the
previous aurora-rim version ran blue through orange and was the single most
off-system element on the old site.

### Signature Component: The Contact Band
A full-bleed photograph under a blush gradient wash, sitting above the footer on
every page, with its content folding up into place on scroll. This is the only
photographic surface in the system and the only place a background image is
permitted. It works because the wash pulls the image almost entirely into the
palette, leaving atmosphere rather than a picture. A photograph used at full
strength anywhere else would break the system.

## 6. Do's and Don'ts

### Do:
- **Do** keep raspberry to hairlines, labels, links, and the primary button. One
  working colour, used sparingly.
- **Do** set long-form reading copy in the serif family at 19.5px/1.78, capped at
  65 to 75ch.
- **Do** reach for a 1px hairline border before a shadow; let shadows respond to
  interaction rather than sitting at rest.
- **Do** keep the 3px raspberry masthead rule unique to the very top of the page.
- **Do** set every date, read time, tenor and basis-point figure in mono.
- **Do** keep the contact band's photograph under its wash; the wash is not optional.

### Don't:
- **Don't** use `border-left`/`border-right` as a coloured accent stripe on cards or
  list items. The masthead rule is the site's one sanctioned stripe at the top, and
  the pull-quote's left rule is the one sanctioned stripe in body copy. Nothing else.
- **Don't** use gradient text or `background-clip: text` gradients anywhere, and
  never put a gradient on the brand disc.
- **Don't** build glossy fintech-dashboard components: no gradient hero sections, no
  hero-metric templates, no stock trading-floor imagery.
- **Don't** scatter mono uppercase labels as reflexive scaffolding. Mono labels are
  department markers and quantities, so one sits above an editorial break or beside a
  measurement, and never above every div for texture.
- **Don't** add numbered section markers (01/02/03) as decoration. The About page's
  photo counter is a real index of a real set, and is the only exception.
- **Don't** mix two type voices within the same piece of running text.
- **Don't** reintroduce a second accent colour. The old system reserved a warm tan
  that was never placed in the UI in three months; the lesson is that this palette
  does not need one.
