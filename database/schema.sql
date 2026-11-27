-- ============================================================
-- Database Schema (SQLite) — Nu Fried Chicken & Burger
-- Dijalankan otomatis oleh db.js saat server menyala
-- ============================================================

CREATE TABLE IF NOT EXISTS admin_users (
  username TEXT PRIMARY KEY,
  salt TEXT NOT NULL,
  password_hash TEXT NOT NULL,
  token_secret TEXT NOT NULL,
  updated_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS site_config (
  config_key TEXT PRIMARY KEY,
  config_value TEXT NOT NULL,
  updated_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS partnership_packages (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  price INTEGER NOT NULL,
  price_label TEXT NOT NULL,
  price_unit TEXT NOT NULL DEFAULT 'JUTA',
  badge TEXT NOT NULL DEFAULT '',
  popular INTEGER NOT NULL DEFAULT 0,
  tagline TEXT NOT NULL DEFAULT '',
  image_url TEXT NOT NULL DEFAULT '',
  unit_name TEXT NOT NULL DEFAULT '',
  material TEXT NOT NULL DEFAULT '',
  dimensions TEXT NOT NULL DEFAULT '',
  has_branding_promo INTEGER NOT NULL DEFAULT 0,
  facilities_json TEXT NOT NULL,
  bep_json TEXT NOT NULL,
  sort_order INTEGER NOT NULL DEFAULT 0,
  updated_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS menu_items (
  id TEXT PRIMARY KEY,
  category TEXT NOT NULL,
  name TEXT NOT NULL,
  badge TEXT NOT NULL DEFAULT '',
  badge_color TEXT NOT NULL DEFAULT 'red',
  price_start TEXT NOT NULL DEFAULT '',
  image_url TEXT NOT NULL DEFAULT '',
  description TEXT NOT NULL DEFAULT '',
  variants_json TEXT NOT NULL,
  sort_order INTEGER NOT NULL DEFAULT 0,
  updated_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS leads (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  phone TEXT NOT NULL,
  city TEXT NOT NULL,
  package_name TEXT NOT NULL,
  notes TEXT NOT NULL DEFAULT '',
  status TEXT NOT NULL DEFAULT 'Baru',
  created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_leads_created_at ON leads (created_at DESC);
