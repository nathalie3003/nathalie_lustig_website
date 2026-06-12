import { defineType, defineField } from "sanity";

export const siteSettings = defineType({
  name: "siteSettings",
  title: "Site Settings",
  type: "document",
  // Treated as a singleton via sanity.config.ts structure callback
  // (pinned to a single document id "siteSettings.main").
  fields: [
    defineField({
      name: "aboutParagraphs",
      title: "About — paragraphs",
      type: "array",
      of: [{ type: "text" }],
      description: "Each item is one paragraph of the About bio.",
    }),
    defineField({
      name: "contact",
      title: "Contact list",
      type: "array",
      of: [
        {
          type: "object",
          name: "contactItem",
          fields: [
            { name: "label", type: "string", validation: (r) => r.required() },
            { name: "value", type: "string", validation: (r) => r.required() },
            { name: "href", type: "string", validation: (r) => r.required() },
          ],
          preview: {
            select: { title: "label", subtitle: "value" },
          },
        },
      ],
    }),
  ],
  preview: {
    prepare: () => ({ title: "Site Settings" }),
  },
});
