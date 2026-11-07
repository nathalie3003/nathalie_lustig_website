// Two lists, one per surface. The homepage rail and the About page used to
// share these rows, which made About read as a repeat of something the visitor
// had already seen. The rail stays short and factual; About gets the longer,
// more characterful version.

export type RightNowRow = {
  label: string;
  value: string;
  note?: string;
  href?: string;
};

// Homepage rail. Kept to four short rows: the rail sits beside the note list,
// and a grid row is as tall as its taller column, so a longer list here strands
// empty space under the notes. RightRail caps at four regardless.
export const rightNow: RightNowRow[] = [
  { label: "Based in", value: "London" },
  { label: "Drinking", value: "Cappuccino" },
  { label: "Listening to", value: "Lo-fi, Chopin when I'm writing" },
  {
    label: "Trying to learn",
    value: "The difference between a GPU and a CPU",
  },
];

// About page. Deliberately different copy from the rail above, so the two
// surfaces do not read as duplicates. Kept to a handful of words each: these
// are asides, and the bio beside them is where the substance lives.
export const aboutNow: RightNowRow[] = [
  { label: "Based in", value: "London" },
  {
    label: "Sunday ritual",
    value: "A long walk on the Heath with a cappuccino (and sometimes a crêpe)",
  },
  {
    label: "Always reading",
    value: "Something about bonds, some history, and a novel I should have finished by now",
  },
  {
    label: "Currently curious about",
    value: "Where technology, capital markets and geopolitics meet",
  },
  {
    label: "Always up for",
    value: "A ski trip, a spontaneous weekend away, or a new restaurant",
  },
  {
    label: "One thing I've learned",
    value: "The best ideas often come from conversations outside your usual circle",
  },
];

export const rightNowMeta = {
  eyebrow: "Right now",
  blurb: "What's on the desk this month.",
};
