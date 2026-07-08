type Block = {
  _type?: string;
  style?: string;
  children?: Array<{ text?: string }>;
};

export function blockText(block: Block): string {
  return (block.children ?? []).map((c) => c.text ?? "").join("");
}

export function headingId(text: string): string {
  return text
    .toLowerCase()
    .replace(/[^\w\s-]/g, "")
    .trim()
    .replace(/\s+/g, "-");
}

/** Pull h2/h3 headings out of a Portable Text body for the sidebar TOC. */
export function extractHeadings(
  body: unknown[],
): { id: string; title: string }[] {
  return (body as Block[])
    .filter((b) => b._type === "block" && b.style === "h2")
    .map((b) => {
      const title = blockText(b);
      return { id: headingId(title), title };
    })
    .filter((h) => h.title);
}
