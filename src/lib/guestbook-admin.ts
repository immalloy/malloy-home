import { env } from "cloudflare:workers";

const ADMIN_USERNAME = "admin";
const authHeaders = {
  "Cache-Control": "no-store",
  "WWW-Authenticate": 'Basic realm="Guestbook moderation", charset="UTF-8"',
};

export const requireGuestbookAdmin = (request: Request) => {
  const password = env.GUESTBOOK_ADMIN_PASSWORD;
  if (!password) {
    return new Response("Guestbook moderation is not configured.", { status: 503, headers: authHeaders });
  }

  const authorization = request.headers.get("Authorization");
  if (!authorization?.startsWith("Basic ")) {
    return new Response("Guestbook moderation requires authentication.", { status: 401, headers: authHeaders });
  }

  try {
    if (atob(authorization.slice(6)) === `${ADMIN_USERNAME}:${password}`) return null;
  } catch {
    // Treat malformed credentials as unauthorized.
  }

  return new Response("Guestbook moderation requires authentication.", { status: 401, headers: authHeaders });
};
