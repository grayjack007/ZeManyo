import { getStore } from "@netlify/blobs";

export default async (req, context) => {
  // Only allow POST
  if (req.method !== "POST") {
    return new Response(JSON.stringify({ error: "Method not allowed" }), {
      status: 405,
      headers: { "Content-Type": "application/json" },
    });
  }

  try {
    const body = await req.json();

    // Basic validation
    if (!Array.isArray(body)) {
      return new Response(
        JSON.stringify({ error: "Expected an array of images" }),
        { status: 400, headers: { "Content-Type": "application/json" } }
      );
    }

    // Sanity limit to prevent abuse
    if (body.length > 200) {
      return new Response(
        JSON.stringify({ error: "Gallery too large (max 200 images)" }),
        { status: 400, headers: { "Content-Type": "application/json" } }
      );
    }

    const store = getStore({ name: "gallery", consistency: "strong" });
    await store.setJSON("images", body);

    return new Response(
      JSON.stringify({ ok: true, count: body.length }),
      {
        status: 200,
        headers: { "Content-Type": "application/json" },
      }
    );
  } catch (err) {
    console.error("save-gallery error:", err);
    return new Response(JSON.stringify({ error: "Failed to save gallery" }), {
      status: 500,
      headers: { "Content-Type": "application/json" },
    });
  }
};

export const config = { path: "/api/save-gallery" };