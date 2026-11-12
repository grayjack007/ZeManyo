import { timingSafeEqual, createHash } from "node:crypto";
import { getStore } from "@netlify/blobs";

function matchesSecret(provided, expected) {
  const providedHash = createHash("sha256").update(provided).digest();
  const expectedHash = createHash("sha256").update(expected).digest();
  return timingSafeEqual(providedHash, expectedHash);
}

function jsonResponse(payload, status = 200) {
  return new Response(JSON.stringify(payload), {
    status,
    headers: { "Content-Type": "application/json", "Cache-Control": "no-store", "X-Content-Type-Options": "nosniff" },
  });
}

function validItem(item) {
  if (!item || typeof item !== "object" || Array.isArray(item)) return false;
  if (typeof item.src !== "string" || item.src.length > 2048) return false;
  if (typeof item.caption !== "string" || item.caption.length > 180) return false;
  if (typeof item.brand !== "string" || item.brand.length > 100) return false;
  if (!["product", "brand", "lifestyle", "editorial"].includes(item.category)) return false;
  if (typeof item.tall !== "boolean") return false;
  try {
    const url = new URL(item.src);
    return url.protocol === "https:" && url.hostname === "res.cloudinary.com";
  } catch { return false; }
}

export default async (req) => {
  if (req.method !== "POST") return jsonResponse({ error: "Method not allowed" }, 405);

  const configuredPassword = process.env.Password_admin;
  if (!configuredPassword) {
    console.error("Password_admin is not configured in Netlify environment.");
    return jsonResponse({ error: "Admin authentication is not configured" }, 503);
  }
  const authorization = req.headers.get("authorization") || "";
  const providedPassword = authorization.startsWith("Bearer ") ? authorization.slice(7) : "";
  if (!providedPassword || providedPassword.length > 256 || !matchesSecret(providedPassword, configuredPassword)) {
    return jsonResponse({ error: "Unauthorized" }, 401);
  }

  try {
    const contentLength = Number(req.headers.get("content-length") || 0);
    if (contentLength > 1024 * 1024) return jsonResponse({ error: "Portfolio payload is too large" }, 413);
    const rawBody = await req.text();
    if (rawBody.length > 1024 * 1024) return jsonResponse({ error: "Portfolio payload is too large" }, 413);
    const body = JSON.parse(rawBody);
    if (!Array.isArray(body)) return jsonResponse({ error: "Expected an array of modelling images" }, 400);
    if (body.length > 200) return jsonResponse({ error: "Modelling portfolio too large (max 200 images)" }, 400);
    if (!body.every(validItem)) return jsonResponse({ error: "One or more modelling items are invalid" }, 400);

    const store = getStore({ name: "gallery", consistency: "strong" });
    await store.setJSON("modelling-images", body);
    return jsonResponse({ ok: true, count: body.length });
  } catch (error) {
    console.error("save-modelling error:", error);
    return jsonResponse({ error: "Failed to save modelling portfolio" }, 500);
  }
};

export const config = { path: "/api/save-modelling" };
