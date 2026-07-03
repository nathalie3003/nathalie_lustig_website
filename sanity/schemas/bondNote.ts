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
        { type: "block" },
        {
          type: "image",
          options: { hotspot: true },
          fields: [
            { name: "caption", type: "string", title: "Caption" },
            { name: "alt", type: "string", title: "Alt text" },
          ],
        },
        {
          type: "object",
          name: "execSummary",
          title: "Executive Summary",
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
          fields: [
            { name: "label", type: "string", title: "Label", initialValue: "Key Insight" },
            { name: "text", type: "text", title: "Text", rows: 4 },
          ],
          preview: {
            select: { title: "label", subtitle: "text" },
            prepare: ({ title, subtitle }) => ({ title: title || "Callout", subtitle }),
          },
        },
      ],
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
