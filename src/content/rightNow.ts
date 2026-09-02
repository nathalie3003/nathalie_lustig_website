// Hardcoded for now. Edit this file to update the "Right Now" rows, which
// appear in the homepage rail and on the About page.

export type RightNowRow = {
  label: string;
  value: string;
  note?: string;
  href?: string;
};

export const rightNow: RightNowRow[] = [
  { label: "Based in", value: "London, writing from a coffee shop in Hanoi" },
  {
    label: "Drinking",
    value: "Vietnamese egg coffee",
    note: "Want to question every coffee you will ever buy?",
    href: "/files/44151.pdf",
  },
  { label: "Listening to", value: "Lo-fi, Chopin when I'm writing" },
  {
    label: "Trying to learn",
    value: "How to stop confusing 'hello' and 'sorry' in Vietnamese",
  },
  { label: "Reading", value: "The Age of Innocence, mostly for the footnotes" },
  {
    label: "Still arguing that",
    value: "'Boring' is the highest compliment a bond can earn",
  },
];

export const rightNowMeta = {
  eyebrow: "Right now",
  blurb: "What's on the desk this month.",
};
