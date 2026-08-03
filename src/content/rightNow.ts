// Hardcoded for now. Edit this file to update the "Right Now" block
// that sits sticky on the right side of the About section.

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
    note: "Want to question every coffee you will ever buy?",
    href: "/files/44151.pdf",
  },
  { label: "Trying to learn", value: "Für Elise on the piano" },
  {
    label: "Defending in arguments",
    value: "that 'boring' is the highest compliment a bond can earn",
  },
];

export const rightNowMeta = {
  eyebrow: "Right now",
  blurb: "What's on the desk this month.",
};
