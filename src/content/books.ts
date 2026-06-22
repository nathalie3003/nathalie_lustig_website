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
    slotId: "book-intelligent-investor",
    title: "The Intelligent Investor",
    author: "Benjamin Graham",
    status: "Next up",
    cover: "/books/intelligent-investor.jpg",
  },
];
