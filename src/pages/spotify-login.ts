import type { APIRoute } from "astro";
import { env } from "cloudflare:workers";
import { createState, getSpotifyConfig, setStateCookie, SPOTIFY_SCOPES } from "../lib/spotify";

// Keep the authorization entry point server-only so credentials never reach the browser.
export const GET: APIRoute = () => {
  const { clientId, redirectUri } = getSpotifyConfig(env);

  if (!clientId || !redirectUri) {
    return new Response("Spotify authentication is not configured.", { status: 500 });
  }

  const state = createState();
  const authorizeUrl = new URL("https://accounts.spotify.com/authorize");
  authorizeUrl.search = new URLSearchParams({
    response_type: "code",
    client_id: clientId,
    redirect_uri: redirectUri,
    scope: SPOTIFY_SCOPES,
    state,
    show_dialog: "true",
  }).toString();

  return new Response(null, {
    status: 302,
    headers: {
      Location: authorizeUrl.toString(),
      "Set-Cookie": setStateCookie(state),
      "Cache-Control": "no-store",
    },
  });
};
