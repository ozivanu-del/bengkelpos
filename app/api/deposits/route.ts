import { env } from "cloudflare:workers";
import { requireAuth, unauthorized } from "../../../lib/auth";

export async function GET(request: Request) {
  if (!await requireAuth(request)) return unauthorized();
  const result = await env.DB.prepare("SELECT deposit_number, member_id, amount, method, status, submitted_at, reviewed_at FROM deposits ORDER BY submitted_at DESC LIMIT 50").all();
  return Response.json({ data: result.results });
}

export async function POST(request: Request) {
  if (!await requireAuth(request)) return unauthorized();
  let body: { member_id?: string; amount?: number; method?: "transfer" | "direct_admin"; proof_file?: string };
  try { body = await request.json(); } catch { return Response.json({ error: "Body JSON tidak valid" }, { status: 400 }); }
  const amount = Math.floor(body.amount ?? 0);
  if (!body.member_id || amount <= 0 || !body.method) return Response.json({ error: "Member, nominal, dan metode wajib diisi" }, { status: 422 });
  const member = await env.DB.prepare("SELECT id FROM members WHERE id = ? AND status = 'active'").bind(body.member_id).first();
  if (!member) return Response.json({ error: "Member tidak ditemukan" }, { status: 404 });
  const id = crypto.randomUUID();
  const number = `DEP-${new Date().toISOString().slice(0, 10).replaceAll("-", "")}-${id.slice(0, 6).toUpperCase()}`;
  const status = body.method === "direct_admin" ? "approved" : "pending";
  if (body.method === "direct_admin") {
    const wallet = await env.DB.prepare("SELECT id, current_balance FROM wallet_accounts WHERE member_id = ? AND status = 'active'").bind(body.member_id).first<{ id: string; current_balance: number }>();
    if (!wallet) return Response.json({ error: "Wallet member tidak ditemukan" }, { status: 404 });
    const ledgerId = crypto.randomUUID();
    await env.DB.batch([
      env.DB.prepare("INSERT INTO deposits (id, deposit_number, member_id, amount, method, proof_file, status, reviewed_at, wallet_ledger_id) VALUES (?, ?, ?, ?, ?, ?, 'approved', CURRENT_TIMESTAMP, ?)").bind(id, number, body.member_id, amount, body.method, body.proof_file ?? null, ledgerId),
      env.DB.prepare("INSERT INTO wallet_ledger (id, wallet_account_id, member_id, type, source_type, source_id, amount, balance_before, balance_after, reference_number, description) VALUES (?, ?, ?, 'credit', 'deposit', ?, ?, ?, ?, ?, ?)").bind(ledgerId, wallet.id, body.member_id, id, amount, wallet.current_balance, wallet.current_balance + amount, `WAL-${number}`, "Top up langsung oleh admin"),
      env.DB.prepare("UPDATE wallet_accounts SET current_balance = current_balance + ?, updated_at = CURRENT_TIMESTAMP WHERE id = ?").bind(amount, wallet.id),
    ]);
  } else {
    await env.DB.prepare("INSERT INTO deposits (id, deposit_number, member_id, amount, method, proof_file, status) VALUES (?, ?, ?, ?, ?, ?, 'pending')").bind(id, number, body.member_id, amount, body.method, body.proof_file ?? null).run();
  }
  return Response.json({ data: { id, deposit_number: number, status: body.method === "direct_admin" ? "approved" : "pending" } }, { status: 201 });
}
