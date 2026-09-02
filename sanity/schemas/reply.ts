import { defineType, defineField } from "sanity";

export const reply = defineType({
  name: "reply",
  title: "Reply",
  type: "document",
  fields: [
    defineField({
      name: "note",
      title: "Note",
      type: "reference",
      to: [{ type: "bondNote" }],
      validation: (r) => r.required(),
    }),
    defineField({
      name: "name",
      title: "Name",
      type: "string",
      description: "Optional. Leave blank and the reply shows as anonymous.",
    }),
    defineField({
      name: "text",
      title: "Text",
      type: "text",
      rows: 4,
      validation: (r) => r.required().max(2000),
    }),
    defineField({
      name: "createdAt",
      title: "Created at",
      type: "datetime",
      validation: (r) => r.required(),
    }),
    defineField({
      name: "hidden",
      title: "Hidden",
      type: "boolean",
      initialValue: false,
      description:
        "Ticking this removes the reply from the site immediately. Replies publish straight away, so this is how a bad one gets pulled.",
    }),
  ],
  orderings: [
    {
      title: "Newest first",
      name: "createdAtDesc",
      by: [{ field: "createdAt", direction: "desc" }],
    },
  ],
  preview: {
    select: { title: "text", subtitle: "name" },
    prepare: ({ title, subtitle }) => ({
      title: title ? (title.length > 60 ? `${title.slice(0, 60)}...` : title) : "(empty reply)",
      subtitle: subtitle || "Anonymous",
    }),
  },
});
