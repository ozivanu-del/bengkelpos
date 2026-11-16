import { env } from "cloudflare:workers";
import { requireAuth, unauthorized } from "../../../lib/auth";

export async function GET(request: Request) {
  if (!await requireAuth(request)) return unauthorized();
  const result = await env.DB.prepare("SELECT id, sku, name, unit, selling_price, stock_qty, minimum_stock, status FROM products WHERE status = 'active' ORDER BY name LIMIT 100").all();
  return Response.json({ data: result.results });
}

export async function POST(request: Request) {
  if (!await requireAuth(request)) return unauthorized();
  const body = await request.json() as { sku?: string; name?: string; unit?: string; selling_price?: number; purchase_price?: number; stock_qty?: number; minimum_stock?: number };
  if (!body.sku || !body.name || !body.unit) return Response.json({ error: "SKU, nama, dan satuan wajib diisi" }, { status: 422 });
  try { const id = crypto.randomUUID(); await env.DB.prepare("INSERT INTO products (id, sku, name, unit, purchase_price, selling_price, stock_qty, minimum_stock) VALUES (?, ?, ?, ?, ?, ?, ?, ?)").bind(id, body.sku.trim(), body.name.trim(), body.unit.trim(), body.purchase_price ?? 0, body.selling_price ?? 0, body.stock_qty ?? 0, body.minimum_stock ?? 0).run(); return Response.json({ data: { id }, message: "Barang berhasil dibuat" }, { status: 201 }); } catch { return Response.json({ error: "SKU sudah digunakan atau data tidak valid" }, { status: 409 }); }
}
