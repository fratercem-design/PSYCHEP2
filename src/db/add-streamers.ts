
import "dotenv/config";
import { db } from "./index";
import { streamers, streamerAccounts, liveStates, platforms } from "./schema";
import { eq } from "drizzle-orm";

const STREAMER_HANDLES = [
  "chonaadventurevlogs",
];

async function main() {
  const apiKey = process.env.YOUTUBE_API_KEY;

  if (!apiKey) {
    console.error("YOUTUBE_API_KEY is missing!");
    process.exit(1);
  }

  // Get YouTube Platform ID
  const platformRows = await db.query.platforms.findFirst({
    where: eq(platforms.key, "youtube"),
  });

  if (!platformRows) {
    console.error("YouTube platform not found in DB!");
    process.exit(1);
  }

  const youtubeId = platformRows.id;

  console.log(`Processing ${STREAMER_HANDLES.length} streamers...`);

  for (const handle of STREAMER_HANDLES) {
    console.log(`\n--- Processing @${handle} ---`);
    try {
      // 1. Fetch Channel ID from YouTube API
      const searchUrl = `https://www.googleapis.com/youtube/v3/search?part=snippet&type=channel&q=${handle}&key=${apiKey}`;
      const response = await fetch(searchUrl);
      
      if (!response.ok) {
        console.error(`API Error for ${handle}: ${response.status} ${response.statusText}`);
        continue;
      }

      const data = await response.json();

      if (!data.items || data.items.length === 0) {
        console.error(`Could not find channel for handle: ${handle}`);
        continue;
      }

      // Use the first result
      const channelItem = data.items[0];
      const channelId = channelItem.snippet.channelId;
      const channelTitle = channelItem.snippet.channelTitle;
      
      console.log(`Found Channel: ${channelTitle} (${channelId})`);

      // 2. Insert Streamer
      const [streamer] = await db
        .insert(streamers)
        .values({
          displayName: channelTitle,
          slug: handle.toLowerCase(), // Use handle as slug
          nsfw: false,
        })
        .onConflictDoUpdate({
          target: streamers.slug,
          set: { displayName: channelTitle },
        })
        .returning();

      // 3. Insert Account
      await db
        .insert(streamerAccounts)
        .values({
          streamerId: streamer.id,
          platformId: youtubeId,
          channelId: channelId,
          channelUrl: `https://youtube.com/channel/${channelId}`,
        })
        .onConflictDoUpdate({
          target: [streamerAccounts.streamerId, streamerAccounts.platformId],
          set: { channelId: channelId, channelUrl: `https://youtube.com/channel/${channelId}` },
        });

      // 4. Insert Live State
      await db
        .insert(liveStates)
        .values({
          streamerId: streamer.id,
          platformId: youtubeId,
          isLive: false,
        })
        .onConflictDoNothing();

      console.log(`Successfully added ${channelTitle} (@${handle})`);

    } catch (error) {
      console.error(`Error processing ${handle}:`, error);
    }
  }

  console.log("\nDone!");
  process.exit(0);
}

main().catch((err) => {
  console.error("Fatal Error:", err);
  process.exit(1);
});
