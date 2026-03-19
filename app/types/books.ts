/**
 * Client-facing book types.
 *
 * These types are camelCase-mapped views of the raw DB rows, intended for use
 * in UI components. `processBooks` partitions a flat list of books into series
 * groups and standalone titles, which is how `BookDisplay` renders them.
 */
import type { PurchaseLink } from "../types/db";

/**
 * A single book as consumed by UI components.
 * Fields mirror `Book` from `~/types/db` but use camelCase naming.
 */
export type BookItem = {
  id: number;
  name: string;
  imageUrl: string;
  description: string | null;
  seriesTitle: string | null;
  seriesNumber: number | null;
  byLine: string | null;
  altText: string | null;
  purchaseLinks: PurchaseLink[];
};

/** A named series containing an ordered list of books. */
export type SeriesGroup = {
  title: string;
  books: BookItem[];
};

/**
 * Partitions a flat array of books into series groups and standalone titles.
 *
 * Books with a `seriesTitle` are grouped under that title and sorted by
 * `seriesNumber` ascending. Series groups themselves are sorted alphabetically
 * by title. Books without a `seriesTitle` are collected into `standaloneBooks`
 * in their original order.
 *
 * @returns `{ seriesGroups, standaloneBooks }`
 */
export function processBooks(
  books: Array<{
    id: number;
    name: string;
    imageUrl: string;
    description: string | null;
    seriesTitle: string | null;
    seriesNumber: number | null;
    byLine: string;
    altText: string;
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
