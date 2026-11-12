import { createHash, timingSafeEqual } from "node:crypto";

function matchesSecret(provided, expected) {
  const providedHash = createHash("sha256").update(provided).digest();
  const expectedHash = createHash("sha256").update(expected).digest();
  return timingSafeEqual(providedHash, expectedHash);
}

export default async (req) => {
  if (req.method !== "POST") {
    return new Response(JSON.stringify({ error: "Method not allowed" }), {
      status: 405,
      headers: { "Content-Type": "application/json", "Allow": "POST", "Cache-Control": "no-store" },
    });
  }

  const configuredPassword = process.env.Password_admin;
  if (!configuredPassword) {
    console.error("Password_admin is not configured in the Netlify environment.");
    return new Response(JSON.stringify({ error: "Admin authentication is not configured" }), {
      status: 503,
      headers: { "Content-Type": "application/json", "Cache-Control": "no-store" },
    });
  }

  try {
    const rawBody = await req.text();
    if (rawBody.length > 2048) {
      return new Response(JSON.stringify({ error: "Request too large" }), {
        status: 413,
        headers: { "Content-Type": "application/json", "Cache-Control": "no-store" },
      });
    }

    const body = JSON.parse(rawBody);
    const password = typeof body?.password === "string" ? body.password : "";
    if (!password || password.length > 256 || !matchesSecret(password, configuredPassword)) {
      return new Response(JSON.stringify({ error: "Invalid admin password" }), {
        status: 401,
        headers: { "Content-Type": "application/json", "Cache-Control": "no-store" },
      });
    }

    return new Response(JSON.stringify({ ok: true }), {
      status: 200,
      headers: { "Content-Type": "application/json", "Cache-Control": "no-store" },
    });
  } catch (error) {
    console.error("admin-auth error:", error);
    return new Response(JSON.stringify({ error: "Invalid authentication request" }), {
      status: 400,
      headers: { "Content-Type": "application/json", "Cache-Control": "no-store" },
    });
  }
};

export const config = { path: "/api/admin-auth" };
