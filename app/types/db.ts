/**
 * Core database types — mirror the exact column names of each D1 table.
 *
 * These are the "raw" shapes returned directly from D1 queries. Page
 * components and API routes should prefer the camelCase `BookItem` type
 * from `~/types/books` for UI rendering, but these interfaces are the
 * canonical source of truth for the underlying data model.
 */

/** A single book row from the `books` table. */
export interface Book {
  id: number;
  name: string;
  description: string | null;
  series_title: string | null;
  series_number: number | null;
  by_line: string | null;
  alt_text: string | null;
  image_url: string;
  created_at: string;
  updated_at: string;
}

/** A purchase link row from the `purchase_links` table, foreign-keyed to a book. */
export interface PurchaseLink {
  id: number;
  book_id: number;
  store_name: string;
  url: string;
  icon_url: string | null;
  media_type: string;
  created_at: string;
  updated_at: string;
}

/** A book with its associated purchase links eagerly joined. */
export interface BookWithPurchaseLinks extends Book {
  purchase_links: PurchaseLink[];
}

/** A reader testimonial row from the `testimonials` table. */
export interface Testimonial {
  id: number;
  name: string;
  description: string | null;
  store: string;
  created_at: string;
  updated_at: string;
}

/** A CMS content row from the `page_contents` table. Each page can have multiple rows. */
export interface PageContent {
  id: number;
  page: string;
  title: string;
  description: string | null;
  created_at: string;
  updated_at: string;
}

/** A store icon row from the `icons` table (used on purchase link buttons). */
export interface Icon {
  id: number;
  name: string;
  image_url: string;
  media_type: string;
  created_at: string;
  updated_at: string;
}
