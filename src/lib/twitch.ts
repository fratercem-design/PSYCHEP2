
const TWITCH_CLIENT_ID = process.env.TWITCH_CLIENT_ID;
const TWITCH_CLIENT_SECRET = process.env.TWITCH_CLIENT_SECRET;
const TWITCH_HELIX_URL = "https://api.twitch.tv/helix";
const TWITCH_TOKEN_URL = "https://id.twitch.tv/oauth2/token";

// Cache the app access token in memory
let cachedToken: { token: string; expiresAt: number } | null = null;

export interface TwitchLiveDetails {
  isLive: boolean;
  streamUrl?: string;
  thumbnailUrl?: string;
  title?: string;
  viewerCount?: number;
  startedAt?: Date;
}

export interface TwitchChannelDetails {
  avatarUrl?: string;
}

/**
 * Get a Twitch App Access Token (client credentials flow).
 * Caches the token until it expires.
 */
async function getAppAccessToken(): Promise<string> {
  if (!TWITCH_CLIENT_ID || !TWITCH_CLIENT_SECRET) {
    throw new Error("TWITCH_CLIENT_ID and TWITCH_CLIENT_SECRET must be set.");
  }

  // Return cached token if still valid (with 5 min buffer)
  if (cachedToken && Date.now() < cachedToken.expiresAt - 300_000) {
    return cachedToken.token;
  }

  const params = new URLSearchParams({
    client_id: TWITCH_CLIENT_ID,
    client_secret: TWITCH_CLIENT_SECRET,
    grant_type: "client_credentials",
  });

  const response = await fetch(TWITCH_TOKEN_URL, {
    method: "POST",
    body: params,
    cache: "no-store",
  });

  if (!response.ok) {
    const error = await response.text();
    console.error("Twitch token request failed:", error);
    throw new Error(`Failed to get Twitch access token: ${response.status}`);
  }

  const data = await response.json();
  cachedToken = {
    token: data.access_token,
    expiresAt: Date.now() + data.expires_in * 1000,
  };

  return cachedToken.token;
}

/**
 * Check if a Twitch channel is currently live.
 * @param twitchLogin - The Twitch username/login (e.g., "cultofpsyche")
 */
export async function isTwitchChannelLive(
  twitchLogin: string
): Promise<TwitchLiveDetails> {
  if (!TWITCH_CLIENT_ID || !TWITCH_CLIENT_SECRET) {
    console.warn("Twitch API credentials not configured, skipping.");
    return { isLive: false };
  }

  try {
    const token = await getAppAccessToken();

    const url = `${TWITCH_HELIX_URL}/streams?user_login=${encodeURIComponent(twitchLogin)}`;

    const response = await fetch(url, {
      headers: {
        "Client-ID": TWITCH_CLIENT_ID,
        Authorization: `Bearer ${token}`,
      },
      cache: "no-store",
    });

    if (!response.ok) {
      if (response.status === 401) {
        // Token expired, clear cache and retry once
        cachedToken = null;
        const newToken = await getAppAccessToken();
        const retryResponse = await fetch(url, {
          headers: {
            "Client-ID": TWITCH_CLIENT_ID,
            Authorization: `Bearer ${newToken}`,
          },
          cache: "no-store",
        });
        if (!retryResponse.ok) {
          console.error(`Twitch API retry failed: ${retryResponse.status}`);
          return { isLive: false };
        }
        const retryData = await retryResponse.json();
        return parseTwitchStreamData(retryData, twitchLogin);
      }

      console.error(`Twitch API error for ${twitchLogin}: ${response.status}`);
      return { isLive: false };
    }

    const data = await response.json();
    return parseTwitchStreamData(data, twitchLogin);
  } catch (error) {
    console.error(`Failed to fetch Twitch live status for ${twitchLogin}:`, error);
    return { isLive: false };
  }
}

function parseTwitchStreamData(
  data: { data?: Array<Record<string, unknown>> },
  twitchLogin: string
): TwitchLiveDetails {
  if (!data.data || data.data.length === 0) {
    return { isLive: false };
  }

  const stream = data.data[0];

  // Build thumbnail URL (Twitch uses {width}x{height} placeholders)
  let thumbnailUrl = (stream.thumbnail_url as string) || "";
  thumbnailUrl = thumbnailUrl
    .replace("{width}", "640")
    .replace("{height}", "360");

  return {
    isLive: true,
    streamUrl: `https://www.twitch.tv/${twitchLogin}`,
    thumbnailUrl,
    title: (stream.title as string) || "",
    viewerCount: (stream.viewer_count as number) || 0,
    startedAt: stream.started_at
      ? new Date(stream.started_at as string)
      : undefined,
  };
}

/**
 * Get Twitch channel details (avatar/profile image).
 * @param twitchLogin - The Twitch username/login
 */
export async function getTwitchChannelDetails(
  twitchLogin: string
): Promise<TwitchChannelDetails> {
  if (!TWITCH_CLIENT_ID || !TWITCH_CLIENT_SECRET) {
    return {};
  }

  try {
    const token = await getAppAccessToken();

    const url = `${TWITCH_HELIX_URL}/users?login=${encodeURIComponent(twitchLogin)}`;

    const response = await fetch(url, {
      headers: {
        "Client-ID": TWITCH_CLIENT_ID,
        Authorization: `Bearer ${token}`,
      },
      next: { revalidate: 86400 },
    });

    if (!response.ok) return {};

    const data = await response.json();

    if (data.data && data.data.length > 0) {
      return {
        avatarUrl: data.data[0].profile_image_url || undefined,
      };
    }

    return {};
  } catch (error) {
    console.error(`Failed to fetch Twitch channel details for ${twitchLogin}:`, error);
    return {};
  }
}
