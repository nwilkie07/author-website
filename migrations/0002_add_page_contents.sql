-- Create page_contents table
CREATE TABLE IF NOT EXISTS page_contents (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  page TEXT NOT NULL,
  title TEXT NOT NULL,
  description TEXT,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

-- Create index for faster page lookups
CREATE INDEX IF NOT EXISTS idx_page_contents_page ON page_contents(page);
