---
target: "live site: blog vs publication"
total_score: 27
p0_count: 1
p1_count: 2
timestamp: 2026-11-06T13-16-02Z
slug: thebasispoint-finance
---
Method: dual-agent (A: design review · B: detector + browser)

Score 27/40. Verdict: not AI slop; reads as a personal blog with a good theme.

Priority issues
- [P0] Lifestyle content in main flow (Right now rail incl. "difference between a GPU and a CPU", bedside table, /about Hanoi + photo carousel). Fix: remove from homepage, compress on /about. /impeccable distill
- [P1] Homepage is a personal-brand page, not a front page (first-person hero, ends on jewellery + book app projects). Fix: lead story, sections, Start here, data strip, subscribe; move Projects. /impeccable layout
- [P1] Missing trust furniture: curve as-of/source only on hover, no disclaimer, thin byline, no next/related note, no visible subscribe. /impeccable clarify
- [P2] Titles don't carry the call; pair witty titles with plain claim decks. /impeccable clarify
- [P2] Archive inconsistency: blank thumbnail, Google AI screenshot cover, categories differ home vs /notes, mixed date formats. /impeccable polish
- [P3] Nav: "Get in touch" pill, Projects is an anchor. /impeccable layout

Detector: 11 findings (3 side-tab border-left 3px in globals.css 438/723/1161, 2 width transitions, 5 off-scale 2px radii, 1 OG font). Overlay injection blocked by browser (localhost from https).
Minor: em dash in projects.ts:27; London vs Hanoi contradiction; article paragraph colour ~4.7:1 in places; 45 text leaves under 12px on homepage.
