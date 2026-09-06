export type GlossaryEntry = {
  term: string;
  aliases?: string[];
  definition: string;
  moreHref?: string;
};

type Span = { _type: string; _key: string; text: string; marks: string[] };
type MarkDef = { _type: string; _key: string; [k: string]: unknown };
type Block = {
  _type: string;
  _key: string;
  style?: string;
  children?: Span[];
  markDefs?: MarkDef[];
};

const escapeRe = (s: string) => s.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");

/** Deterministic so the server and client renders agree. */
export function glossaryMarkKey(term: string): string {
  return `glossary-${term.toLowerCase().replace(/[^\w]+/g, "-").replace(/^-|-$/g, "")}`;
}

/**
 * Wrap the first occurrence of each glossary term in the body with a `glossary`
 * mark, and attach the definition as a markDef on the block that carries it.
 *
 * The rules exist to stop the feature becoming noise:
 *  - first occurrence per article only, never every mention
 *  - normal paragraphs and list items only, never headings, quotes or labels
 *  - never inside a span that already carries an annotation (a link, a citation)
 *  - never in the first paragraph, which carries a CSS drop cap that a button
 *    element would fight (see .ap-col > p:first-of-type::first-letter)
 *  - longest match wins, so "term premium" beats "premium"
 */
export function applyGlossary(
  body: unknown[],
  entries: GlossaryEntry[],
): unknown[] {
  if (!entries.length || !body?.length) return body;

  const byPhrase = new Map<string, GlossaryEntry>();
  for (const e of entries) {
    for (const phrase of [e.term, ...(e.aliases ?? [])]) {
      if (phrase) byPhrase.set(phrase.toLowerCase(), e);
    }
  }
  const phrases = [...byPhrase.keys()].sort((a, b) => b.length - a.length);
  const re = new RegExp(`\\b(${phrases.map(escapeRe).join("|")})\\b`, "gi");

  const used = new Set<string>();
  let seenFirstParagraph = false;

  return (body as Block[]).map((block) => {
    if (block?._type !== "block" || block.style !== "normal") return block;
    if (!seenFirstParagraph) {
      seenFirstParagraph = true;
      return block;
    }

    const annotationKeys = new Set((block.markDefs ?? []).map((d) => d._key));
    const newDefs: MarkDef[] = [];
    let changed = false;

    const children = (block.children ?? []).flatMap((span): Span[] => {
      if (span._type !== "span" || span.marks?.some((m) => annotationKeys.has(m))) {
        return [span];
      }

      const out: Span[] = [];
      let last = 0;
      let part = 0;
      re.lastIndex = 0;
      for (const match of span.text.matchAll(re)) {
        const entry = byPhrase.get(match[0].toLowerCase());
        if (!entry || used.has(entry.term)) continue;
        used.add(entry.term);
        changed = true;

        const key = glossaryMarkKey(entry.term);
        newDefs.push({
          _type: "glossary",
          _key: key,
          term: entry.term,
          definition: entry.definition,
          moreHref: entry.moreHref,
        });

        const at = match.index!;
        if (at > last) {
          out.push({ ...span, _key: `${span._key}-${part++}`, text: span.text.slice(last, at) });
        }
        out.push({
          ...span,
          _key: `${span._key}-${part++}`,
          text: match[0],
          marks: [...(span.marks ?? []), key],
        });
        last = at + match[0].length;
      }

      if (!out.length) return [span];
      if (last < span.text.length) {
        out.push({ ...span, _key: `${span._key}-${part++}`, text: span.text.slice(last) });
      }
      return out;
    });

    if (!changed) return block;
    return {
      ...block,
      children,
      markDefs: [...(block.markDefs ?? []), ...newDefs],
    };
  });
}
