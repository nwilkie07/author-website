/**
 * GET /api/books
 *
 * Returns all books with their purchase links as a JSON array.
 * Used as a lightweight JSON endpoint for external consumers or direct
 * client fetches.
 *
 * Response shape: { books: BookWithPurchaseLinks[] }
 */
import { BooksService } from "../services/books";

export async function GET({ context }: { context: any }) {
  const db = context.cloudflare?.env?.DB;
  const booksService = new BooksService(db);
  const books = await booksService.getAllBooksWithPurchaseLinks();
  return new Response(JSON.stringify({ books }), {
    headers: { "Content-Type": "application/json" },
  });
}
