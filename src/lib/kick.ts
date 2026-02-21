
export interface KickLiveDetails {
  isLive: boolean;
  streamUrl?: string;
  thumbnailUrl?: string;
  title?: string;
  viewerCount?: number;
  startedAt?: Date;
}

export interface KickChannelDetails {
  avatarUrl?: string;
}

/**
 * Check if a Kick channel is currently live.
 * Uses the public Kick API v2 endpoint (no auth required).
 * @param kickUsername - The Kick channel slug/username (e.g., "cultofpsyche")
 */
export async function isKickChannelLive(
  kickUsername: string
): Promise<KickLiveDetails> {
  const url = `https://kick.com/api/v2/channels/${encodeURIComponent(kickUsername)}`;

  try {
    const response = await fetch(url, {
      headers: {
        "Accept": "application/json",
        "User-Agent": "Psycheverse/1.0",
      },
      cache: "no-store",
    });

    if (!response.ok) {
      if (response.status === 404) {
        console.warn(`Kick channel not found: ${kickUsername}`);
        return { isLive: false };
      }
      console.error(`Kick API error for ${kickUsername}: ${response.status}`);
      return { isLive: false };
    }

    const data = await response.json();

    // Kick API returns livestream data nested under the channel object
    const livestream = data.livestream;

    if (livestream && livestream.is_live) {
      const thumbnail =
        livestream.thumbnail?.url ||
        livestream.thumbnail?.src ||
        null;

      return {
        isLive: true,
        streamUrl: `https://kick.com/${kickUsername}`,
        thumbnailUrl: thumbnail,
        title: livestream.session_title || livestream.slug || "",
        viewerCount: livestream.viewer_count || 0,
        startedAt: livestream.created_at
          ? new Date(livestream.created_at)
          : undefined,
      };
    }

    return { isLive: false };
  } catch (error) {
    console.error(`Failed to fetch Kick live status for ${kickUsername}:`, error);
    return { isLive: false };
  }
}

/**
 * Get Kick channel details (avatar, etc.)
 * @param kickUsername - The Kick channel slug/username
 */
export async function getKickChannelDetails(
  kickUsername: string
): Promise<KickChannelDetails> {
  const url = `https://kick.com/api/v2/channels/${encodeURIComponent(kickUsername)}`;

  try {
    const response = await fetch(url, {
      headers: {
        "Accept": "application/json",
        "User-Agent": "Psycheverse/1.0",
      },
      next: { revalidate: 86400 },
    });

    if (!response.ok) return {};

    const data = await response.json();

    const avatarUrl =
      data.user?.profile_pic ||
      data.user?.profilepic ||
      null;

    return { avatarUrl: avatarUrl || undefined };
  } catch (error) {
    console.error(`Failed to fetch Kick channel details for ${kickUsername}:`, error);
    return {};
  }
}
