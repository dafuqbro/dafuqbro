-- Migration: 0002_add_og_image.sql
-- Add og_image column to posts for custom per-post OG images
ALTER TABLE posts ADD COLUMN og_image TEXT;
