// Walk Portable Text blocks, count words in `block`-type spans,
// return "${max(1, round(wpm/225))} min".

type Span = { _type?: string; text?: string };
type Block = { _type?: string; children?: Span[] };

export function readTime(body: unknown): string {
  let words = 0;
  if (Array.isArray(body)) {
    for (const raw of body as Block[]) {
      if (raw && raw._type === "block" && Array.isArray(raw.children)) {
        for (const child of raw.children) {
          if (child && typeof child.text === "string") {
            const t = child.text.trim();
            if (t) words += t.split(/\s+/).length;
          }
        }
      }
    }
  }
  const minutes = Math.max(1, Math.round(words / 225));
  return `${minutes} min`;
}

// Card queries ask Sanity for `length(pt::text(body))` rather than pulling every
// note's full body just to count words. Converting characters to words at 5.5
// characters per word lands within a minute of readTime() on real notes, which
// is well inside the precision a "5 min read" label claims.
export function readTimeFromChars(chars?: number): string {
  const minutes = Math.max(1, Math.round((chars ?? 0) / 5.5 / 225));
  return `${minutes} min`;
}
