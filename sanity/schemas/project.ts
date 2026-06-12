import { defineType, defineField } from "sanity";

export const project = defineType({
  name: "project",
  title: "Project",
  type: "document",
  fields: [
    defineField({
      name: "slotId",
      type: "slug",
      description: "Stable key, e.g. proj-lml",
      options: { source: "title", maxLength: 80 },
      validation: (r) => r.required(),
    }),
    defineField({ name: "title", type: "string", validation: (r) => r.required() }),
    defineField({
      name: "url",
      type: "string",
      description: 'Display URL, e.g. "littlemisslondonjewellery.com"',
      validation: (r) => r.required(),
    }),
    defineField({
      name: "href",
      type: "url",
      description: "Full link (https://...)",
      validation: (r) => r.required(),
    }),
    defineField({ name: "live", type: "boolean", initialValue: true }),
    defineField({
      name: "status",
      type: "string",
      description: '"Live" or "In build"',
      validation: (r) => r.required(),
    }),
    defineField({ name: "statusNote", type: "string", validation: (r) => r.required() }),
    defineField({
      name: "faviconLabel",
      type: "string",
      description: "2-3 char fallback if no image",
      validation: (r) => r.required(),
    }),
    defineField({ name: "description", type: "text", validation: (r) => r.required() }),
    defineField({ name: "image", type: "image", options: { hotspot: true } }),
    defineField({
      name: "order",
      type: "number",
      description: "Lower numbers appear first.",
      initialValue: 0,
    }),
  ],
  preview: {
    select: { title: "title", subtitle: "url", media: "image" },
  },
});
