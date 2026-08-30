import type { APIRoute } from "astro";
import { env } from "cloudflare:workers";
import { guestbookDrawingKey } from "../../lib/guestbook-drawing";

const MAX_NAME_LENGTH = 48;
const MAX_MESSAGE_LENGTH = 1200;
const MAX_COUNTRY_LENGTH = 56;
const MAX_DRAWING_BYTES = 300_000;
const MAX_TURNSTILE_TOKEN_LENGTH = 2048;

const json = (body: unknown, status = 200) =>
  new Response(JSON.stringify(body), {
    status,
    headers: {
      "Cache-Control": "no-store",
      "Content-Type": "application/json",
    },
  });

const hashValue = async (value: string) => {
  const bytes = new TextEncoder().encode(value);
  const digest = await crypto.subtle.digest("SHA-256", bytes);
  return [...new Uint8Array(digest)].map((byte) => byte.toString(16).padStart(2, "0")).join("");
};

const verifyTurnstile = async (token: string, request: Request, secret: string) => {
  const verification = await fetch("https://challenges.cloudflare.com/turnstile/v0/siteverify", {
    method: "POST",
    headers: { "Content-Type": "application/x-www-form-urlencoded" },
    signal: AbortSignal.timeout(10_000),
    body: new URLSearchParams({
      secret,
      response: token,
      remoteip: request.headers.get("CF-Connecting-IP") ?? "",
    }),
  });

  if (!verification.ok) return false;

  const result = await verification.json();
  return Boolean(result.success && (!result.action || result.action === "guestbook-submit"));
};

export const GET: APIRoute = async () => {
  const database = env.GUESTBOOK_DB;

  if (!database) return json({ error: "Guestbook storage is not configured." }, 503);

  try {
    const { results } = await database
      .prepare(
        `SELECT id, name, message, country, drawing <> '' AS hasDrawing, created_at AS createdAt
         FROM guestbook_entries
         WHERE status = 'approved'
         ORDER BY created_at DESC
         LIMIT 60`,
      )
      .all();

    return json({ entries: results });
  } catch (error) {
    console.error("Could not load guestbook entries.", error);
    return json({ error: "Guestbook entries are temporarily unavailable." }, 503);
  }
};

export const POST: APIRoute = async ({ request }) => {
  const origin = request.headers.get("Origin");
  if (origin && origin !== new URL(request.url).origin) return json({ error: "Invalid request origin." }, 403);

  const database = env.GUESTBOOK_DB;
  const turnstileSecret = env.TURNSTILE_SECRET_KEY;

  if (!database || !turnstileSecret) return json({ error: "Guestbook submission is not configured." }, 503);

  let formData: FormData;
  try {
    formData = await request.formData();
  } catch {
    return json({ error: "The submission was not valid form data." }, 400);
  }

  const field = (name: string) => {
    const value = formData.get(name);
    return typeof value === "string" ? value : "";
  };
  const drawing = formData.get("drawing");
  const drawingBytes = drawing instanceof File && drawing.size > 0 && drawing.size <= MAX_DRAWING_BYTES
    ? new Uint8Array(await drawing.arrayBuffer())
    : null;

  if (field("website").trim()) {
    return json({ error: "Spam check failed." }, 400);
  }

  const name = field("name").trim().slice(0, MAX_NAME_LENGTH);
  const message = field("message").trim().slice(0, MAX_MESSAGE_LENGTH);
  const selectedCountry = field("country").trim().slice(0, MAX_COUNTRY_LENGTH);
  const detectedCountry = request.headers.get("CF-IPCountry")?.toUpperCase() ?? "";
  const country = selectedCountry === "__private__"
    ? ""
    : selectedCountry === "__auto__" || !selectedCountry
      ? /^[A-Z]{2}$/.test(detectedCountry) && !["XX", "T1"].includes(detectedCountry) ? detectedCountry : ""
      : selectedCountry;
  const turnstileToken = field("turnstileToken");

  if (!message && !drawingBytes) return json({ error: "Add a message, a drawing, or both." }, 400);
  if (message.length > MAX_MESSAGE_LENGTH || country.length > MAX_COUNTRY_LENGTH) {
    return json({ error: "One of the fields is too long." }, 400);
  }
  if (drawing && !drawingBytes) {
    return json({ error: "The drawing is too large or invalid." }, 400);
  }
  if (!turnstileToken || turnstileToken.length > MAX_TURNSTILE_TOKEN_LENGTH) {
    return json({ error: "Complete the bot check and try again." }, 400);
  }

  const id = crypto.randomUUID();
  let drawingKey = "";
  let drawingUploaded = false;

  try {
    if (!(await verifyTurnstile(turnstileToken, request, turnstileSecret))) {
      return json({ error: "The bot check could not verify this submission." }, 403);
    }

    const ip = request.headers.get("CF-Connecting-IP");
    const ipHash = ip ? await hashValue(`${turnstileSecret}:${ip}`) : "";
    if (ipHash) {
      const recent = await database
        .prepare(
          `SELECT id FROM guestbook_entries
           WHERE ip_hash = ? AND created_at > datetime('now', '-10 minutes')
           LIMIT 1`,
        )
        .bind(ipHash)
        .first();

      if (recent) return json({ error: "Please wait a few minutes before sending another entry." }, 429);
    }

    drawingKey = drawingBytes ? guestbookDrawingKey(id) : "";

    if (drawingBytes) {
      const bucket = env.GUESTBOOK_DRAWINGS;
      if (!bucket) return json({ error: "Guestbook drawing storage is not configured." }, 503);

      await bucket.put(drawingKey, drawingBytes, {
        httpMetadata: { cacheControl: "no-store", contentType: "image/png" },
      });
      drawingUploaded = true;
    }

    await database
      .prepare(
        `INSERT INTO guestbook_entries (id, name, message, country, drawing, status, ip_hash)
         VALUES (?, ?, ?, ?, ?, 'pending', ?)`,
      )
      .bind(id, name || "Anonymous", message, country, drawingKey, ipHash)
      .run();

    return json({ ok: true }, 202);
  } catch (error) {
    if (drawingUploaded && env.GUESTBOOK_DRAWINGS) {
      try {
        await env.GUESTBOOK_DRAWINGS.delete(drawingKey);
      } catch (cleanupError) {
        console.error("Could not clean up guestbook drawing.", cleanupError);
      }
    }
    console.error("Could not save guestbook entry.", error);
    return json({ error: "The guestbook could not save your entry." }, 503);
  }
};
