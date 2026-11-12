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
    headers: {
      "Content-Type": "application/json",
      "Cache-Control": "no-store",
      "X-Content-Type-Options": "nosniff",
    },
  });
}

function validPhoto(photo) {
  if (!photo || typeof photo !== "object" || Array.isArray(photo)) return false;
  if (typeof photo.src !== "string" || photo.src.length > 2048) return false;
  if (typeof photo.caption !== "string" || photo.caption.length > 180) return false;
  if (!["family", "couples", "editorial", "brand"].includes(photo.category)) return false;
  if (typeof photo.tall !== "boolean") return false;

  try {
    const url = new URL(photo.src);
    return url.protocol === "https:" && url.hostname === "res.cloudinary.com";
  } catch {
    return false;
  }
}

export default async (req) => {
  if (req.method !== "POST") {
    return jsonResponse({ error: "Method not allowed" }, 405);
  }

  const configuredPassword = process.env.Password_admin;
  if (!configuredPassword) {
    console.error("Password_admin is not configured in the Netlify environment.");
    return jsonResponse({ error: "Admin authentication is not configured" }, 503);
  }

  const authorization = req.headers.get("authorization") || "";
  const providedPassword = authorization.startsWith("Bearer ") ? authorization.slice(7) : "";
  if (!providedPassword || providedPassword.length > 256 || !matchesSecret(providedPassword, configuredPassword)) {
    return jsonResponse({ error: "Unauthorized" }, 401);
  }

  try {
    const contentLength = Number(req.headers.get("content-length") || 0);
    if (contentLength > 1024 * 1024) return jsonResponse({ error: "Gallery payload is too large" }, 413);

    const rawBody = await req.text();
    if (rawBody.length > 1024 * 1024) return jsonResponse({ error: "Gallery payload is too large" }, 413);

    const body = JSON.parse(rawBody);
    if (!Array.isArray(body)) return jsonResponse({ error: "Expected an array of images" }, 400);
    if (body.length > 200) return jsonResponse({ error: "Gallery too large (max 200 images)" }, 400);
    if (!body.every(validPhoto)) return jsonResponse({ error: "One or more gallery items are invalid" }, 400);

    const store = getStore({ name: "gallery", consistency: "strong" });
    await store.setJSON("images", body);
    return jsonResponse({ ok: true, count: body.length });
  } catch (error) {
    console.error("save-gallery error:", error);
    return jsonResponse({ error: "Failed to save gallery" }, 500);
  }
};

export const config = { path: "/api/save-gallery" };
