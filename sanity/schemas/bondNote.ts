import { defineType, defineField } from "sanity";

const RECOMMENDATIONS = ["BUY / LONG", "SELL / SHORT", "HOLD"];
const HORIZONS = ["3M", "6M", "12M"];
const VIEWS = [
  "Bullish duration",
  "Bearish duration",
  "Curve steepener",
  "Curve flattener",
  "Credit tightening",
  "Credit widening",
];

export const bondNote = defineType({
  name: "bondNote",
  title: "Bond Note",
  type: "document",
  fieldsets: [
    {
      name: "trade",
      title: "Trade Idea",
      description: "Only used when Category is 'Trade Ideas'.",
      options: { collapsible: true, collapsed: false },
      // Hide the whole fieldset unless this note is a Trade Idea.
      hidden: ({ document }) => document?.category !== "trade-ideas",
    },
  ],
  fields: [
    defineField({ name: "title", type: "string", validation: (r) => r.required() }),
    defineField({
      name: "slug",
      type: "slug",
      options: { source: "title", maxLength: 80 },
      validation: (r) => r.required(),
    }),
    defineField({
      name: "publishedAt",
      type: "datetime",
      initialValue: () => new Date().toISOString(),
      validation: (r) => r.required(),
    }),
    defineField({
      name: "excerpt",
      type: "string",
      description: "Optional 1-line summary / standfirst. Falls back to first ~25 words of body.",
      validation: (r) => r.max(200),
    }),
    defineField({
      name: "category",
      title: "Category",
      type: "string",
      options: {
        list: [
          { title: "Rates & Macro", value: "rates-macro" },
          { title: "Credit", value: "credit" },
          { title: "New Issues", value: "new-issues" },
          { title: "Private Credit", value: "private-credit" },
          { title: "Trade Ideas", value: "trade-ideas" },
        ],
        layout: "radio",
      },
    }),
    defineField({ name: "coverImage", type: "image", options: { hotspot: true } }),
    defineField({
      name: "body",
      type: "array",
      of: [
        {
          type: "block",
          styles: [
            { title: "Normal", value: "normal" },
            { title: "Section heading", value: "h2" },
            { title: "Sub-heading", value: "h3" },
            { title: "Section label", value: "sectionLabel" },
            { title: "Quote", value: "blockquote" },
          ],
          lists: [{ title: "Bullet", value: "bullet" }],
          marks: {
            decorators: [
              { title: "Strong", value: "strong" },
              { title: "Emphasis", value: "em" },
            ],
            annotations: [
              {
                name: "link",
                type: "object",
                title: "Link",
                fields: [{ name: "href", type: "url", title: "URL" }],
              },
            ],
          },
        },
        {
          type: "image",
          options: { hotspot: true },
          description: "Inline image with optional caption and alt text.",
          fields: [
            { name: "caption", type: "string", title: "Caption" },
            { name: "alt", type: "string", title: "Alt text" },
          ],
        },
        {
          type: "object",
          name: "execSummary",
          title: "Executive Summary",
          description: "Dark navy summary card — the note's thesis in 2–4 sentences.",
          fields: [{ name: "text", type: "text", title: "Text", rows: 5 }],
          preview: {
            select: { subtitle: "text" },
            prepare: ({ subtitle }) => ({ title: "Executive Summary", subtitle }),
          },
        },
        {
          type: "object",
          name: "callout",
          title: "Callout",
          description: "Hairline strip with a French Blue label — a key insight pulled from the flow.",
          fields: [
            { name: "label", type: "string", title: "Label", initialValue: "Key Insight" },
            { name: "text", type: "text", title: "Text", rows: 4 },
          ],
          preview: {
            select: { title: "label", subtitle: "text" },
            prepare: ({ title, subtitle }) => ({ title: title || "Callout", subtitle }),
          },
        },
        {
          type: "object",
          name: "annotation",
          title: "Annotation",
          description: "Inset note with a French Blue label — a structural aside or caveat.",
          fields: [
            { name: "label", type: "string", title: "Label", initialValue: "Note" },
            { name: "text", type: "text", title: "Text", rows: 4 },
          ],
          preview: {
            select: { title: "label", subtitle: "text" },
            prepare: ({ title, subtitle }) => ({ title: title || "Annotation", subtitle }),
          },
        },
        {
          type: "object",
          name: "dataStrip",
          title: "Data strip",
          description: "Up to 3 headline figures side by side, with a French Blue top rule.",
          fields: [
            {
              name: "items",
              title: "Stats",
              type: "array",
              validation: (r) => r.max(3),
              of: [
                {
                  type: "object",
                  fields: [
                    { name: "value", type: "string", title: "Value" },
                    { name: "label", type: "string", title: "Label" },
                  ],
                  preview: {
                    select: { title: "value", subtitle: "label" },
                  },
                },
              ],
            },
          ],
          preview: {
            select: { items: "items" },
            prepare: ({ items }) => ({
              title: "Data strip",
              subtitle: (items || []).map((i: { value?: string }) => i.value).join(" · "),
            }),
          },
        },
      ],
    }),
    defineField({
      name: "sources",
      title: "Sources",
      type: "array",
      of: [{ type: "string" }],
      description: "Optional citation list shown at the end of the article.",
    }),
    defineField({
      name: "disableGlossary",
      title: "Disable glossary highlighting",
      type: "boolean",
      initialValue: false,
      description:
        "Switch off automatic term definitions for this note, for pieces written for readers who already know the words.",
    }),

    // ── Trade Idea fields (shown only when category === "trade-ideas") ──
    defineField({
      name: "tradeRecommendation",
      title: "Recommendation",
      type: "string",
      fieldset: "trade",
      options: { list: RECOMMENDATIONS, layout: "radio" },
    }),
    defineField({
      name: "instrument",
      title: "Instrument",
      type: "string",
      fieldset: "trade",
      description: 'e.g. "Brazil 2035 Sovereign Bond"',
    }),
    defineField({
      name: "instrumentSub",
      title: "Instrument sub-line",
      type: "string",
      fieldset: "trade",
      description: "e.g. NTN-B · 10Y Benchmark · BRL",
    }),
    defineField({
      name: "horizon",
      title: "Horizon",
      type: "string",
      fieldset: "trade",
      options: { list: HORIZONS, layout: "radio" },
    }),
    defineField({ name: "nominalYield", title: "Nominal yield", type: "string", fieldset: "trade", description: 'e.g. "12.4%"' }),
    defineField({ name: "realYield", title: "Real yield", type: "string", fieldset: "trade", description: 'e.g. "6.2%"' }),
    defineField({ name: "realYieldSub", title: "Real yield sub-line", type: "string", fieldset: "trade", description: 'e.g. "CPI 3.8%"' }),
    defineField({
      name: "view",
      title: "View",
      type: "string",
      fieldset: "trade",
      options: { list: VIEWS },
    }),
    defineField({
      name: "conviction",
      title: "Conviction",
      type: "number",
      fieldset: "trade",
      description: "1–5",
      validation: (r) => r.min(1).max(5).integer(),
    }),
    defineField({
      name: "keyPoints",
      title: "Key points",
      type: "array",
      of: [{ type: "string" }],
      fieldset: "trade",
      validation: (r) => r.max(4),
    }),
    defineField({
      name: "keyRisks",
      title: "Key risks",
      type: "array",
      of: [{ type: "string" }],
      fieldset: "trade",
      validation: (r) => r.max(3),
    }),
    defineField({
      name: "oneLiner",
      title: "One-line summary",
      type: "text",
      rows: 2,
      fieldset: "trade",
    }),
  ],
  preview: {
    select: { title: "title", subtitle: "publishedAt", media: "coverImage" },
  },
});
