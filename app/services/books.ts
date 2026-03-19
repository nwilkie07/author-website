/**
 * BooksService — D1 data access layer for books and purchase links.
 *
 * Handles all CRUD operations for the `books` and `purchase_links` tables.
 * The service self-bootstraps both tables on first use via `ensureTables()`,
 * which also applies any outstanding schema migrations (e.g. adding the
 * `by_line`, `alt_text`, and `series_*` columns to pre-migration databases).
 *
 * Table relationships:
 *  - `books` — one row per book title
 *  - `purchase_links` — many-to-one with `books` via `book_id` (CASCADE delete)
 *
 * Typical usage in a route loader:
 * ```ts
 * const service = new BooksService(context.cloudflare.env.DB);
 * const books = await service.getAllBooksWithPurchaseLinks();
 * ```
 */
import type { Book, PurchaseLink, BookWithPurchaseLinks } from "../types/db";

export class BooksService {
  private _initialized: boolean = false;

  /**
   * Ensures both `books` and `purchase_links` tables exist and are
   * up-to-date. Runs once per service instance (guarded by `_initialized`).
   * Gracefully handles migration errors so a missing column never crashes
   * an existing database.
   */
  private async ensureTables(): Promise<void> {
    if (this._initialized) return;
    // Create tables if they do not exist yet. This bootstraps the DB on first use.
    await this.db.prepare(
      `CREATE TABLE IF NOT EXISTS books (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        name TEXT NOT NULL,
        description TEXT,
        image_url TEXT NOT NULL,
        by_line TEXT,
        alt_text TEXT,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
      )`
    ).run();
    // Migrate existing DBs that don't have the new columns yet
    try {
      const info = await this.db.prepare("PRAGMA table_info(books);").all<any>();
      const columns = (info as any).results?.map((r: any) => r.name) ?? [];
      if (!columns.includes("by_line")) {
        await this.db.prepare("ALTER TABLE books ADD COLUMN by_line TEXT").run();
      }
      if (!columns.includes("alt_text")) {
        await this.db.prepare("ALTER TABLE books ADD COLUMN alt_text TEXT").run();
      }
    } catch {
      // ignore migration errors
    }
    await this.db.prepare(
      `CREATE TABLE IF NOT EXISTS purchase_links (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        book_id INTEGER NOT NULL,
        store_name TEXT NOT NULL,
        url TEXT NOT NULL,
        icon_url TEXT,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY(book_id) REFERENCES books(id) ON DELETE CASCADE
      )`
    ).run();
    this._initialized = true;
  }
  constructor(private db: D1Database) {}

  /** Returns all books ordered by creation date descending (newest first). */
  async getAllBooks(): Promise<Book[]> {
    await this.ensureTables();
    const result = await this.db.prepare("SELECT * FROM books ORDER BY created_at DESC").all<Book>();
    return result.results;
  }

  /** Returns a single book by ID, or `null` if not found. */
  async getBookById(id: number): Promise<Book | null> {
    await this.ensureTables();
    const result = await this.db.prepare("SELECT * FROM books WHERE id = ?").bind(id).first<Book>();
    return result;
  }

  /** Returns a single book with its purchase links eagerly joined. Returns `null` if not found. */
  async getBookWithPurchaseLinks(id: number): Promise<BookWithPurchaseLinks | null> {
    await this.ensureTables();
    const book = await this.getBookById(id);
    if (!book) return null;

    const links = await this.getPurchaseLinksByBookId(id);
    return { ...book, purchase_links: links };
  }

  /**
   * Returns all books with their purchase links eagerly joined.
   * Executes one query per book (N+1), which is acceptable given the small
   * catalogue size and D1's low-latency local reads.
   */
  async getAllBooksWithPurchaseLinks(): Promise<BookWithPurchaseLinks[]> {
    await this.ensureTables();
    const books = await this.getAllBooks();
    const booksWithLinks = await Promise.all(
      books.map(async (book) => {
        const links = await this.getPurchaseLinksByBookId(book.id);
        return { ...book, purchase_links: links };
      })
    );
    return booksWithLinks;
  }

  async createBook(name: string, imageUrl: string, description?: string, seriesTitle?: string | null, seriesNumber?: number | null, byLine?: string | null, altText?: string | null): Promise<Book> {
    await this.ensureTables();
    const result = await this.db
      .prepare("INSERT INTO books (name, image_url, description, series_title, series_number, by_line, alt_text) VALUES (?, ?, ?, ?, ?, ?, ?) RETURNING *")
      .bind(name, imageUrl, description || null, seriesTitle ?? null, seriesNumber ?? null, byLine ?? null, altText ?? null)
      .first<Book>();
    
    if (!result) {
      throw new Error("Failed to create book");
    }
    return result;
  }

  async updateBook(id: number, name: string, imageUrl: string, description?: string, seriesTitle?: string | null, seriesNumber?: number | null, byLine?: string | null, altText?: string | null): Promise<Book | null> {
    await this.ensureTables();
    const result = await this.db
      .prepare("UPDATE books SET name = ?, image_url = ?, description = ?, series_title = ?, series_number = ?, by_line = ?, alt_text = ?, updated_at = CURRENT_TIMESTAMP WHERE id = ? RETURNING *")
      .bind(name, imageUrl, description || null, seriesTitle ?? null, seriesNumber ?? null, byLine ?? null, altText ?? null, id)
      .first<Book>();
    
    return result;
  }

  async deleteBook(id: number): Promise<boolean> {
    await this.ensureTables();
    const result = await this.db.prepare("DELETE FROM books WHERE id = ?").bind(id).run();
    return result.success;
  }

  /** Returns all purchase links for a given book, ordered by creation date ascending. */
  async getPurchaseLinksByBookId(bookId: number): Promise<PurchaseLink[]> {
    await this.ensureTables();
    const result = await this.db
      .prepare("SELECT * FROM purchase_links WHERE book_id = ? ORDER BY created_at ASC")
      .bind(bookId)
      .all<PurchaseLink>();
    return result.results;
  }

  async createPurchaseLink(bookId: number, storeName: string, url: string, iconUrl: string, media_type: string): Promise<PurchaseLink> {
    await this.ensureTables();
    const result = await this.db
      .prepare("INSERT INTO purchase_links (book_id, store_name, url, icon_url, media_type) VALUES (?, ?, ?, ?, ?) RETURNING *")
      .bind(bookId, storeName, url, iconUrl, media_type)
      .first<PurchaseLink>();
    
    if (!result) {
      throw new Error("Failed to create purchase link");
    }
    return result;
  }

  async updatePurchaseLink(id: number, storeName: string, url: string, iconUrl: string, media_type: string): Promise<PurchaseLink | null> {
    await this.ensureTables();
    const result = await this.db
      .prepare("UPDATE purchase_links SET store_name = ?, url = ?, icon_url = ?, media_type = ?, updated_at = CURRENT_TIMESTAMP WHERE id = ? RETURNING *")
      .bind(storeName, url, iconUrl, media_type, id)
      .first<PurchaseLink>();
    
    return result;
  }

  async deletePurchaseLink(id: number): Promise<boolean> {
    await this.ensureTables();
    const result = await this.db.prepare("DELETE FROM purchase_links WHERE id = ?").bind(id).run();
    return result.success;
  }
}
