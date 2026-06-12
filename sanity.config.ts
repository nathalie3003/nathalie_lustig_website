import { defineConfig } from "sanity";
import { structureTool } from "sanity/structure";
import { visionTool } from "@sanity/vision";
import { schemaTypes } from "./sanity/schemas";
import { projectId, dataset } from "./sanity/env";

export default defineConfig({
  name: "default",
  title: "Nathalie Website",
  projectId,
  dataset,
  basePath: "/studio",
  plugins: [
    structureTool({
      structure: (S) =>
        S.list()
          .title("Content")
          .items([
            S.listItem()
              .title("Site Settings")
              .id("siteSettings")
              .child(
                S.document()
                  .schemaType("siteSettings")
                  .documentId("siteSettings.main"),
              ),
            S.divider(),
            S.documentTypeListItem("bondNote").title("Bond Notes"),
            S.documentTypeListItem("book").title("Books"),
            S.documentTypeListItem("project").title("Projects"),
            S.documentTypeListItem("dailyRead").title("Daily Reads"),
          ]),
    }),
    visionTool(),
  ],
  schema: { types: schemaTypes },
  document: {
    // For the siteSettings singleton, hide create/delete/duplicate actions.
    actions: (input, context) =>
      context.schemaType === "siteSettings"
        ? input.filter(
            ({ action }) =>
              !!action && ["publish", "discardChanges", "restore"].includes(action),
          )
        : input,
    // Don't let users create new siteSettings docs from the global "+" menu.
    newDocumentOptions: (prev, { creationContext }) =>
      creationContext.type === "global"
        ? prev.filter((t) => t.templateId !== "siteSettings")
        : prev,
  },
});
