// FALLBACK ONLY — edit via Sanity Studio at /studio
export type Book = {
  slotId: string;
  title: string;
  author: string;
  status: string;
  cover?: string;
};

export const books: Book[] = [
  {
    slotId: "book-age-of-innocence",
    title: "The Age of Innocence",
    author: "Edith Wharton",
    status: "Reading now",
    cover: "/books/age-of-innocence.jpg",
  },
  {
    slotId: "book-investors-handbook",
    title: "The Investor's Handbook",
    author: "Graham Wallas",
    status: "Next up, back in London",
    cover: "/books/investors-handbook.jpg",
  },
];
