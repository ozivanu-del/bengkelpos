import { env } from "cloudflare:workers";

const COOKIE = "syuhada_session";
const secret = () => String((env as unknown as Record<string, unknown>).AUTH_SECRET ?? "");
const config = () => env as unknown as Record<string, unknown>;
const encode = (value: string) => btoa(value).replaceAll("+", "-").replaceAll("/", "_").replaceAll("=", "");
async function sign(value: string) { const key = await crypto.subtle.importKey("raw", new TextEncoder().encode(secret()), { name: "HMAC", hash: "SHA-256" }, false, ["sign"]); return encode(String.fromCharCode(...new Uint8Array(await crypto.subtle.sign("HMAC", key, new TextEncoder().encode(value))))); }
export async function createSession(email: string) { const payload = `${email}|${Date.now() + 8 * 60 * 60 * 1000}`; return `${encode(payload)}.${await sign(payload)}`; }
export async function requireAuth(request: Request) { const cookie = request.headers.get("cookie") ?? ""; const token = cookie.split(";").map(x => x.trim()).find(x => x.startsWith(`${COOKIE}=`))?.split("=")[1]; if (!token || !secret()) return false; const [encoded, signature] = token.split("."); if (!encoded || !signature) return false; const payload = atob(encoded.replaceAll("-", "+").replaceAll("_", "/")); const [email, expiry] = payload.split("|"); return Boolean(email && Number(expiry) > Date.now() && signature === await sign(payload)); }
export const unauthorized = () => Response.json({ error: "Autentikasi diperlukan" }, { status: 401 });
export const sessionCookie = (token: string) => `${COOKIE}=${token}; HttpOnly; Secure; SameSite=Lax; Path=/; Max-Age=28800`;
export const adminCredentials = () => ({ email: String(config().ADMIN_EMAIL ?? ""), password: String(config().ADMIN_PASSWORD ?? "") });
