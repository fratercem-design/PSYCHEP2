import { db } from '../src/db';
import * as schema from '../src/db/schema';
import { eq } from 'drizzle-orm';

const YOUTUBE_API_KEY = process.env.YOUTUBE_API_KEY;
const YOUTUBE_SEARCH_URL = "https://www.googleapis.com/youtube/v3/search";

async function addStreamerByHandle(handle: string) {
  try {
    if (!YOUTUBE_API_KEY) {
      throw new Error("YOUTUBE_API_KEY is not set in environment variables.");
    }

    console.log(`Fetching channel details for ${handle}...`);

    // First, use the search API to find the channel ID from the handle
    const searchUrl = `${YOUTUBE_SEARCH_URL}?part=snippet&q=${handle}&type=channel&key=${YOUTUBE_API_KEY}`;
    const searchResponse = await fetch(searchUrl);
    if (!searchResponse.ok) {
      throw new Error(`YouTube Search API request failed with status ${searchResponse.status}`);
    }
    const searchData = await searchResponse.json();
    const channel = searchData.items?.[0];

    if (!channel || !channel.id || !channel.snippet) {
      console.error(`Could not find YouTube channel with handle '${handle}'`);
      return;
    }

    const channelId = channel.id.channelId;
    const { title, thumbnails } = channel.snippet;
    const avatarUrl = thumbnails?.high?.url || thumbnails?.default?.url || '';

    console.log(`Found channel: ${title} (ID: ${channelId})`);

    // Check if streamer already exists
    const existingStreamer = await db.query.streamers.findFirst({
      where: eq(schema.streamers.slug, handle.toLowerCase()),
    });

    if (existingStreamer) {
      console.log(`Streamer ${handle} already exists.`);
      return;
    }

    console.log(`Adding ${title} to the database...`);

    const newStreamer = await db.insert(schema.streamers).values({
      displayName: title || handle,
      slug: handle.toLowerCase(),
      avatarUrl,
    }).returning();

    const streamerId = newStreamer[0].id;

    await db.insert(schema.accounts).values([{
      streamerId,
      platformId: 2, // YouTube
      channelId,
      channelUrl: `https://youtube.com/channel/${channelId}`,
    }]);

    console.log(`Successfully added ${title} to Psycheverse!`);

  } catch (error) {
    console.error('Error adding streamer:', error);
  }
}

const handle = process.argv[2];
if (!handle) {
  console.log('Usage: npx tsx --env-file=.env scripts/add-streamer.ts <youtube-handle>');
  process.exit(1);
}

addStreamerByHandle(handle.replace('@', ''));
