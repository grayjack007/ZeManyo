import { getStore } from "@netlify/blobs";

export default async (req, context) => {
  try {
    const store = getStore({ name: "gallery", consistency: "strong" });
    const data = await store.get("images", { type: "json" });
    return new Response(JSON.stringify(data || []), {
      status: 200,
      headers: {
        "Content-Type": "application/json",
        "Cache-Control": "public, max-age=60",
      },
    });
  } catch (err) {
    console.error("get-gallery error:", err);
    return new Response(JSON.stringify({ error: "Failed to load gallery" }), {
      status: 500,
      headers: { "Content-Type": "application/json" },
    });
  }
};

export const config = { path: "/api/get-gallery" };