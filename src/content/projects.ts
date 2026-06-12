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
};

export const projects: Project[] = [
  {
    slotId: "proj-lml",
    title: "Little Miss London Jewellery",
    url: "littlemisslondonjewellery.com",
    href: "https://littlemisslondonjewellery.com/",
    live: true,
    status: "Live",
    statusNote: "Updated as the brand grows",
    faviconLabel: "LML",
    description:
      "The jewellery label I founded as a teenager — handmade pieces, a soft relaunch in progress.",
    image: "/projects/lml.png",
  },
  {
    slotId: "proj-books",
    title: "Book Portfolio",
    url: "myportfolio.base44.app/Reviews",
    href: "https://myportfolio.base44.app/Reviews",
    live: true,
    status: "Live",
    statusNote: "Updated as I read",
    faviconLabel: "BP",
    description:
      "Short reviews of what I'm reading — behavioural finance, value investing, and the occasional novel.",
    image: "/projects/books.jpg",
  },
];
