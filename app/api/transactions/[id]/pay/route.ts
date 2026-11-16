import { env } from "cloudflare:workers";
import { requireAuth, unauthorized } from "../../../../../lib/auth";

type PaymentInput = { payment_method?: "cash" | "wallet"; amount?: number; created_by?: string };

export async function POST(request: Request, context: { params: Promise<{ id: string }> }) {
  if (!await requireAuth(request)) return unauthorized();
  const { id } = await context.params;
  let body: PaymentInput;
  try { body = await request.json(); } catch { return Response.json({ error: "Body JSON tidak valid" }, { status: 400 }); }
  const amount = Math.floor(body.amount ?? 0);
  if (!body.payment_method || amount <= 0) return Response.json({ error: "Metode dan nominal pembayaran wajib diisi" }, { status: 422 });
  const transaction = await env.DB.prepare("SELECT id, transaction_number, member_id, total_amount, payment_status, transaction_status FROM sales_transactions WHERE id = ?").bind(id).first<{ id: string; transaction_number: string; member_id: string | null; total_amount: number; payment_status: string; transaction_status: string }>();
  if (!transaction) return Response.json({ error: "Transaksi tidak ditemukan" }, { status: 404 });
  if (transaction.transaction_status !== "completed") return Response.json({ error: "Transaksi belum siap dibayar" }, { status: 409 });
  if (amount > transaction.total_amount) return Response.json({ error: "Pembayaran melebihi total transaksi" }, { status: 422 });
  const paymentId = crypto.randomUUID();
  const reference = `PAY-${transaction.transaction_number}-${paymentId.slice(0, 6).toUpperCase()}`;
  const statements = [];
  let walletLedgerId: string | null = null;
  if (body.payment_method === "wallet") {
    if (!transaction.member_id) return Response.json({ error: "Pembayaran wallet membutuhkan member" }, { status: 422 });
    const wallet = await env.DB.prepare("SELECT id, current_balance FROM wallet_accounts WHERE member_id = ? AND status = 'active'").bind(transaction.member_id).first<{ id: string; current_balance: number }>();
    if (!wallet || wallet.current_balance < amount) return Response.json({ error: "Saldo wallet tidak mencukupi" }, { status: 409 });
    walletLedgerId = crypto.randomUUID();
    statements.push(env.DB.prepare("INSERT INTO wallet_ledger (id, wallet_account_id, member_id, type, source_type, source_id, amount, balance_before, balance_after, reference_number, description, created_by) VALUES (?, ?, ?, 'debit', 'payment', ?, ?, ?, ?, ?, ?, ?)").bind(walletLedgerId, wallet.id, transaction.member_id, id, amount, wallet.current_balance, wallet.current_balance - amount, `WAL-${reference}`, `Pembayaran ${transaction.transaction_number}`, body.created_by ?? null));
    statements.push(env.DB.prepare("UPDATE wallet_accounts SET current_balance = current_balance - ?, updated_at = CURRENT_TIMESTAMP WHERE id = ? AND current_balance >= ?").bind(amount, wallet.id, amount));
  }
  statements.push(env.DB.prepare("INSERT INTO payments (id, transaction_id, payment_method, amount, wallet_ledger_id, status, reference, created_by) VALUES (?, ?, ?, ?, ?, 'completed', ?, ?)").bind(paymentId, id, body.payment_method, amount, walletLedgerId, reference, body.created_by ?? null));
  const newStatus = amount === transaction.total_amount ? "paid" : "partial";
  statements.push(env.DB.prepare("UPDATE sales_transactions SET payment_status = ?, updated_at = CURRENT_TIMESTAMP WHERE id = ?").bind(newStatus, id));
  const items = await env.DB.prepare("SELECT product_id, qty FROM transaction_items WHERE transaction_id = ? AND item_type = 'product'").bind(id).all<{ product_id: string; qty: number }>();
  for (const item of items.results) {
    const product = await env.DB.prepare("SELECT stock_qty FROM products WHERE id = ?").bind(item.product_id).first<{ stock_qty: number }>();
    if (!product || product.stock_qty < item.qty) return Response.json({ error: "Stok berubah dan tidak mencukupi" }, { status: 409 });
    statements.push(env.DB.prepare("UPDATE products SET stock_qty = stock_qty - ?, updated_at = CURRENT_TIMESTAMP WHERE id = ? AND stock_qty >= ?").bind(item.qty, item.product_id, item.qty));
    statements.push(env.DB.prepare("INSERT INTO stock_movements (id, product_id, type, qty_out, stock_before, stock_after, source_type, source_id, reference_number, created_by) VALUES (?, ?, 'sale', ?, ?, ?, 'transaction', ?, ?, ?)").bind(crypto.randomUUID(), item.product_id, item.qty, product.stock_qty, product.stock_qty - item.qty, id, `STK-${reference}-${item.product_id.slice(0, 6)}`, body.created_by ?? null));
  }
  await env.DB.batch(statements);
  return Response.json({ data: { transaction_id: id, payment_id: paymentId, payment_status: newStatus, amount, method: body.payment_method } });
}
