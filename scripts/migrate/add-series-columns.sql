-- Cloudflare D1: add series fields to books table
ALTER TABLE books ADD COLUMN series_title TEXT NULL;
ALTER TABLE books ADD COLUMN series_number INTEGER NULL;
