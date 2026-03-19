/**
 * PageContentService — D1 data access layer for CMS-managed page content.
 *
 * Each public page (home, about, contact, speaking) has one or more rows in
 * the `page_contents` table containing a `title` and a rich-text `description`
 * (HTML string edited via TinyMCE in the admin panel). Pages query their own
 * rows by name; `getContentByPages` allows a single bulk query for the
 * prefetch endpoint.
 *
 * Content is returned as raw HTML and must be sanitized before rendering with
 * `dangerouslySetInnerHTML` — use `sanitizeHTML` (lightweight fallback) or
 * DOMPurify (used in welcome.tsx and about.tsx).
 */
import type { PageContent } from "../types/db";

export class PageContentService {
  constructor(private db: D1Database) {}

  async getContentByPage(page: string): Promise<PageContent[]> {
    const result = await this.db
      .prepare("SELECT * FROM page_contents WHERE page = ? ORDER BY created_at ASC")
      .bind(page)
      .all<PageContent>();
    return result.results;
  }

  async getContentById(id: number): Promise<PageContent | null> {
    const result = await this.db
      .prepare("SELECT * FROM page_contents WHERE id = ?")
      .bind(id)
      .first<PageContent>();
    return result;
  }

  async getAllContent(): Promise<PageContent[]> {
    const result = await this.db
      .prepare("SELECT * FROM page_contents ORDER BY page, created_at ASC")
      .all<PageContent>();
    return result.results;
  }

  async createContent(page: string, title: string, description?: string): Promise<PageContent> {
    const result = await this.db
      .prepare("INSERT INTO page_contents (page, title, description) VALUES (?, ?, ?) RETURNING *")
      .bind(page, title, description || null)
      .first<PageContent>();
    
    if (!result) {
      throw new Error("Failed to create page content");
    }
    return result;
  }

  async updateContent(id: number, page: string, title: string, description?: string): Promise<PageContent | null> {
    const result = await this.db
      .prepare("UPDATE page_contents SET page = ?, title = ?, description = ?, updated_at = CURRENT_TIMESTAMP WHERE id = ? RETURNING *")
      .bind(page, title, description || null, id)
      .first<PageContent>();
    
    return result;
  }

  async deleteContent(id: number): Promise<boolean> {
    const result = await this.db
      .prepare("DELETE FROM page_contents WHERE id = ?")
      .bind(id)
      .run();
    return result.success;
  }

  /**
   * Bulk-fetches content for multiple pages in a single D1 query.
   * Returns a map of `{ [pageName]: PageContent[] }`.
   * Pages with no rows are absent from the returned object (not empty arrays).
   * Used by the `/api/prefetch` endpoint to seed all page content at once.
   */
  async getContentByPages(pages: string[]): Promise<Record<string, PageContent[]>> {
    const placeholders = pages.map(() => "?").join(",");
    const result = await this.db
      .prepare(`SELECT * FROM page_contents WHERE page IN (${placeholders}) ORDER BY page, created_at ASC`)
      .bind(...pages)
      .all<PageContent>();
    
    const grouped: Record<string, PageContent[]> = {};
    for (const content of result.results) {
      if (!grouped[content.page]) {
        grouped[content.page] = [];
      }
      grouped[content.page].push(content);
    }
    return grouped;
  }
}
