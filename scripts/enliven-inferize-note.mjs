// One-off: give the Nebius / Inferize note ("AI is getting more efficient,
// what does that mean for lenders?") a more editorial layout, using the block
// palette the site already renders: an executive summary, a data strip, section
// headings (which also feed the margin contents), a plain-English aside, a pull
// quote, a three-point list and a key-insight callout.
//
// The prose is not rewritten. Paragraphs are found by their opening words and
// kept as they are, with their bold, links and citations. The one paragraph
// that changes shape is the "three tangible implications" one, whose inline
// first/second/third is split into a list using the same spans. If any
// paragraph can't be found, or the note already has headings, nothing is
// written.
//
// Run:
//   node --env-file=.env.local scripts/enliven-inferize-note.mjs           # dry run: prints the new outline
//   node --env-file=.env.local scripts/enliven-inferize-note.mjs --write   # backs up the body, then saves
//
// Requires SANITY_API_WRITE_TOKEN in .env.local (Editor/write scope).

import { mkdirSync, writeFileSync } from "node:fs";
import { pathToFileURL } from "node:url";

const SLUG = "ai-is-getting-more-efficient-what-does-that-mean-for-lenders";

const key = () => Math.random().toString(36).slice(2, 12);
const blockText = (b) => (b.children ?? []).map((c) => c.text ?? "").join("");
const norm = (s) =>
  s
    .replace(/[‘’]/g, "'")
    .replace(/[“”]/g, '"')
    .replace(/\s+/g, " ")
    .trim()
    .toLowerCase();

const h2 = (text) => ({
  _type: "block",
  _key: key(),
  style: "h2",
  markDefs: [],
  children: [{ _type: "span", _key: key(), text, marks: [] }],
});

// Opening words of each paragraph, in order. Enough to be unique, short enough
// to survive a small edit later in the sentence.
const P = {
  intro: "When I last looked at Nebius",
  paradox: "For GPU cloud providers like Nebius",
  inferize: "Founded in January 2026",
  tokens: "For Nebius, this means more tokens",
  nvidia: "If Nvidia launches a new generation",
  shorter: "A shorter technological life",
  matters: "That matters because the risk I originally identified",
  elsewhere: "The same paradox is already appearing elsewhere",
  closing: "Even as bond yields rise globally",
};

/**
 * Slice a block's spans to the character range [start, end), keeping every
 * span's marks. Returns the sliced children.
 */
function sliceSpans(block, start, end) {
  const out = [];
  let at = 0;
  for (const span of block.children ?? []) {
    const text = span.text ?? "";
    const from = Math.max(start, at);
    const to = Math.min(end, at + text.length);
    if (to > from) {
      out.push({ ...span, _key: key(), text: text.slice(from - at, to - at) });
    }
    at += text.length;
  }
  return out;
}

/** Trim, capitalise the first letter and end the run with a full stop. */
function tidy(children, { capitalise = true, stop = true } = {}) {
  const kids = children.map((c) => ({ ...c }));
  while (kids.length && !kids[0].text.trim()) kids.shift();
  while (kids.length && !kids[kids.length - 1].text.trim()) kids.pop();
  if (!kids.length) return kids;
  kids[0].text = kids[0].text.replace(/^\s+/, "");
  if (capitalise) kids[0].text = kids[0].text.charAt(0).toUpperCase() + kids[0].text.slice(1);
  const last = kids[kids.length - 1];
  last.text = last.text.replace(/[\s;,.]+$/, "");
  if (stop) last.text += ".";
  return kids;
}

// Only keep the markDefs the new children still reference.
function withChildren(block, children, extra = {}) {
  const used = new Set(children.flatMap((c) => c.marks ?? []));
  return {
    ...block,
    ...extra,
    _key: key(),
    children,
    markDefs: (block.markDefs ?? []).filter((d) => used.has(d._key)),
  };
}

/**
 * Split "…This has three tangible implications: first, A. Second, B; and
 * third, C. Thus, D." into a lead paragraph, a three-item list and a callout.
 * Returns null if the paragraph no longer has that shape.
 */
function splitImplications(block) {
  const text = blockText(block);
  const lower = text.toLowerCase();
  const colon = lower.indexOf("implications:");
  if (colon < 0) return null;
  const cut = colon + "implications:".length;
  const m1 = lower.indexOf("first,", cut);
  const m2 = lower.indexOf("second,", m1);
  const m3 = lower.indexOf("third,", m2);
  const m4 = lower.indexOf("thus,", m3);
  if ([m1, m2, m3, m4].some((i) => i < 0)) return null;

  const lead = withChildren(block, tidy(sliceSpans(block, 0, cut), { capitalise: false, stop: false }));
  const item = (from, to) =>
    withChildren(block, tidy(sliceSpans(block, from, to)), {
      listItem: "bullet",
      level: 1,
    });
  // "; and third," leaves "and" at the end of the second item; drop it.
  const second = item(m2 + "second,".length, m3);
  const tail = second.children[second.children.length - 1];
  tail.text = tail.text.replace(/[;,]?\s*and\.$/i, ".");

  const thusRun = sliceSpans(block, m4 + "thus,".length, text.length);
  const thusHasAnnotation = thusRun.some((c) =>
    (c.marks ?? []).some((mk) => (block.markDefs ?? []).some((d) => d._key === mk)),
  );
  const thus = thusHasAnnotation
    ? withChildren(block, tidy(thusRun))
    : {
        _type: "callout",
        _key: key(),
        label: "Key insight",
        text: tidy(thusRun).map((c) => c.text).join(""),
      };

  return [
    lead,
    item(m1 + "first,".length, m2),
    second,
    item(m3 + "third,".length, m4),
    thus,
  ];
}

export function restructure(body) {
  if (body.some((b) => b.style === "h2" || b._type === "execSummary")) {
    throw new Error("This note already has headings or a summary. Not touching it twice.");
  }

  const find = (opening) => {
    const hits = body.filter(
      (b) => b._type === "block" && norm(blockText(b)).startsWith(norm(opening)),
    );
    if (hits.length !== 1) {
      throw new Error(`Expected one paragraph starting "${opening}", found ${hits.length}.`);
    }
    return hits[0];
  };
  const at = Object.fromEntries(Object.entries(P).map(([k, v]) => [k, find(v)]));

  const implications = splitImplications(at.matters);
  if (!implications) {
    throw new Error('The "three tangible implications" paragraph has changed shape.');
  }

  const before = new Map([
    [at.paradox, [h2("The paradox in GPU-backed lending")]],
    [at.inferize, [h2("What Inferize actually does")]],
    [at.tokens, [h2("A better borrower, not better collateral")]],
    [at.shorter, [h2("Faster payback, cheaper risk")]],
    [at.elsewhere, [h2("The same paradox, elsewhere")]],
    [at.closing, [h2("What lenders are really lending against")]],
  ]);
  const after = new Map([
    [
      at.intro,
      [
        {
          _type: "dataStrip",
          _key: key(),
          items: [
            { _key: key(), value: "$775mn", label: "Nebius' first GPU-backed secured deal" },
            { _key: key(), value: "2030", label: "When that loan matures" },
            { _key: key(), value: "$100–150mn", label: "Reported price paid for Inferize" },
          ],
        },
      ],
    ],
    [
      at.inferize,
      [
        {
          _type: "annotation",
          _key: key(),
          label: "In plain English",
          text:
            "A GPU can only answer requests once an AI model is loaded onto it, and loading one can take minutes. So providers keep spare GPUs switched on and waiting, paying for chips that earn nothing. Inferize makes that loading fast enough that fewer chips need to sit idle.",
        },
      ],
    ],
    [
      at.nvidia,
      [
        {
          _type: "pullQuote",
          _key: key(),
          text:
            "The technological progress that lenders are betting on can make the borrower stronger whilst making the collateral obsolete faster.",
        },
      ],
    ],
  ]);

  const out = [
    {
      _type: "execSummary",
      _key: key(),
      text:
        "Nebius' acquisition of Inferize lets its GPUs spend less time sitting idle, so they earn back their cost faster. That makes Nebius a better borrower, but it does nothing for the chips its secured lenders hold as collateral. Nebius has bought itself a better business, but its lenders are still holding the same chips.",
    },
  ];
  for (const b of body) {
    out.push(...(before.get(b) ?? []));
    if (b === at.matters) out.push(...implications);
    else out.push(b);
    out.push(...(after.get(b) ?? []));
  }
  return out;
}

export function outline(body) {
  return body
    .map((b) => {
      const kind = b._type === "block" ? (b.listItem ? "  • " : b.style) : b._type;
      const text =
        b._type === "block"
          ? blockText(b)
          : b.text ?? (b.items ?? []).map((i) => `${i.value} ${i.label}`).join(" | ");
      return `${String(kind).padEnd(12)} ${text.slice(0, 90)}${text.length > 90 ? "…" : ""}`;
    })
    .join("\n");
}

async function main() {
  const write = process.argv.includes("--write");
  const projectId = process.env.NEXT_PUBLIC_SANITY_PROJECT_ID;
  const dataset = process.env.NEXT_PUBLIC_SANITY_DATASET;
  const apiVersion = process.env.NEXT_PUBLIC_SANITY_API_VERSION || "2024-01-01";
  const token = process.env.SANITY_API_WRITE_TOKEN || process.env.sanity_api_write_token;
  if (!projectId || !dataset || !token) {
    console.error("Missing Sanity env vars. Run with: node --env-file=.env.local scripts/enliven-inferize-note.mjs");
    process.exit(1);
  }

  const { createClient } = await import("@sanity/client");
  const client = createClient({
    projectId,
    dataset,
    apiVersion,
    token,
    useCdn: false,
    perspective: "raw",
  });

  const doc = await client.fetch(
    `*[_type == "bondNote" && slug.current == $slug && !(_id in path("drafts.**"))][0]{ _id, _rev, title, body }`,
    { slug: SLUG },
  );
  if (!doc) {
    console.error(`No published bondNote with slug "${SLUG}".`);
    process.exit(1);
  }
  const draft = await client.fetch(`*[_id == $id][0]._id`, { id: `drafts.${doc._id}` });
  if (draft) {
    console.error(
      "This note has unpublished changes open in the Studio. Publish or discard them first, otherwise publishing the draft later would undo this layout.",
    );
    process.exit(1);
  }

  let body;
  try {
    body = restructure(doc.body);
  } catch (e) {
    console.error(e.message);
    process.exit(1);
  }

  console.log(`New layout for "${doc.title}":\n`);
  console.log(outline(body));

  if (!write) {
    console.log("\nDry run. Re-run with --write to save.");
    return;
  }

  const dir = new URL("./backups/", import.meta.url);
  mkdirSync(dir, { recursive: true });
  const file = new URL(`${SLUG}-${new Date().toISOString().slice(0, 10)}.json`, dir);
  writeFileSync(file, JSON.stringify(doc.body, null, 2));
  console.log(`\nOriginal body backed up to ${file.pathname}`);

  // ifRevisionId: refuse to save over an edit made since we read the note.
  await client.patch(doc._id).ifRevisionId(doc._rev).set({ body }).commit();
  console.log("Saved. The page refreshes within a minute.");
}

if (process.argv[1] && import.meta.url === pathToFileURL(process.argv[1]).href) {
  await main();
}
