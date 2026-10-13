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
  { label: "Travelling", value: "Café hopping in Hanoi" },
  { label: "Away from the desk", value: "Skiing (though my ACLs wish otherwise)" },
  { label: "Still learning", value: "Für Elise" },
  { label: "Reading", value: "The Age of Innocence, for the footnotes" },
  {
    label: "Still arguing that",
    value: "'Boring' is the highest compliment a bond can earn",
  },
];

export const rightNowMeta = {
  eyebrow: "Right now",
  blurb: "What's on the desk this month.",
};
