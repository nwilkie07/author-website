import type { Book, PurchaseLink, BookWithPurchaseLinks } from "../types/db";

export class BooksService {
  private _initialized: boolean = false;

  private async ensureTables(): Promise<void> {
    if (this._initialized) return;
    // Create tables if they do not exist yet. This bootstraps the DB on first use.
    await this.db.prepare(
      `CREATE TABLE IF NOT EXISTS books (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        name TEXT NOT NULL,
        description TEXT,
        image_url TEXT NOT NULL,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
      )`
    ).run();
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

  async getAllBooks(): Promise<Book[]> {
    await this.ensureTables();
    const result = await this.db.prepare("SELECT * FROM books ORDER BY created_at DESC").all<Book>();
    return result.results;
  }

  async getBookById(id: number): Promise<Book | null> {
    await this.ensureTables();
    const result = await this.db.prepare("SELECT * FROM books WHERE id = ?").bind(id).first<Book>();
    return result;
  }

  async getBookWithPurchaseLinks(id: number): Promise<BookWithPurchaseLinks | null> {
    await this.ensureTables();
    const book = await this.getBookById(id);
    if (!book) return null;

    const links = await this.getPurchaseLinksByBookId(id);
    return { ...book, purchase_links: links };
  }

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

  async createBook(name: string, imageUrl: string, description?: string, seriesTitle?: string | null, seriesNumber?: number | null): Promise<Book> {
    await this.ensureTables();
    const result = await this.db
      .prepare("INSERT INTO books (name, image_url, description, series_title, series_number) VALUES (?, ?, ?, ?, ?) RETURNING *")
      .bind(name, imageUrl, description || null, seriesTitle ?? null, seriesNumber ?? null)
      .first<Book>();
    
    if (!result) {
      throw new Error("Failed to create book");
    }
    return result;
  }

  async updateBook(id: number, name: string, imageUrl: string, description?: string, seriesTitle?: string | null, seriesNumber?: number | null): Promise<Book | null> {
    await this.ensureTables();
    const result = await this.db
      .prepare("UPDATE books SET name = ?, image_url = ?, description = ?, series_title = ?, series_number = ?, updated_at = CURRENT_TIMESTAMP WHERE id = ? RETURNING *")
      .bind(name, imageUrl, description || null, seriesTitle ?? null, seriesNumber ?? null, id)
      .first<Book>();
    
    return result;
  }

  async deleteBook(id: number): Promise<boolean> {
    await this.ensureTables();
    const result = await this.db.prepare("DELETE FROM books WHERE id = ?").bind(id).run();
    return result.success;
  }

  async getPurchaseLinksByBookId(bookId: number): Promise<PurchaseLink[]> {
    await this.ensureTables();
    const result = await this.db
      .prepare("SELECT * FROM purchase_links WHERE book_id = ? ORDER BY created_at ASC")
      .bind(bookId)
      .all<PurchaseLink>();
    return result.results;
  }

  async createPurchaseLink(bookId: number, storeName: string, url: string, iconUrl?: string): Promise<PurchaseLink> {
    await this.ensureTables();
    const result = await this.db
      .prepare("INSERT INTO purchase_links (book_id, store_name, url, icon_url) VALUES (?, ?, ?, ?) RETURNING *")
      .bind(bookId, storeName, url, iconUrl || null)
      .first<PurchaseLink>();
    
    if (!result) {
      throw new Error("Failed to create purchase link");
    }
    return result;
  }

  async updatePurchaseLink(id: number, storeName: string, url: string, iconUrl?: string): Promise<PurchaseLink | null> {
    await this.ensureTables();
    const result = await this.db
      .prepare("UPDATE purchase_links SET store_name = ?, url = ?, icon_url = ?, updated_at = CURRENT_TIMESTAMP WHERE id = ? RETURNING *")
      .bind(storeName, url, iconUrl || null, id)
      .first<PurchaseLink>();
    
    return result;
  }

  async deletePurchaseLink(id: number): Promise<boolean> {
    await this.ensureTables();
    const result = await this.db.prepare("DELETE FROM purchase_links WHERE id = ?").bind(id).run();
    return result.success;
  }
}
