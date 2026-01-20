import "dotenv/config";
import { db } from "./index";
import { streamers, streamerAccounts, liveStates, platforms } from "./schema";
import { eq } from "drizzle-orm";

async function main() {
  const apiKey = process.env.YOUTUBE_API_KEY;
  const handle = "cultofpsyche";

  if (!apiKey) {
    console.error("YOUTUBE_API_KEY is missing!");
    process.exit(1);
  }

  console.log(`Fetching Channel ID for handle: @${handle}...`);

  // 1. Fetch Channel ID from YouTube API
  const searchUrl = `https://www.googleapis.com/youtube/v3/search?part=snippet&type=channel&q=${handle}&key=${apiKey}`;
  const response = await fetch(searchUrl);
  const data = await response.json();

  if (!data.items || data.items.length === 0) {
    console.error("Could not find channel!");
    console.log("API Response:", JSON.stringify(data, null, 2));
    process.exit(1);
  }

  const channelId = data.items[0].snippet.channelId;
  const channelTitle = data.items[0].snippet.channelTitle;
  console.log(`Found Channel: ${channelTitle} (${channelId})`);

  // 2. Get YouTube Platform ID
  const platformRows = await db.select().from(platforms).where(eq(platforms.key, "youtube"));
  const youtube = platformRows[0];

  if (!youtube) {
    console.error("YouTube platform not found in DB!");
    process.exit(1);
  }

  // 3. Insert Streamer
  console.log("Inserting/Updating Streamer...");
  const [streamer] = await db
    .insert(streamers)
    .values({
      displayName: "Psyche",
      slug: "psyche",
      nsfw: false,
      notes: "Owner Channel",
    })
    .onConflictDoUpdate({
      target: streamers.slug,
      set: { displayName: "Psyche" },
    })
    .returning();

  // 4. Insert Account
  console.log("Inserting Account...");
  await db
    .insert(streamerAccounts)
    .values({
      streamerId: streamer.id,
      platformId: youtube.id,
      channelId: channelId,
      channelUrl: `https://youtube.com/channel/${channelId}`,
    })
    .onConflictDoUpdate({
      target: [streamerAccounts.streamerId, streamerAccounts.platformId],
      set: { channelId: channelId, channelUrl: `https://youtube.com/channel/${channelId}` },
    });

  // 5. Insert Live State
  await db
    .insert(liveStates)
    .values({
      streamerId: streamer.id,
      platformId: youtube.id,
      isLive: false,
    })
    .onConflictDoNothing();

  console.log("Successfully added Psyche to the database!");
  process.exit(0);
}

main().catch((err) => {
  console.error("Error:", err);
  process.exit(1);
});
