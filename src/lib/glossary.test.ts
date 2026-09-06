import { describe, it, expect } from "vitest";
import { applyGlossary, type GlossaryEntry } from "./glossary";

const entries: GlossaryEntry[] = [
  { term: "term premium", definition: "The extra yield for holding duration." },
  { term: "premium", definition: "An amount above par." },
  { term: "steepener", aliases: ["steepeners"], definition: "A curve trade." },
];

// The first block is always skipped (drop cap), so tests put a throwaway
// paragraph first and assert against later blocks.
const lead = { _type: "block", _key: "lead", style: "normal", children: [{ _type: "span", _key: "l0", text: "Opening line.", marks: [] }] };

function para(key: string, text: string, marks: string[] = []) {
  return {
    _type: "block", _key: key, style: "normal",
    children: [{ _type: "span", _key: `${key}s`, text, marks }],
  };
}

function marksOf(body: unknown[], blockKey: string) {
  const b = (body as { _key: string; children: { text: string; marks: string[] }[] }[])
    .find((x) => x._key === blockKey)!;
  return b.children.map((c) => [c.text, c.marks] as const);
}

describe("applyGlossary", () => {
  it("marks a term in a normal paragraph", () => {
    const out = applyGlossary([lead, para("a", "The steepener worked.")], entries);
    expect(marksOf(out, "a")).toEqual([
      ["The ", []],
      ["steepener", ["glossary-steepener"]],
      [" worked.", []],
    ]);
  });

  it("adds a markDef carrying the definition", () => {
    const out = applyGlossary([lead, para("a", "A steepener.")], entries) as {
      _key: string; markDefs?: { _key: string; _type: string; definition: string }[];
    }[];
    const block = out.find((b) => b._key === "a")!;
    expect(block.markDefs).toEqual([
      {
        _type: "glossary",
        _key: "glossary-steepener",
        term: "steepener",
        definition: "A curve trade.",
        moreHref: undefined,
      },
    ]);
  });

  it("marks only the first occurrence in the whole body", () => {
    const out = applyGlossary(
      [lead, para("a", "A steepener."), para("b", "Another steepener.")],
      entries,
    );
    expect(marksOf(out, "b")).toEqual([["Another steepener.", []]]);
  });

  it("skips the first paragraph so it cannot fight the drop cap", () => {
    const out = applyGlossary([para("a", "A steepener opens the note.")], entries);
    expect(marksOf(out, "a")).toEqual([["A steepener opens the note.", []]]);
  });

  it("skips headings, quotes and section labels", () => {
    const body = [
      lead,
      { _type: "block", _key: "h", style: "h2", children: [{ _type: "span", _key: "hs", text: "A steepener", marks: [] }] },
      { _type: "block", _key: "q", style: "blockquote", children: [{ _type: "span", _key: "qs", text: "A steepener", marks: [] }] },
      { _type: "block", _key: "sl", style: "sectionLabel", children: [{ _type: "span", _key: "ss", text: "A steepener", marks: [] }] },
    ];
    const out = applyGlossary(body, entries);
    expect(marksOf(out, "h")).toEqual([["A steepener", []]]);
    expect(marksOf(out, "q")).toEqual([["A steepener", []]]);
    expect(marksOf(out, "sl")).toEqual([["A steepener", []]]);
  });

  it("skips spans that already carry an annotation mark", () => {
    const body = [
      lead,
      {
        _type: "block", _key: "a", style: "normal",
        markDefs: [{ _type: "link", _key: "lnk", href: "https://example.com" }],
        children: [{ _type: "span", _key: "as", text: "A steepener", marks: ["lnk"] }],
      },
    ];
    expect(marksOf(applyGlossary(body, entries), "a")).toEqual([
      ["A steepener", ["lnk"]],
    ]);
  });

  it("keeps decorator marks on the matched span", () => {
    const out = applyGlossary([lead, para("a", "A steepener", ["strong"])], entries);
    expect(marksOf(out, "a")).toEqual([
      ["A ", ["strong"]],
      ["steepener", ["strong", "glossary-steepener"]],
    ]);
  });

  it("prefers the longest match", () => {
    const out = applyGlossary([lead, para("a", "The term premium rose.")], entries);
    expect(marksOf(out, "a")).toEqual([
      ["The ", []],
      ["term premium", ["glossary-term-premium"]],
      [" rose.", []],
    ]);
  });

  it("matches case-insensitively and preserves the original casing", () => {
    const out = applyGlossary([lead, para("a", "Steepener trades.")], entries);
    expect(marksOf(out, "a")).toEqual([
      ["Steepener", ["glossary-steepener"]],
      [" trades.", []],
    ]);
  });

  it("matches an alias", () => {
    const out = applyGlossary([lead, para("a", "Two steepeners.")], entries);
    expect(marksOf(out, "a")).toEqual([
      ["Two ", []],
      ["steepeners", ["glossary-steepener"]],
      [".", []],
    ]);
  });

  it("requires whole words", () => {
    const out = applyGlossary([lead, para("a", "Presteepenered nonsense.")], entries);
    expect(marksOf(out, "a")).toEqual([["Presteepenered nonsense.", []]]);
  });

  it("returns the body untouched when there are no entries", () => {
    const body = [lead, para("a", "A steepener.")];
    expect(applyGlossary(body, [])).toEqual(body);
  });

  it("does not mutate the input", () => {
    const body = [lead, para("a", "A steepener.")];
    const snapshot = JSON.parse(JSON.stringify(body));
    applyGlossary(body, entries);
    expect(body).toEqual(snapshot);
  });
});
