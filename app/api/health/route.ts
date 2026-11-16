import { env } from "cloudflare:workers";

export async function GET() {
  try {
    const result = await env.DB.prepare("SELECT 1 AS ok").first<{ ok: number }>();
    return Response.json({ ok: result?.ok === 1, service: "bengkel-pos-syuhada", database: "connected" });
  } catch (error) {
    console.error("D1 health check failed", error);
    return Response.json({ ok: false, database: "unavailable" }, { status: 503 });
  }
}
