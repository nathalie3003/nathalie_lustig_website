import { defineType, defineField } from "sanity";

export const glossaryTerm = defineType({
  name: "glossaryTerm",
  title: "Glossary Term",
  type: "document",
  fields: [
    defineField({
      name: "term",
      type: "string",
      description: "The canonical form, e.g. 'term premium'.",
      validation: (r) => r.required(),
    }),
    defineField({
      name: "aliases",
      type: "array",
      of: [{ type: "string" }],
      description:
        "Other forms to match: plurals, abbreviations, alternate spellings. Matching is whole-word, so 'steepener' will not match 'steepeners' unless you add it here.",
    }),
    defineField({
      name: "definition",
      type: "text",
      rows: 3,
      description: "Two sentences at most. This shows in a small popover.",
      validation: (r) => r.required().max(280),
    }),
    defineField({
      name: "moreHref",
      title: "Read more link",
      type: "url",
      description: "Optional. Shown as a link at the foot of the popover.",
    }),
  ],
  preview: { select: { title: "term", subtitle: "definition" } },
});
