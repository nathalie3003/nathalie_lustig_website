// Content for the prototype.
// Real copy pulled from the live site (nathalie-lustig-website.vercel.app).
// Notes 2–5 are SAMPLE content (the live site has one test note whose body is
// "Test") — seeded so typography and index density can be judged honestly.

window.SITE_CONTENT = {
  name: "Nathalie Lustig",
  tagline: "Writing on bond markets, twice a week. LSE graduate, ex-J.P. Morgan, CFA Level I.",
  cvHref: "#cv",

  navLinks: [
    { label: "Notes", route: "/notes" },
    { label: "About", route: "/about" },
    { label: "Projects", route: "/projects" },
  ],

  dailyReads: [
    { code: "FT", title: "Financial Times", href: "https://www.ft.com" },
    { code: "BB", title: "Bloomberg", href: "https://www.bloomberg.com" },
    { code: "PoR", title: "Points of Return (John Authers)", href: "https://www.bloomberg.com/account/newsletters/points-of-return" },
    { code: "WSJ", title: "Wall Street Journal", href: "https://www.wsj.com" },
    { code: "EoM", title: "Eye on the Market (Michael Cembalest)", href: "https://privatebank.jpmorgan.com/nam/en/insights/markets-and-investing/eye-on-the-market" },
  ],

  about: {
    paragraphs: [
      "Hi, I'm Nathalie. I recently graduated from the London School of Economics with a BSc in Economics and Social Policy, and passed CFA Level I earlier this year. Last summer I worked at J.P. Morgan's Global Private Bank as a Summer Analyst — supporting bankers and investors on client portfolios, market analysis, and weekly updates for senior management. That's where the habit of writing this kind of thing started.",
      "What I keep coming back to are bonds — rates, credit, sovereign issuance, restructuring — the way these moving parts price the economy in real time. I write these notes whenever something in the market is worth thinking through, to put what I'm reading into my own words and stay close to a market I find genuinely interesting. On the side I'm building bond pricing models in Excel to make the theory click.",
      "Outside finance, I founded Little Miss London Jewellery during the pandemic — turned £40 of pocket money into over £7,000 in annual revenue at sixteen, and raised more than £1,300 for a domestic-abuse charity through it. I swam competitively for over twelve years, won eleven international medals (a Team GB record at the Maccabi European Games), and still coach part-time. When I'm not writing here, I'm usually reading — behavioural finance, value investing, fiction — and reviewing books on my portfolio.",
    ],
    contactIntro: "Happy to chat about bonds, books, or anything in between.",
    contact: [
      { label: "Email", value: "nathalie.lustig03@gmail.com", href: "mailto:nathalie.lustig03@gmail.com" },
      { label: "LinkedIn", value: "linkedin.com/in/nathalielustig", href: "https://www.linkedin.com/in/nathalielustig/" },
      { label: "Phone", value: "+44 7741 467690", href: "tel:+447741467690" },
    ],
  },

  projects: [
    {
      slotId: "proj-lml",
      title: "Little Miss London Jewellery",
      url: "littlemisslondon.co.uk",
      href: "#",
      live: false,
      status: "In build",
      statusNote: "Launching September 2026",
      faviconLabel: "LML",
      description: "The jewellery label I founded as a teenager, reborn — handmade pieces and a brand-new shopfront. Currently being built ahead of an autumn launch.",
    },
    {
      slotId: "proj-books",
      title: "Book Portfolio",
      url: "nathalie-lustig-website.vercel.app/books",
      href: "#",
      live: true,
      status: "Live",
      statusNote: "Updated as I read",
      faviconLabel: "BP",
      description: "Short reviews of what I'm reading — behavioural finance, value investing, and the occasional novel.",
    },
  ],

  // Books shown in the right rail beneath the newsletters. Covers are
  // user-fillable image-slots (drag a cover in); slotId keys the persistence.
  books: [
    {
      slotId: "book-age-of-innocence",
      title: "The Age of Innocence",
      author: "Edith Wharton",
      status: "Reading now",
    },
    {
      slotId: "book-investors-handbook",
      title: "The Investor's Handbook",
      author: "Graham Wallas",
      status: "Next up, back in London",
    },
  ],

  // Note 1 is real (title/date/excerpt from the live site; body fleshed out as
  // sample copy since the published body is a one-word test). Notes 2–5 are sample.
  notes: [
    {
      slug: "private-credit",
      title: "Private Credit !",
      date: "9 Jun 2026",
      dateLong: "9 June 2026",
      excerpt: "Is it really 40 or 5?",
      sample: false,
      body: [
        { type: "p", text: "Everyone agrees private credit has grown fast. Nobody agrees on how big it actually is. Depending on who you ask, the asset class is either a $40 trillion shadow looming over the banking system or a $5 trillion niche that mostly refinanced loans banks didn't want anyway." },
        { type: "p", text: "The gap isn't sloppiness — it's definitional. The big number counts everything that isn't a public bond or a syndicated loan: direct lending, asset-based finance, infrastructure debt, significant chunks of insurance balance sheets. The small number counts committed capital in direct-lending funds. Both are 'private credit'. Only one of them is new." },
        { type: "quote", text: "When a market's size estimate varies by a factor of eight, the interesting question is rarely the size. It's who benefits from each definition." },
        { type: "p", text: "Managers raising funds like the big number — it makes the opportunity set look bottomless. Regulators worried about systemic risk also like the big number, for opposite reasons. Banks arguing they shouldn't face tighter capital rules prefer the small one: look, the risk left our balance sheet." },
        { type: "p", text: "My working view: the honest figure for genuinely new lending capacity is closer to the small number, but the honest figure for what would behave badly in a stress is somewhere in between — because the asset-based finance being rebadged as private credit was sitting somewhere before, and that somewhere was usually a bank." },
      ],
    },
    {
      slug: "gilts-long-end",
      title: "What the long end of the gilt curve is sulking about",
      date: "4 Jun 2026",
      dateLong: "4 June 2026",
      excerpt: "Thirty-year yields aren't pricing inflation. They're pricing supply, and the DMO's syndication calendar reads like a confession.",
      sample: true,
      body: [
        { type: "p", text: "Thirty-year gilt yields have spent the spring grinding higher while short rates barely moved. The textbook explanation — higher long-run inflation expectations — doesn't survive contact with the breakeven curve, which has been almost flat. Something else is going on at the long end, and it's mostly arithmetic." },
        { type: "p", text: "The buyer base that used to absorb long-duration supply on autopilot — defined-benefit pension schemes hedging liabilities — is structurally shrinking. Schemes are better funded, buying out, and de-risking into shorter assets. Meanwhile issuance needs are not shrinking. When your most price-insensitive buyer leaves the room, the price-sensitive ones get to set the price." },
        { type: "h2", text: "The term premium is doing the work" },
        { type: "p", text: "Decompose the move and almost all of it lands in term premium rather than expected rates. That's the market charging more for duration risk it used to warehouse for free. It's also why the curve steepening feels sticky: there's no central bank decision that un-retires a pension scheme." },
        { type: "p", text: "Watch the syndication results rather than the auctions. Syndications are where the DMO discovers what real demand looks like when it can't lean on primary dealers' obligations — and the concessions have been getting wider all year." },
      ],
    },
    {
      slug: "ecb-pause",
      title: "What the ECB's pause actually prices",
      date: "1 Jun 2026",
      dateLong: "1 June 2026",
      excerpt: "A 'pause' is only boring if you ignore what the curve does with it. The euro front end is telling a different story from the press conference.",
      sample: true,
      body: [
        { type: "p", text: "The ECB held again last week, and the press conference was a masterclass in saying nothing. But policy is a path, not a level — and the path implied by the euro front end shifted meaningfully even as the decision surprised nobody." },
        { type: "p", text: "Before the meeting, the forwards had roughly two more cuts priced by year-end. After it, closer to one. That repricing — fifteen-odd basis points across the white pack — is the actual monetary event. The hold was the headline; the path was the news." },
        { type: "p", text: "The mechanism worth internalising: when a central bank pauses while data is softening, it's communicating a higher bar for action, and the market prices that bar directly into the forwards. You don't need a hike to get tightening. You just need patience to become policy." },
        { type: "figure", caption: "€STR forward curve, before vs. after the June meeting. Chart placeholder — would be rebuilt from Bloomberg data.", placeholder: "Chart — €STR forwards" },
        { type: "p", text: "For credit, the second-order effect matters more than the first: a slower path keeps the carry trade alive longer, which keeps spreads pinned, which keeps issuance windows open. CFOs noticed. The June pipeline filled within days." },
      ],
    },
    {
      slug: "term-sheet-reading",
      title: "How to read a new-issue term sheet in ninety seconds",
      date: "28 May 2026",
      dateLong: "28 May 2026",
      excerpt: "Most of a term sheet is boilerplate. Three lines aren't: the spread to benchmark, the call schedule, and what counts as a change of control.",
      sample: true,
      body: [
        { type: "p", text: "A new-issue term sheet is mostly furniture. The issuer's lawyers and the dealers' lawyers have negotiated the same paragraphs a hundred times, and the result is boilerplate that exists so nobody has to read it. But three lines are live every single time, and they're where the deal actually happens." },
        { type: "p", text: "First, the spread to benchmark — not the coupon. The coupon is a residual of where rates happened to be that morning. The spread is the price of the credit, and the gap between initial price talk and final pricing tells you how the book built. Forty basis points of tightening from IPTs is a hot deal; five is a struggle dressed in a press release." },
        { type: "p", text: "Second, the call schedule. A bond callable at par in two years is a very different instrument from one callable at a make-whole — the issuer has bought an option from you, and the question is whether the spread pays you for it." },
        { type: "p", text: "Third, change of control. The put at 101 sounds protective until you read which events trigger it — and which conveniently don't. Sponsors' lawyers earn their fees in the definitions section, not the covenants." },
      ],
    },
    {
      slug: "argentina-again",
      title: "Argentina, again",
      date: "25 May 2026",
      dateLong: "25 May 2026",
      excerpt: "Ninth restructuring or first success story? The bonds say investors have stopped pricing the history and started pricing the program.",
      sample: true,
      body: [
        { type: "p", text: "There's a well-worn joke that Argentina is a sovereign restructuring with a country attached. Nine defaults gives the joke its teeth. But the price action this year suggests the market has — cautiously, reversibly — stopped trading the history." },
        { type: "p", text: "The restructured globals have rallied to levels that no longer price a near-term credit event, and the curve has dis-inverted: longer bonds now yield more than shorter ones, which is what normal countries look like. An inverted sovereign curve says 'we are arguing about recovery values'. A normal one says 'we are arguing about growth'. That shift is the whole story." },
        { type: "quote", text: "Sovereign credit is the only market where the borrower can change the law it borrowed under. Everything else about it is just corporate credit with worse data." },
        { type: "p", text: "The risk case hasn't changed: reserves are thin, the political calendar is never far away, and the peso's real appreciation is doing quiet damage to the current account. What's changed is the burden of proof. For the first time in a decade, the bears have to make an argument too." },
      ],
    },
  ],
};
