import { env } from "cloudflare:workers";
import { requireAuth, unauthorized } from "../../../lib/auth";

type MemberInput = { whatsapp?: string; owner_name?: string; gender?: string; birth_day?: number; birth_month?: number };

export async function GET(request: Request) {
  if (!await requireAuth(request)) return unauthorized();
  const url = new URL(request.url);
  const search = (url.searchParams.get("search") ?? "").trim();
  const result = search
    ? await env.DB.prepare("SELECT id, whatsapp, owner_name, gender, birth_day, birth_month, profile_completed, status, registered_at FROM members WHERE whatsapp LIKE ? OR owner_name LIKE ? ORDER BY created_at DESC LIMIT 50").bind(`%${search}%`, `%${search}%`).all()
    : await env.DB.prepare("SELECT id, whatsapp, owner_name, gender, birth_day, birth_month, profile_completed, status, registered_at FROM members ORDER BY created_at DESC LIMIT 50").all();
  return Response.json({ data: result.results });
}

export async function POST(request: Request) {
  if (!await requireAuth(request)) return unauthorized();
  let body: MemberInput;
  try { body = await request.json() as MemberInput; } catch { return Response.json({ error: "Body JSON tidak valid" }, { status: 400 }); }
  const whatsapp = body.whatsapp?.replace(/[^\d+]/g, "").trim();
  if (!whatsapp || whatsapp.length < 8) return Response.json({ error: "Nomor WhatsApp wajib valid" }, { status: 422 });
  const id = crypto.randomUUID();
  try {
    await env.DB.prepare("INSERT INTO members (id, whatsapp, owner_name, gender, birth_day, birth_month, profile_completed) VALUES (?, ?, ?, ?, ?, ?, ?)").bind(id, whatsapp, body.owner_name?.trim() || null, body.gender || null, body.birth_day ?? null, body.birth_month ?? null, body.owner_name && body.gender && body.birth_day && body.birth_month ? 1 : 0).run();
    await env.DB.prepare("INSERT INTO wallet_accounts (id, member_id) VALUES (?, ?)").bind(crypto.randomUUID(), id).run();
    return Response.json({ data: { id, whatsapp }, message: "Member berhasil dibuat" }, { status: 201 });
  } catch (error) {
    const message = error instanceof Error && error.message.includes("UNIQUE") ? "Nomor WhatsApp sudah terdaftar" : "Member gagal dibuat";
    return Response.json({ error: message }, { status: message.includes("sudah") ? 409 : 500 });
  }
}
