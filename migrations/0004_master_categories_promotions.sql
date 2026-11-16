CREATE TABLE IF NOT EXISTS promotion_items (id TEXT PRIMARY KEY, promotion_id TEXT NOT NULL REFERENCES promotions(id), product_id TEXT REFERENCES products(id), service_id TEXT REFERENCES services(id));
CREATE TABLE IF NOT EXISTS category_types (id TEXT PRIMARY KEY, name TEXT NOT NULL, type TEXT NOT NULL CHECK(type IN ('product','service')), description TEXT, status TEXT NOT NULL DEFAULT 'active', created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP, updated_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP);
CREATE INDEX IF NOT EXISTS idx_promotion_items_promotion ON promotion_items(promotion_id);
CREATE INDEX IF NOT EXISTS idx_category_types_type ON category_types(type, status);
