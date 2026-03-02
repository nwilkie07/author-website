import type { PurchaseLink } from "../types/db";

export type BookItem = {
  id: number;
  name: string;
  imageUrl: string;
  description: string | null;
  seriesTitle: string | null;
  seriesNumber: number | null;
  byLine: string;
  purchaseLinks: PurchaseLink[];
};

export type SeriesGroup = {
  title: string;
  books: BookItem[];
};

export function processBooks(
  books: Array<{
    id: number;
    name: string;
    imageUrl: string;
    description: string | null;
    seriesTitle: string | null;
    seriesNumber: number | null;
    byLine: string;
    purchaseLinks: PurchaseLink[];
  }>,
): { seriesGroups: SeriesGroup[]; standaloneBooks: BookItem[] } {
  const seriesGroups: SeriesGroup[] = [];
  const standaloneBooks: BookItem[] = [];

  books.forEach((book) => {
    if (book.seriesTitle) {
      const existing = seriesGroups.find((g) => g.title === book.seriesTitle);
      if (existing) {
        existing.books.push(book);
      } else {
        seriesGroups.push({ title: book.seriesTitle, books: [book] });
      }
    } else {
      standaloneBooks.push(book);
    }
  });

  seriesGroups.forEach((group) => {
    group.books.sort((a, b) => (a.seriesNumber ?? 0) - (b.seriesNumber ?? 0));
  });

  seriesGroups.sort((a, b) => a.title.localeCompare(b.title));

  return { seriesGroups, standaloneBooks };
}
