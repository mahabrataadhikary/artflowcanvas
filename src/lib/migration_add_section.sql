-- Migration: Add section column to artworks table
ALTER TABLE artworks ADD COLUMN section TEXT DEFAULT 'gallery';
