// The personal "Right now" asides, shown on the About page.

export type RightNowRow = {
  label: string;
  value: string;
  note?: string;
  href?: string;
};

// Kept to a handful of words each: these
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
