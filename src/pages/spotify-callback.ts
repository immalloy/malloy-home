import type { APIRoute } from "astro";
import { env } from "cloudflare:workers";
import {
  clearStateCookie,
  escapeHtml,
  getCookie,
  getSpotifyConfig,
  SPOTIFY_STATE_COOKIE,
} from "../lib/spotify";

type SpotifyTokenResponse = {
  refresh_token?: string;
  error?: string;
  error_description?: string;
};

const pageStyles = `
  @font-face {
    font-family: "FunkinOptions";
    src: url("/fonts/FunkinOptions.otf") format("opentype");
    font-display: swap;
  }

  @font-face {
    font-family: "FunkinLingLong";
    src: url("/fonts/FunkinLingLong.otf") format("opentype");
    font-display: swap;
  }

  :root { color-scheme: light; }
  * { box-sizing: border-box; }
  body {
    display: grid;
    min-height: 100svh;
    margin: 0;
    padding: 2rem;
    place-items: center;
    background: #f7f5ef;
    color: #1a1d24;
    font-family: "FunkinLingLong", sans-serif;
  }
  main { width: min(100%, 42rem); text-align: center; }
  .eyebrow {
    margin: 0 0 1.5rem;
    color: #1a1d2480;
    font-family: "FunkinOptions", sans-serif;
    font-size: 0.9rem;
    letter-spacing: 0.12em;
    text-transform: uppercase;
  }
  h1 {
    margin: 0;
    color: #5b8cff;
    font-family: "FunkinOptions", sans-serif;
    font-size: clamp(3rem, 9vw, 6rem);
    font-weight: 400;
    line-height: 0.9;
  }
  p { font-size: 1.25rem; line-height: 1.4; }
  code { font-family: ui-monospace, monospace; font-size: 0.9em; }
  textarea {
    display: block;
    width: 100%;
    min-height: 7rem;
    margin: 2rem 0 1rem;
    border: 2px solid #5b8cff;
    padding: 1rem;
    resize: vertical;
    color: #1a1d24;
    font: 1rem/1.5 ui-monospace, monospace;
  }
  button, a {
    display: inline-block;
    border: 2px solid #5b8cff;
    padding: 0.8rem 1rem;
    background: transparent;
    color: #5b8cff;
    cursor: pointer;
    font: 0.9rem "FunkinOptions", sans-serif;
    letter-spacing: 0.08em;
    text-decoration: none;
    text-transform: uppercase;
  }
  button:hover, button:focus-visible, a:hover, a:focus-visible {
    background: #5b8cff;
    color: #f7f5ef;
  }
  button:focus-visible, a:focus-visible {
    outline: 2px solid #1a1d24;
    outline-offset: 0.35rem;
  }
  .warning { color: #1a1d2480; font-size: 1rem; }
  .back-link { margin-top: 2rem; border-color: transparent; }
`;

function htmlResponse(body: string, status: number, cookie = clearStateCookie()) {
  return new Response(
    `<!doctype html><html lang="en"><head><meta charset="UTF-8"><meta name="viewport" content="width=device-width"><title>Spotify authorization | ImMalloy</title><style>${pageStyles}</style></head><body>${body}</body></html>`,
    {
      status,
      headers: {
        "Content-Type": "text/html; charset=UTF-8",
        "Cache-Control": "no-store",
        "Referrer-Policy": "no-referrer",
        "Set-Cookie": cookie,
      },
    },
  );
}

function errorResponse(title: string, message: string, status: number) {
  return htmlResponse(`<main><p class="eyebrow">Spotify authorization</p><h1>${escapeHtml(title)}</h1><p>${escapeHtml(message)}</p><a class="back-link" href="/">Back home</a></main>`, status);
}

export const GET: APIRoute = async ({ request, url }) => {
  const { clientId, clientSecret, redirectUri } = getSpotifyConfig(env);
  const state = url.searchParams.get("state");
  const savedState = getCookie(request, SPOTIFY_STATE_COOKIE);
  const spotifyError = url.searchParams.get("error");

  if (spotifyError) {
    return errorResponse("Authorization canceled", spotifyError, 400);
  }

  if (!state || !savedState || state !== savedState) {
    return errorResponse("Invalid authorization", "The Spotify state check failed. Start again from the login URL.", 400);
  }

  const code = url.searchParams.get("code");
  if (!code) {
    return errorResponse("Missing authorization code", "Spotify did not return an authorization code.", 400);
  }

  if (!clientId || !clientSecret || !redirectUri) {
    return errorResponse("Server configuration error", "Spotify authentication secrets are not configured on this Worker.", 500);
  }

  let tokenResponse: Response;
  try {
    tokenResponse = await fetch("https://accounts.spotify.com/api/token", {
      method: "POST",
      headers: {
        Authorization: `Basic ${btoa(`${clientId}:${clientSecret}`)}`,
        "Content-Type": "application/x-www-form-urlencoded",
      },
      body: new URLSearchParams({
        code,
        redirect_uri: redirectUri,
        grant_type: "authorization_code",
      }),
    });
  } catch {
    return errorResponse("Spotify is unavailable", "The Worker could not reach Spotify's token endpoint.", 502);
  }

  let tokenData: SpotifyTokenResponse = {};
  try {
    tokenData = (await tokenResponse.json()) as SpotifyTokenResponse;
  } catch {
    return errorResponse("Unexpected Spotify response", "Spotify returned an unreadable token response.", 502);
  }

  if (!tokenResponse.ok) {
    return errorResponse("Token exchange failed", tokenData.error_description ?? tokenData.error ?? "Spotify rejected the authorization code.", 502);
  }

  if (!tokenData.refresh_token) {
    return errorResponse("No refresh token returned", "Spotify did not include a refresh token. Try authorizing again with the same account.", 502);
  }

  const safeToken = escapeHtml(tokenData.refresh_token);
  return htmlResponse(
    `<main>
      <p class="eyebrow">Spotify connected</p>
      <h1>Refresh token ready</h1>
      <p>Copy this into Cloudflare as <code>SPOTIFY_REFRESH_TOKEN</code>.</p>
      <textarea id="refresh-token" readonly spellcheck="false" aria-label="Spotify refresh token">${safeToken}</textarea>
      <button id="copy-token" type="button">Copy refresh token</button>
      <p class="warning">Treat this token like a password. Do not share it publicly.</p>
      <a class="back-link" href="/">Back home</a>
      <script>
        const token = document.querySelector("#refresh-token");
        const copyButton = document.querySelector("#copy-token");
        copyButton?.addEventListener("click", async () => {
          if (!(token instanceof HTMLTextAreaElement)) return;
          try {
            await navigator.clipboard.writeText(token.value);
            copyButton.textContent = "Copied";
          } catch {
            token.focus();
            token.select();
            copyButton.textContent = "Select and copy";
          }
        });
      </script>
    </main>`,
    200,
  );
};
