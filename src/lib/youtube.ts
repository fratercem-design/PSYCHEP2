
const YOUTUBE_API_KEY = process.env.YOUTUBE_API_KEY;
const YOUTUBE_SEARCH_URL = "https://www.googleapis.com/youtube/v3/search";
const YOUTUBE_CHANNELS_URL = "https://www.googleapis.com/youtube/v3/channels";

export interface LiveStreamDetails {
  isLive: boolean;
  streamUrl?: string;
  thumbnailUrl?: string;
}

export interface ChannelDetails {
  avatarUrl?: string;
}

export async function getChannelDetails(youtubeChannelId: string): Promise<ChannelDetails> {
  if (!YOUTUBE_API_KEY) {
    throw new Error("YOUTUBE_API_KEY is not set in environment variables.");
  }

  const url = `${YOUTUBE_CHANNELS_URL}?part=snippet&id=${youtubeChannelId}&key=${YOUTUBE_API_KEY}`;

  try {
    const response = await fetch(url, {
      next: { revalidate: 86400 }, // Cache for 24 hours
    });

    if (!response.ok) {
      console.error(`YouTube API request failed with status ${response.status}`);
      return {};
    }

    const data = await response.json();

    console.log(`YouTube API response for ${youtubeChannelId}:`, JSON.stringify(data, null, 2));

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

export async function isChannelLive(
  youtubeChannelId: string
): Promise<LiveStreamDetails> {
  if (!YOUTUBE_API_KEY) {
    throw new Error("YOUTUBE_API_KEY is not set in environment variables.");
  }

  const url = `${YOUTUBE_SEARCH_URL}?part=snippet&channelId=${youtubeChannelId}&type=video&eventType=live&key=${YOUTUBE_API_KEY}`;

  try {
    const response = await fetch(url, {
      // Revalidate every minute
      next: { revalidate: 60 },
    });

    if (!response.ok) {
      const errorBody = await response.json();
      console.error("YouTube API Error:", errorBody);
      throw new Error(`YouTube API request failed with status ${response.status}`);
    }

    const data = await response.json();

    if (data.items && data.items.length > 0) {
      const liveStream = data.items[0];
      const videoId = liveStream.id.videoId;
      return {
        isLive: true,
        streamUrl: `https://www.youtube.com/watch?v=${videoId}`,
        thumbnailUrl: liveStream.snippet.thumbnails.high.url,
      };
    } else {
      return {
        isLive: false,
      };
    }
  } catch (error) {
    console.error("Failed to fetch YouTube live status:", error);
    return {
      isLive: false,
    };
  }
}
