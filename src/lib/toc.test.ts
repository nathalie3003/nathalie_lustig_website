import { describe, it, expect } from "vitest";
import { extractHeadings, headingId, blockText } from "./toc";

describe("headingId", () => {
  it("slugifies a heading", () => {
    expect(headingId("The Future Outlook")).toBe("the-future-outlook");
  });

  it("drops punctuation", () => {
    expect(headingId("Bearish for Bonds?")).toBe("bearish-for-bonds");
  });
});

describe("blockText", () => {
  it("joins child spans", () => {
    expect(blockText({ children: [{ text: "Term " }, { text: "premium" }] })).toBe(
      "Term premium",
    );
  });
});

describe("extractHeadings", () => {
  const body = [
    { _type: "block", style: "normal", children: [{ text: "Intro" }] },
    { _type: "block", style: "h2", children: [{ text: "Bearish for Bonds" }] },
    { _type: "block", style: "h3", children: [{ text: "A sub point" }] },
    { _type: "block", style: "h2", children: [{ text: "Bullish for Bonds" }] },
    { _type: "image" },
  ];

  it("returns h2 blocks only", () => {
    expect(extractHeadings(body)).toEqual([
      { id: "bearish-for-bonds", title: "Bearish for Bonds" },
      { id: "bullish-for-bonds", title: "Bullish for Bonds" },
    ]);
  });

  it("returns an empty list for a body with no headings", () => {
    expect(
      extractHeadings([
        { _type: "block", style: "normal", children: [{ text: "Just prose" }] },
      ]),
    ).toEqual([]);
  });
});
