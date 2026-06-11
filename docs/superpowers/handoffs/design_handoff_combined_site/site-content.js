// Tone packs for the combined site.
// Only the *voice* copy changes between tones — the notes, projects, contact
// details and newsletter list stay constant (they're the real content).
// The contact-footer line is identical across tones: Nathalie asked to keep
// "Happy to chat about bonds, books, or anything in between." exactly.

window.TONES = [
  {
    key: "desk",
    switchLabel: "Desk note",
    hero: {
      kicker: "Fixed income notes",
      lead: "Notes on rates, credit, and sovereign issuance — translating what I read across the market into my own analysis.",
      creds: "LSE Economics · ex-J.P. Morgan Private Bank · CFA Level I",
    },
    railRole: "Writing on rates, credit, and sovereigns. LSE Economics, formerly J.P. Morgan's Global Private Bank, CFA Level I.",
    notesHead: "Latest notes",
    notesLink: "All notes →",
    readLatest: "Read the latest →",
    cvLabel: "Download CV",
    readsHead: "What I'm reading",
    readsNote: "The newsletters and papers these notes lean on.",
    contactIntro: "Happy to chat about bonds, books, or anything in between.",
    menu: {
      notes: "Rates, credit & sovereigns",
      about: "Background & approach",
      projects: "Building & writing on the side",
    },
  },
  {
    key: "warm",
    switchLabel: "Personal",
    hero: {
      kicker: "Hi, I'm Nathalie",
      lead: "I write these to make sense of the bond market in my own words — rates, credit, the odd sovereign drama.",
      creds: "LSE graduate · once a J.P. Morgan summer analyst · CFA Level I",
    },
    railRole: "Hi! I read the bond market closely and write up what I learn here. LSE, a summer at J.P. Morgan, CFA Level I.",
    notesHead: "What I've been writing",
    notesLink: "See all →",
    readLatest: "Read my latest →",
    cvLabel: "My CV (PDF)",
    readsHead: "On my reading list",
    readsNote: "The newsletters I open first most mornings.",
    contactIntro: "Happy to chat about bonds, books, or anything in between.",
    menu: {
      notes: "The latest from me",
      about: "A bit about me",
      projects: "Things I've built",
    },
  },
  {
    key: "punchy",
    switchLabel: "Punchy",
    hero: {
      kicker: "Bonds · Opinions included",
      lead: "Rates, credit, sovereigns — the bond market read closely and argued with. No filler.",
      creds: "LSE · ex-J.P. Morgan · CFA Level I",
    },
    railRole: "Bond-market notes — sharp, short, and willing to take a side. LSE · ex-J.P. Morgan · CFA Level I.",
    notesHead: "The notes",
    notesLink: "All of them →",
    readLatest: "Start with the latest →",
    cvLabel: "Grab my CV",
    readsHead: "What I read",
    readsNote: "Where the takes come from.",
    contactIntro: "Happy to chat about bonds, books, or anything in between.",
    menu: {
      notes: "Short, sharp, no filler",
      about: "The short version",
      projects: "Receipts",
    },
  },
];

// Pretty host for a newsletter href — strips protocol + www, keeps the host so
// the link visibly points at the publication's home page.
window.readHost = function (href) {
  try {
    const u = new URL(href);
    return u.hostname.replace(/^www\./, "");
  } catch (e) {
    return href;
  }
};

// Category metadata reused from the explorations.
window.noteCat = function (slug) {
  const map = {
    "private-credit": { cat: "Credit", read: "3 min" },
    "gilts-long-end": { cat: "Rates", read: "4 min" },
    "ecb-pause": { cat: "Rates", read: "3 min" },
    "term-sheet-reading": { cat: "Credit", read: "4 min" },
    "argentina-again": { cat: "Sovereigns", read: "3 min" },
  };
  return map[slug] || { cat: "Note", read: "3 min" };
};
