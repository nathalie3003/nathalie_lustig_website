// FALLBACK ONLY — edit via Sanity Studio at /studio
export type Contact = { label: string; value: string; href: string };

export const about = {
  headline: "About",
  paragraphs: [
    "Hi, I'm Nathalie, a recent graduate from the London School of Economics with a BSc in Economics and Social Policy, and passed the CFA Level I exam earlier this year. That's where the habit of writing this kind of thing started. During my degree I worked as a Summer Analyst at J.P. Morgan's Global Private Bank.",
    "What I keep coming back to are bonds. The way rates, inflation expectations, and central bank credibility interact with macro fundamentals always has its own story to tell, and bond markets tend to be one of the more honest real-time reads on the economic outlook.",
    "I write a note whenever something in the market is worth thinking through properly, to put what I'm reading into my own words and keep a record of how my thinking shifts as the data does.",
  ],
  contact: [
    { label: "Email", value: "nathalie@thebasispoint.finance", href: "mailto:nathalie@thebasispoint.finance" },
    { label: "LinkedIn", value: "linkedin.com/in/nathalielustig", href: "https://www.linkedin.com/in/nathalielustig/" },
    { label: "Phone", value: "+44 7741 467690", href: "tel:+447741467690" },
  ] satisfies Contact[],
};
