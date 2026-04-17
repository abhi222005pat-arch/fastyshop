-- ============================================================
--  Fasty Shop — Migration: Add image columns to products
--  Run this in MySQL if your products table already exists:
--  mysql -u root -p fasty_shop < config/migrate_images.sql
-- ============================================================

USE fasty_shop;

-- Step 1: Add image_url column (stores cover image filename or URL)
ALTER TABLE products
  ADD COLUMN image_url VARCHAR(500) DEFAULT NULL AFTER emoji;

-- Step 2: Add images column (stores extra image filenames as JSON array)
ALTER TABLE products
  ADD COLUMN images JSON DEFAULT NULL AFTER image_url;

-- Verify the columns were added successfully
DESCRIBE products;
