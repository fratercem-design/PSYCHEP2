
const YOUTUBE_API_KEY = process.env.YOUTUBE_API_KEY;
const YOUTUBE_VIDEOS_URL = "https://www.googleapis.com/youtube/v3/videos";
const YOUTUBE_CHANNELS_URL = "https://www.googleapis.com/youtube/v3/channels";
const YOUTUBE_SEARCH_URL = "https://www.googleapis.com/youtube/v3/search";

export interface LiveStreamDetails {
  isLive: boolean;
  streamUrl?: string;
  thumbnailUrl?: string;
  title?: string;
  viewerCount?: number;
  startedAt?: Date;
}

export interface ChannelDetails {
  avatarUrl?: string;
}

/**
 * YouTube API Quota Optimization Strategy:
 *
 * OLD approach: search.list (100 units) + videos.list (1 unit) = 101 units/streamer
 * NEW approach: RSS feed (FREE) + videos.list (1 unit) = 1 unit/streamer
 *
 * 22 streamers × 96 checks/day:
 * OLD: 213,312 units/day (21x over 10K quota!)
 * NEW: ~2,112 units/day (well within 10K quota)
 *
 * Flow:
 * 1. Fetch the channel's RSS feed (free, no quota)
 * 2. Extract recent video IDs from the XML
 * 3. Batch-check those videos via videos.list (1 unit) for live status
 * 4. Only fall back to expensive search.list if RSS is unavailable
 */

/**
 * Fetch recent video IDs from a YouTube channel's RSS feed.
 * This is completely FREE — no API quota used.
 */
async function getRecentVideoIdsFromRSS(
  youtubeChannelId: string
): Promise<string[]> {
  const rssUrl = `https://www.youtube.com/feeds/videos.xml?channel_id=${encodeURIComponent(youtubeChannelId)}`;

  try {
    const response = await fetch(rssUrl, {
      cache: "no-store",
      headers: {
        "User-Agent": "PsycheVerse/1.0",
      },
    });

    if (!response.ok) {
      console.warn(
        `RSS feed unavailable for channel ${youtubeChannelId}: ${response.status}`
      );
      return [];
    }

    const xml = await response.text();

    // Extract video IDs from <yt:videoId>...</yt:videoId> tags
    const videoIds: string[] = [];
    const regex = /<yt:videoId>([^<]+)<\/yt:videoId>/g;
    let match;
    while ((match = regex.exec(xml)) !== null) {
      videoIds.push(match[1]);
    }

    return videoIds;
  } catch (error) {
    console.warn(`Failed to fetch RSS feed for ${youtubeChannelId}:`, error);
    return [];
  }
}

/**
 * Batch-check video IDs for live status using videos.list API.
 * Cost: 1 unit per call (can batch up to 50 IDs per call).
 */
async function checkVideosForLiveStream(
  videoIds: string[]
): Promise<LiveStreamDetails> {
  if (!YOUTUBE_API_KEY || videoIds.length === 0) {
    return { isLive: false };
  }

  // Check up to 10 most recent videos (live streams appear near the top)
  const idsToCheck = videoIds.slice(0, 10);
  const idsParam = idsToCheck.join(",");

  const url = `${YOUTUBE_VIDEOS_URL}?part=liveStreamingDetails,snippet&id=${idsParam}&key=${YOUTUBE_API_KEY}`;

  try {
    const response = await fetch(url, { cache: "no-store" });

    if (!response.ok) {
      const errorBody = await response.json().catch(() => ({}));
      console.error("YouTube Videos API Error:", errorBody);
      return { isLive: false };
    }

    const data = await response.json();

    if (!data.items || data.items.length === 0) {
      return { isLive: false };
    }

    // Find any video that is currently live
    for (const video of data.items) {
      const liveDetails = video.liveStreamingDetails;
      const snippet = video.snippet;

      if (
        liveDetails &&
        liveDetails.actualStartTime &&
        !liveDetails.actualEndTime
      ) {
        // This video is currently live!
        const thumbnails = snippet.thumbnails;
        const thumbnailUrl =
          thumbnails.maxres?.url ||
          thumbnails.high?.url ||
          thumbnails.medium?.url ||
          thumbnails.default?.url;

        return {
          isLive: true,
          streamUrl: `https://www.youtube.com/watch?v=${video.id}`,
          thumbnailUrl,
          title: snippet.title,
          viewerCount: parseInt(liveDetails.concurrentViewers || "0", 10),
          startedAt: new Date(liveDetails.actualStartTime),
        };
      }
    }

    return { isLive: false };
  } catch (error) {
    console.error("Failed to batch-check videos for live status:", error);
    return { isLive: false };
  }
}

/**
 * Fallback: Use the expensive search.list API (100 units).
 * Only used when RSS feed is unavailable.
 */
async function searchForLiveStream(
  youtubeChannelId: string
): Promise<LiveStreamDetails> {
  if (!YOUTUBE_API_KEY) {
    return { isLive: false };
  }

  const searchUrl = `${YOUTUBE_SEARCH_URL}?part=snippet&channelId=${youtubeChannelId}&type=video&eventType=live&key=${YOUTUBE_API_KEY}`;

  try {
    const searchResponse = await fetch(searchUrl, { cache: "no-store" });

    if (!searchResponse.ok) {
      const errorBody = await searchResponse.json().catch(() => ({}));
      console.error("YouTube Search API Error:", errorBody);
      return { isLive: false };
    }

    const searchData = await searchResponse.json();

    if (!searchData.items || searchData.items.length === 0) {
      return { isLive: false };
    }

    const videoId = searchData.items[0].id.videoId;

    // Verify with videos.list (1 unit)
    return checkVideosForLiveStream([videoId]);
  } catch (error) {
    console.error("Search API fallback failed:", error);
    return { isLive: false };
  }
}

/**
 * Check if a YouTube channel is currently live.
 * Uses the quota-efficient RSS + videos.list approach.
 *
 * @param youtubeChannelId - The YouTube channel ID (e.g., "UCxxxxxx")
 */
export async function isChannelLive(
  youtubeChannelId: string
): Promise<LiveStreamDetails> {
  if (!YOUTUBE_API_KEY) {
    console.warn("YOUTUBE_API_KEY not set, skipping YouTube live check.");
    return { isLive: false };
  }

  // Step 1: Get recent video IDs from RSS feed (FREE)
  const videoIds = await getRecentVideoIdsFromRSS(youtubeChannelId);

  if (videoIds.length > 0) {
    // Step 2: Batch-check those videos for live status (1 API unit)
    const result = await checkVideosForLiveStream(videoIds);
    return result;
  }

  // Fallback: RSS failed or returned no videos — use expensive search API
  console.warn(
    `RSS returned no videos for ${youtubeChannelId}, falling back to Search API (100 units)`
  );
  return searchForLiveStream(youtubeChannelId);
}

/**
 * Get YouTube channel details (avatar/profile image).
 * Cost: 1 API unit.
 */
export async function getChannelDetails(
  youtubeChannelId: string
): Promise<ChannelDetails> {
  if (!YOUTUBE_API_KEY) {
    console.warn("YOUTUBE_API_KEY not set, skipping channel details.");
    return {};
  }

  const url = `${YOUTUBE_CHANNELS_URL}?part=snippet&id=${youtubeChannelId}&key=${YOUTUBE_API_KEY}`;

  try {
    const response = await fetch(url, {
      next: { revalidate: 86400 }, // Cache for 24 hours
    });

    if (!response.ok) {
      console.error(
        `YouTube Channels API request failed with status ${response.status}`
      );
      return {};
    }

    const data = await response.json();

    if (data.items && data.items.length > 0) {
      const channel = data.items[0];
      return {
        avatarUrl: channel.snippet.thumbnails.high.url,
      };
    }
    return {};
  } catch (error) {
    console.error("Failed to fetch YouTube channel details:", error);
    return {};
  }
}
