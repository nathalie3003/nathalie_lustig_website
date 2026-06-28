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
