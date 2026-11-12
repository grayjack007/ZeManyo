import { getStore } from "@netlify/blobs";

export default async (req) => {
  if (req.method !== "GET") {
    return new Response(JSON.stringify({ error: "Method not allowed" }), {
      status: 405,
      headers: { "Content-Type": "application/json", "Allow": "GET", "Cache-Control": "no-store" },
    });
  }

  try {
    const store = getStore({ name: "gallery", consistency: "strong" });
    const data = await store.get("modelling-images", { type: "json" });
    return new Response(JSON.stringify(Array.isArray(data) ? data : []), {
      status: 200,
      headers: { "Content-Type": "application/json", "Cache-Control": "no-store", "X-Content-Type-Options": "nosniff" },
    });
  } catch (error) {
    console.error("get-modelling error:", error);
    return new Response(JSON.stringify({ error: "Failed to load modelling portfolio" }), {
      status: 500,
      headers: { "Content-Type": "application/json", "Cache-Control": "no-store" },
    });
  }
};

export const config = { path: "/api/get-modelling" };
