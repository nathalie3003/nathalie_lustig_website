// FALLBACK ONLY — edit via Sanity Studio at /studio
export type Project = {
  slotId: string;
  title: string;
  url: string;
  href: string;
  live: boolean;
  status: string;
  statusNote: string;
  faviconLabel: string;
  description: string;
  image: string;
  imageFit?: "cover" | "contain";
};

export const projects: Project[] = [
  {
    slotId: "proj-desktop-diary",
    title: "Desktop Diary",
    url: "",
    href: "",
    live: false,
    status: "Work in progress",
    statusNote: "In build",
    faviconLabel: "DD",
    description:
      "A small diary that lives in the Mac menu bar or Windows tray. Jot something down, keep a to-do list, track projects, and everything stays on your own computer.",
    image: "/projects/desktop-diary.png",
    imageFit: "contain",
  },
  {
    slotId: "proj-lml",
    title: "Little Miss London Jewellery",
    url: "littlemisslondonjewellery.com",
    href: "https://littlemisslondonjewellery.com/",
    live: false,
    status: "Work in progress",
    statusNote: "Rebuilding",
    faviconLabel: "LML",
    description:
      "The jewellery label I founded as a teenager, currently being rebuilt. New site dropping later this year.",
    image: "/projects/lml-site.png",
    imageFit: "cover",
  },
  {
    slotId: "proj-books",
    title: "Book Portfolio",
    url: "myportfolio.base44.app/Reviews",
    href: "https://myportfolio.base44.app/Reviews",
    // Not live: the base44 address no longer works, so no link is shown.
    live: false,
    status: "Work in progress",
    statusNote: "Updated as I read",
    faviconLabel: "BP",
    description:
      "Short reviews of what I'm reading: behavioural finance, value investing, and the occasional novel.",
    image: "/projects/books.png",
  },
];
