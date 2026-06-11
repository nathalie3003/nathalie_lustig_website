export type Contact = { label: string; value: string; href: string };

export const about = {
  headline: "About",
  paragraphs: [
    "Hi, I'm Nathalie. I recently graduated from the London School of Economics with a BSc in Economics and Social Policy, and passed CFA Level I earlier this year. Last summer I worked at J.P. Morgan's Global Private Bank as a Summer Analyst — supporting bankers and investors on client portfolios, market analysis, and weekly updates for senior management. That's where the habit of writing this kind of thing started.",
    "What I keep coming back to are bonds — rates, credit, sovereign issuance, restructuring — the way these moving parts price the economy in real time. I write these notes whenever something in the market is worth thinking through, to put what I'm reading into my own words and stay close to a market I find genuinely interesting. On the side I'm building bond pricing models in Excel to make the theory click.",
    "Outside finance, I founded Little Miss London Jewellery during the pandemic — turned £40 of pocket money into over £7,000 in annual revenue at sixteen, and raised more than £1,300 for a domestic-abuse charity through it. I swam competitively for over twelve years, won eleven international medals (a Team GB record at the Maccabi European Games), and still coach part-time. When I'm not writing here, I'm usually reading — behavioural finance, value investing, fiction — and reviewing books on my portfolio.",
  ],
  contact: [
    { label: "Email", value: "nathalie.lustig03@gmail.com", href: "mailto:nathalie.lustig03@gmail.com" },
    { label: "LinkedIn", value: "linkedin.com/in/nathalielustig", href: "https://www.linkedin.com/in/nathalielustig/" },
    { label: "Phone", value: "+44 7741 467690", href: "tel:+447741467690" },
  ] satisfies Contact[],
};
