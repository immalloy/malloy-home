import type { APIRoute } from "astro";
import { env } from "cloudflare:workers";
import { requireGuestbookAdmin } from "../../lib/guestbook-admin";

const responseHeaders = {
  "Cache-Control": "no-store",
  "Content-Type": "image/png",
  "X-Content-Type-Options": "nosniff",
};

const notFound = () => new Response("Drawing not found.", { status: 404, headers: { "Cache-Control": "no-store" } });

export const GET: APIRoute = async ({ request, url }) => {
  const id = url.searchParams.get("id")?.trim() ?? "";
  const admin = url.searchParams.get("admin") === "1";
  if (!id || id.length > 100) return notFound();

  if (admin) {
    const authError = requireGuestbookAdmin(request);
    if (authError) return authError;
  }

  const database = env.GUESTBOOK_DB;
  if (!database) return new Response("Guestbook storage is not configured.", { status: 503 });

  try {
    const entry = await database
      .prepare(
        admin
          ? "SELECT drawing FROM guestbook_entries WHERE id = ?"
          : "SELECT drawing FROM guestbook_entries WHERE id = ? AND status = 'approved'",
      )
      .bind(id)
      .first<{ drawing: string }>();

    if (!entry?.drawing) return notFound();

    const bucket = env.GUESTBOOK_DRAWINGS;
    if (!bucket) return new Response("Guestbook drawing storage is not configured.", { status: 503 });

    const object = await bucket.get(entry.drawing);
    if (!object) return notFound();

    const headers = new Headers(responseHeaders);
    object.writeHttpMetadata(headers);
    headers.set("Content-Type", "image/png");
    headers.set("Cache-Control", "no-store");
    return new Response(object.body, { headers });
  } catch (error) {
    console.error("Could not load guestbook drawing.", error);
    return new Response("The drawing is temporarily unavailable.", { status: 503 });
  }
};
