import { env } from "cloudflare:workers";
import { requireAuth, unauthorized } from "../../../lib/auth";

export async function GET(request: Request) {
  if (!await requireAuth(request)) return unauthorized();
  const result = await env.DB.prepare("SELECT id, code, name, price, estimated_minutes, status FROM services WHERE status = 'active' ORDER BY name LIMIT 100").all();
  return Response.json({ data: result.results });
}

export async function POST(request: Request) {
  if (!await requireAuth(request)) return unauthorized();
  const body = await request.json() as { code?: string; name?: string; price?: number; estimated_minutes?: number };
  if (!body.code || !body.name) return Response.json({ error: "Kode dan nama jasa wajib diisi" }, { status: 422 });
  try { const id = crypto.randomUUID(); await env.DB.prepare("INSERT INTO services (id, code, name, price, estimated_minutes) VALUES (?, ?, ?, ?, ?)").bind(id, body.code.trim(), body.name.trim(), body.price ?? 0, body.estimated_minutes ?? 0).run(); return Response.json({ data: { id }, message: "Jasa berhasil dibuat" }, { status: 201 }); } catch { return Response.json({ error: "Kode jasa sudah digunakan atau data tidak valid" }, { status: 409 }); }
}
