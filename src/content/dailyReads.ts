// FALLBACK ONLY — edit via Sanity Studio at /studio
export type DailyRead = { name: string; url: string; short: string };

export const dailyReads: DailyRead[] = [
  { name: "Financial Times", url: "https://www.ft.com", short: "FT" },
  {
    name: "Points of Return (John Authers)",
    url: "https://www.bloomberg.com/account/newsletters/points-of-return",
    short: "PoR",
  },
  { name: "Wall Street Journal", url: "https://www.wsj.com", short: "WSJ" },
  {
    name: "Eye on the Market (Michael Cembalest)",
    url: "https://privatebank.jpmorgan.com/nam/en/insights/markets-and-investing/eye-on-the-market",
    short: "EoM",
  },
];
