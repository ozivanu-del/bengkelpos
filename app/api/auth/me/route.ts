import { requireAuth, unauthorized } from "../../../../lib/auth";
export async function GET(request: Request) { if (!await requireAuth(request)) return unauthorized(); return Response.json({ authenticated: true }); }
