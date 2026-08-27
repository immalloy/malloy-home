export const SPOTIFY_SCOPES = "user-read-currently-playing user-read-recently-played";
export const SPOTIFY_STATE_COOKIE = "spotify_oauth_state";

type RuntimeEnv = {
  SPOTIFY_CLIENT_ID?: string;
  SPOTIFY_CLIENT_SECRET?: string;
  SPOTIFY_REDIRECT_URI?: string;
};

export function getSpotifyConfig(runtimeEnv: unknown) {
  const env = runtimeEnv as RuntimeEnv;

  return {
    clientId: env.SPOTIFY_CLIENT_ID?.trim() ?? "",
    clientSecret: env.SPOTIFY_CLIENT_SECRET ?? "",
    redirectUri: env.SPOTIFY_REDIRECT_URI?.trim() ?? "",
  };
}

export function createState() {
  const bytes = new Uint8Array(32);
  crypto.getRandomValues(bytes);
  return Array.from(bytes, (byte) => byte.toString(16).padStart(2, "0")).join("");
}

export function getCookie(request: Request, name: string) {
  const cookieHeader = request.headers.get("Cookie");
  if (!cookieHeader) return null;

  const prefix = `${name}=`;
  const cookie = cookieHeader.split(";").map((part) => part.trim()).find((part) => part.startsWith(prefix));
  return cookie ? cookie.slice(prefix.length) : null;
}

export function setStateCookie(state: string) {
  return `${SPOTIFY_STATE_COOKIE}=${state}; Max-Age=600; Path=/spotify-callback; HttpOnly; Secure; SameSite=Lax`;
}

export function clearStateCookie() {
  return `${SPOTIFY_STATE_COOKIE}=; Max-Age=0; Path=/spotify-callback; HttpOnly; Secure; SameSite=Lax`;
}

export function escapeHtml(value: string) {
  return value.replace(/[&<>"']/g, (character) => {
    const entities: Record<string, string> = {
      "&": "&amp;",
      "<": "&lt;",
      ">": "&gt;",
      '"': "&quot;",
      "'": "&#39;",
    };

    return entities[character];
  });
}
