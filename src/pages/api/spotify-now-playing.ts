import type { APIRoute } from "astro";
import { env } from "cloudflare:workers";
import { getSpotifyConfig } from "../../lib/spotify";

type SpotifyTokenResponse = {
  access_token?: string;
};

type SpotifyImage = {
  url?: string;
};

type SpotifyPlayingItem = {
  type?: "track" | "episode";
  name?: string;
  duration_ms?: number;
  external_urls?: { spotify?: string };
  artists?: Array<{ name?: string }>;
  album?: { name?: string; images?: SpotifyImage[] };
  show?: { name?: string; images?: SpotifyImage[] };
};

type SpotifyCurrentlyPlaying = {
  is_playing?: boolean;
  progress_ms?: number | null;
  item?: SpotifyPlayingItem | null;
};

function jsonResponse(body: unknown, status = 200) {
  return new Response(JSON.stringify(body), {
    status,
    headers: {
      "Cache-Control": "no-store",
      "Content-Type": "application/json; charset=UTF-8",
    },
  });
}

export const GET: APIRoute = async () => {
  const { clientId, clientSecret, refreshToken } = getSpotifyConfig(env);

  if (!clientId || !clientSecret || !refreshToken) {
    return jsonResponse({ error: "Spotify is not configured." }, 500);
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
        grant_type: "refresh_token",
        refresh_token: refreshToken,
      }),
    });
  } catch {
    return jsonResponse({ error: "Spotify token refresh failed." }, 502);
  }

  let tokenData: SpotifyTokenResponse = {};
  try {
    tokenData = (await tokenResponse.json()) as SpotifyTokenResponse;
  } catch {
    return jsonResponse({ error: "Spotify returned an unreadable token response." }, 502);
  }

  if (!tokenResponse.ok || !tokenData.access_token) {
    return jsonResponse({ error: "Spotify rejected the refresh token." }, 502);
  }

  let currentlyPlayingResponse: Response;
  try {
    currentlyPlayingResponse = await fetch("https://api.spotify.com/v1/me/player?additional_types=track,episode", {
      headers: { Authorization: `Bearer ${tokenData.access_token}` },
    });
  } catch {
    return jsonResponse({ error: "Spotify playback could not be reached." }, 502);
  }

  if (currentlyPlayingResponse.status === 204) {
    return jsonResponse({ isPlaying: false, track: null });
  }

  if (!currentlyPlayingResponse.ok) {
    return jsonResponse({ error: "Spotify playback could not be read." }, 502);
  }

  let playback: SpotifyCurrentlyPlaying;
  try {
    playback = (await currentlyPlayingResponse.json()) as SpotifyCurrentlyPlaying;
  } catch {
    return jsonResponse({ error: "Spotify returned an unreadable playback response." }, 502);
  }

  const item = playback.item;
  if (!item?.name) {
    return jsonResponse({ isPlaying: false, track: null });
  }

  const isTrack = item.type === "track";
  const collection = isTrack ? item.album : item.show;

  return jsonResponse({
    isPlaying: Boolean(playback.is_playing),
    progressMs: playback.progress_ms ?? null,
    track: {
      type: item.type ?? "track",
      name: item.name,
      artists: item.artists?.map((artist) => artist.name).filter(Boolean) ?? [],
      collection: collection?.name ?? null,
      imageUrl: collection?.images?.[0]?.url ?? null,
      spotifyUrl: item.external_urls?.spotify ?? null,
      durationMs: item.duration_ms ?? null,
    },
  });
};
