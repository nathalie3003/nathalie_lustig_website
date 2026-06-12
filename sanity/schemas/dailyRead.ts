import { defineType, defineField } from "sanity";

export const dailyRead = defineType({
  name: "dailyRead",
  title: "Daily Read",
  type: "document",
  fields: [
    defineField({ name: "name", type: "string", validation: (r) => r.required() }),
    defineField({ name: "url", type: "url", validation: (r) => r.required() }),
    defineField({
      name: "short",
      type: "string",
      description: "2-3 char code, e.g. FT, BB, WSJ",
      validation: (r) => r.required(),
    }),
    defineField({
      name: "order",
      type: "number",
      description: "Lower numbers appear first.",
      initialValue: 0,
    }),
  ],
  preview: {
    select: { title: "name", subtitle: "short" },
  },
});
