import { env } from "cloudflare:workers";
import { requireAuth, unauthorized } from "../../../lib/auth";

type ItemInput = { item_type: "product" | "service"; product_id?: string; service_id?: string; qty?: number };

export async function POST(request: Request) {
  if (!await requireAuth(request)) return unauthorized();
  let body: { member_id?: string; vehicle_id?: string; cashier_user_id?: string; items?: ItemInput[]; promo_id?: string; notes?: string };
  try { body = await request.json(); } catch { return Response.json({ error: "Body JSON tidak valid" }, { status: 400 }); }
  if (!body.items?.length || !body.cashier_user_id) return Response.json({ error: "Item dan kasir wajib diisi" }, { status: 422 });

  const verifiedItems: Array<ItemInput & { name: string; unitPrice: number; subtotal: number }> = [];
  for (const item of body.items) {
    const qty = Math.max(1, Math.floor(item.qty ?? 1));
    if (item.item_type === "product" && item.product_id) {
      const row = await env.DB.prepare("SELECT name, selling_price AS unitPrice, stock_qty FROM products WHERE id = ? AND status = 'active'").bind(item.product_id).first<{ name: string; unitPrice: number; stock_qty: number }>();
      if (!row) return Response.json({ error: "Barang tidak ditemukan" }, { status: 404 });
      if (row.stock_qty < qty) return Response.json({ error: `Stok ${row.name} tidak mencukupi` }, { status: 409 });
      verifiedItems.push({ ...item, qty, name: row.name, unitPrice: row.unitPrice, subtotal: row.unitPrice * qty });
    } else if (item.item_type === "service" && item.service_id) {
      const row = await env.DB.prepare("SELECT name, price AS unitPrice FROM services WHERE id = ? AND status = 'active'").bind(item.service_id).first<{ name: string; unitPrice: number }>();
      if (!row) return Response.json({ error: "Jasa tidak ditemukan" }, { status: 404 });
      verifiedItems.push({ ...item, qty, name: row.name, unitPrice: row.unitPrice, subtotal: row.unitPrice * qty });
    } else return Response.json({ error: "Item transaksi tidak valid" }, { status: 422 });
  }
  const subtotal = verifiedItems.reduce((sum, item) => sum + item.subtotal, 0);
  let discount = 0;
  if (body.promo_id) {
    const promo = await env.DB.prepare("SELECT type, value, max_discount, scope, member_only FROM promotions WHERE id = ? AND status = 'active' AND start_at <= CURRENT_TIMESTAMP AND end_at >= CURRENT_TIMESTAMP").bind(body.promo_id).first<{ type: string; value: number; max_discount: number | null; scope: string; member_only: number }>();
    const hasProduct = verifiedItems.some(item => item.item_type === 'product'); const hasService = verifiedItems.some(item => item.item_type === 'service');
    const scopeMatches = promo && (promo.scope === 'both' || (promo.scope === 'product' && hasProduct && !hasService) || (promo.scope === 'service' && hasService && !hasProduct));
    if (scopeMatches && (!promo.member_only || body.member_id)) discount = promo.type === "percentage" ? Math.min(Math.floor(subtotal * promo.value / 100), promo.max_discount ?? Number.MAX_SAFE_INTEGER) : Math.min(promo.value, subtotal);
  }
  const id = crypto.randomUUID();
  const number = `TRX-${new Date().toISOString().slice(0, 10).replaceAll("-", "")}-${id.slice(0, 6).toUpperCase()}`;
  const statements = [env.DB.prepare("INSERT INTO sales_transactions (id, transaction_number, member_id, vehicle_id, cashier_user_id, subtotal, discount_amount, total_amount, promo_id, payment_status, transaction_status, notes) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, 'unpaid', 'completed', ?)").bind(id, number, body.member_id ?? null, body.vehicle_id ?? null, body.cashier_user_id, subtotal, discount, subtotal - discount, body.promo_id ?? null, body.notes ?? null)];
  for (const item of verifiedItems) statements.push(env.DB.prepare("INSERT INTO transaction_items (id, transaction_id, item_type, product_id, service_id, item_name_snapshot, qty, unit_price, final_unit_price, subtotal) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)").bind(crypto.randomUUID(), id, item.item_type, item.product_id ?? null, item.service_id ?? null, item.name, item.qty, item.unitPrice, item.unitPrice, item.subtotal));
  await env.DB.batch(statements);
  return Response.json({ data: { id, transaction_number: number, subtotal, discount, total: subtotal - discount, items: verifiedItems } }, { status: 201 });
}

export async function GET(request: Request) {
  if (!await requireAuth(request)) return unauthorized();
  const result = await env.DB.prepare("SELECT transaction_number, member_id, transaction_at, subtotal, discount_amount, total_amount, payment_status, transaction_status FROM sales_transactions ORDER BY transaction_at DESC LIMIT 50").all();
  return Response.json({ data: result.results });
}
