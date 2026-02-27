-- Migration number: 0005 	 2026-02-26T12:00:22.174Z
ALTER TABLE books ADD COLUMN series_title TEXT NULL;
ALTER TABLE books ADD COLUMN series_number INTEGER NULL;