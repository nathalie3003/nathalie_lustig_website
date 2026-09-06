// One-time: convert bondNote.sources from an array of strings to an array of
// { _key, text } objects, so citation markers in the body can reference a
// source that survives reordering. Idempotent: entries that are already
// objects are left alone.
import { createClient } from "@sanity/client";
import { readFileSync } from "node:fs";

const env = Object.fromEntries(
  readFileSync(new URL("../.env.local", import.meta.url), "utf8")
    .split("\n")
    .filter((l) => l.includes("="))
    .map((l) => [l.slice(0, l.indexOf("=")).trim(), l.slice(l.indexOf("=") + 1).trim()]),
);

const client = createClient({
  projectId: env.NEXT_PUBLIC_SANITY_PROJECT_ID,
  dataset: env.NEXT_PUBLIC_SANITY_DATASET,
  apiVersion: env.NEXT_PUBLIC_SANITY_API_VERSION,
  token: env.SANITY_API_WRITE_TOKEN,
  useCdn: false,
});

const key = () => Math.random().toString(36).slice(2, 12);

const notes = await client.fetch(
  `*[_type == "bondNote" && defined(sources)]{ _id, title, sources }`,
);

let changed = 0;
for (const note of notes) {
  if (!note.sources.some((s) => typeof s === "string")) continue;
  const sources = note.sources.map((s) =>
    typeof s === "string" ? { _type: "source", _key: key(), text: s } : s,
  );
  await client.patch(note._id).set({ sources }).commit();
  changed++;
  console.log(`migrated ${note.title} (${sources.length} sources)`);
}
console.log(`done: ${changed} of ${notes.length} notes changed`);
