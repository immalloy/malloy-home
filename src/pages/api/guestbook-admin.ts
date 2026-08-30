import type { APIRoute } from "astro";
import { env } from "cloudflare:workers";
import { requireGuestbookAdmin } from "../../lib/guestbook-admin";

const json = (body: unknown, status = 200) =>
  new Response(JSON.stringify(body), {
    status,
    headers: { "Cache-Control": "no-store", "Content-Type": "application/json" },
  });

const getDatabase = () => env.GUESTBOOK_DB;

export const GET: APIRoute = async ({ request }) => {
  const authError = requireGuestbookAdmin(request);
  if (authError) return authError;

  const database = getDatabase();
  if (!database) return json({ error: "Guestbook storage is not configured." }, 503);

  try {
    const { results } = await database
      .prepare(
        `SELECT id, name, message, country, drawing, status, created_at AS createdAt
         FROM guestbook_entries
         ORDER BY created_at DESC
         LIMIT 100`,
      )
      .all();

    return json({ entries: results });
  } catch (error) {
    console.error("Could not load moderation entries.", error);
    return json({ error: "Guestbook entries are temporarily unavailable." }, 503);
  }
};

export const POST: APIRoute = async ({ request }) => {
  const authError = requireGuestbookAdmin(request);
  if (authError) return authError;

  if (request.headers.get("Origin") !== new URL(request.url).origin) {
    return json({ error: "Invalid request origin." }, 403);
  }

  const database = getDatabase();
  if (!database) return json({ error: "Guestbook storage is not configured." }, 503);

  let body: Record<string, unknown>;
  try {
    body = await request.json();
  } catch {
    return json({ error: "The moderation request was not valid JSON." }, 400);
  }

  const id = typeof body.id === "string" ? body.id.trim() : "";
  const action = typeof body.action === "string" ? body.action : "";
  if (!id || id.length > 100) return json({ error: "A valid entry ID is required." }, 400);

  try {
    const result = action === "delete"
      ? await database.prepare("DELETE FROM guestbook_entries WHERE id = ?").bind(id).run()
      : ["approved", "rejected", "pending"].includes(action)
        ? await database.prepare("UPDATE guestbook_entries SET status = ? WHERE id = ?").bind(action, id).run()
        : null;

    if (!result) return json({ error: "Unknown moderation action." }, 400);
    if (!result.meta.changes) return json({ error: "Entry not found." }, 404);
    return json({ ok: true });
  } catch (error) {
    console.error("Could not update moderation entry.", error);
    return json({ error: "The guestbook entry could not be updated." }, 503);
  }
};
