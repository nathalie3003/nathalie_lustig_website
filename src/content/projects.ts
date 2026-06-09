export type Project = {
  name: string;
  description: string;
  href: string;
  image: string;
};

export const projects: Project[] = [
  {
    name: "LittleMissLondon",
    description: "An independent jewelry brand I'm building — design, sourcing, and storefront.",
    href: "https://little-miss-london.vercel.app/",
    image: "/projects/lml.jpg",
  },
  {
    name: "Book Portfolio",
    description: "Reviews of business and fiction books I've read since 2025.",
    href: "https://myportfolio.base44.app/Reviews",
    image: "/projects/books.jpg",
  },
];
