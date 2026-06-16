import { defineType, defineField } from "sanity";

export const bondNote = defineType({
  name: "bondNote",
  title: "Bond Note",
  type: "document",
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
      description: "Optional 1-line summary. Falls back to first ~25 words of body.",
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
        { type: "image", options: { hotspot: true }, fields: [
          { name: "caption", type: "string", title: "Caption" },
          { name: "alt", type: "string", title: "Alt text" },
        ] },
      ],
    }),
  ],
  preview: {
    select: { title: "title", subtitle: "publishedAt", media: "coverImage" },
  },
});
