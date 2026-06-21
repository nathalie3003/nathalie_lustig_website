// Hardcoded for now. Edit this file to update the homepage "Right now" block.
// Each row renders as a labeled pair. `note` is an optional italic aside;
// `href` makes the value clickable.

export type RightNowRow = {
  label: string;
  value: string;
  note?: string;
  href?: string;
};

export const rightNow: RightNowRow[] = [
  { label: "Listening to", value: "Tame Impala, Chopin when I'm studying" },
  { label: "Based in", value: "London" },
  {
    label: "Drinking",
    value: "a cappuccino",
    note: "Want to question every coffee you ever will buy?",
    href: "/files/44151.pdf",
  },
  { label: "Trying to learn", value: "Für Elise, on the piano" },
  {
    label: "Defending in arguments",
    value: "that bonds are interesting, actually",
  },
];

export const rightNowMeta = {
  eyebrow: "Right now",
  blurb: "What's on the desk this month.",
};
