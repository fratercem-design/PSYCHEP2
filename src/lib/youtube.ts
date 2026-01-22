
const YOUTUBE_API_KEY = process.env.YOUTUBE_API_KEY;
const YOUTUBE_SEARCH_URL = "https://www.googleapis.com/youtube/v3/search";
const YOUTUBE_CHANNELS_URL = "https://www.googleapis.com/youtube/v3/channels";
const YOUTUBE_VIDEOS_URL = "https://www.googleapis.com/youtube/v3/videos";

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

  // Step 1: Search for a live video on the channel
  const searchUrl = `${YOUTUBE_SEARCH_URL}?part=snippet&channelId=${youtubeChannelId}&type=video&eventType=live&key=${YOUTUBE_API_KEY}`;

  try {
    const searchResponse = await fetch(searchUrl, {
      // Revalidate every minute
      next: { revalidate: 60 },
    });

    if (!searchResponse.ok) {
      const errorBody = await searchResponse.json();
      console.error("YouTube Search API Error:", errorBody);
      // If quota exceeded or other API error, assume not live to avoid false positives
      return { isLive: false };
    }

    const searchData = await searchResponse.json();

    if (!searchData.items || searchData.items.length === 0) {
      return { isLive: false };
    }

    // Get the video ID from the search result
    const videoId = searchData.items[0].id.videoId;

    // Step 2: Verify the video status using the Videos API
    // This is crucial to filter out "upcoming" streams or cached "live" states
    const videoUrl = `${YOUTUBE_VIDEOS_URL}?part=liveStreamingDetails,snippet&id=${videoId}&key=${YOUTUBE_API_KEY}`;
    
    const videoResponse = await fetch(videoUrl, { cache: 'no-store' });
    
    if (!videoResponse.ok) {
       console.error("YouTube Video API Error:", await videoResponse.json());
       return { isLive: false };
    }

    const videoData = await videoResponse.json();
    
    if (!videoData.items || videoData.items.length === 0) {
      return { isLive: false };
    }

    const videoDetails = videoData.items[0];
    const liveDetails = videoDetails.liveStreamingDetails;
    const snippet = videoDetails.snippet;

    // Strict checks for live status
    // 1. Must have actualStartTime (means it actually started)
    // 2. Must NOT have actualEndTime (means it hasn't finished)
    if (liveDetails && liveDetails.actualStartTime && !liveDetails.actualEndTime) {
      
      // Get the best available thumbnail
      const thumbnails = snippet.thumbnails;
      const thumbnailUrl = thumbnails.maxres?.url || thumbnails.high?.url || thumbnails.medium?.url || thumbnails.default?.url;

      return {
        isLive: true,
        streamUrl: `https://www.youtube.com/watch?v=${videoId}`,
        thumbnailUrl: thumbnailUrl,
        title: snippet.title,
        viewerCount: parseInt(liveDetails.concurrentViewers || "0", 10),
        startedAt: new Date(liveDetails.actualStartTime),
      };
    }

    return { isLive: false };

  } catch (error) {
    console.error("Failed to fetch YouTube live status:", error);
    return {
      isLive: false,
    };
  }
}
