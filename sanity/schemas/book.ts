import { defineType, defineField } from "sanity";

export const book = defineType({
  name: "book",
  title: "Book",
  type: "document",
  fields: [
    defineField({ name: "title", type: "string", validation: (r) => r.required() }),
    defineField({ name: "author", type: "string", validation: (r) => r.required() }),
    defineField({
      name: "status",
      type: "string",
      description: 'e.g. "Reading now" or "Next up"',
      validation: (r) => r.required(),
    }),
    defineField({ name: "cover", type: "image", options: { hotspot: true } }),
    defineField({
      name: "order",
      type: "number",
      description: "Lower numbers appear first.",
      initialValue: 0,
    }),
    defineField({
      name: "slotId",
      type: "slug",
      description: "Stable key, e.g. book-age-of-innocence",
      options: { source: "title", maxLength: 80 },
      validation: (r) => r.required(),
    }),
  ],
  preview: {
    select: { title: "title", subtitle: "author", media: "cover" },
  },
});
