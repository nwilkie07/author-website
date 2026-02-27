export interface Book {
  id: number;
  name: string;
  description: string | null;
  series_title: string | null;
  series_number: number | null;
  image_url: string;
  created_at: string;
  updated_at: string;
}

export interface PurchaseLink {
  id: number;
  book_id: number;
  store_name: string;
  url: string;
  icon_url: string | null;
  media_type: string | null;
  created_at: string;
  updated_at: string;
}

export interface BookWithPurchaseLinks extends Book {
  purchase_links: PurchaseLink[];
}

export interface Testimonial {
  id: number;
  name: string;
  description: string | null;
  store: string;
  created_at: string;
  updated_at: string;
}

export interface PageContent {
  id: number;
  page: string;
  title: string;
  description: string | null;
  created_at: string;
  updated_at: string;
}
