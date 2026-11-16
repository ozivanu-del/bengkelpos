CREATE TABLE IF NOT EXISTS stock_movements (
  id TEXT PRIMARY KEY,
  product_id TEXT NOT NULL REFERENCES products(id),
  type TEXT NOT NULL,
  qty_in INTEGER NOT NULL DEFAULT 0,
  qty_out INTEGER NOT NULL DEFAULT 0,
  stock_before INTEGER NOT NULL,
  stock_after INTEGER NOT NULL,
  source_type TEXT NOT NULL,
  source_id TEXT NOT NULL,
  reference_number TEXT NOT NULL UNIQUE,
  created_by TEXT,
  created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP
);
CREATE INDEX IF NOT EXISTS idx_stock_movements_product ON stock_movements(product_id, created_at);
