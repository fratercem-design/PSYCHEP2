
import "dotenv/config";
import { db } from "./index";
import { streamers, streamerAccounts, liveStates, platforms } from "./schema";
import { eq } from "drizzle-orm";

async function addHackride() {
  const youtube = await db.query.platforms.findFirst({
    where: eq(platforms.key, "youtube")
  });

  if (!youtube) {
    console.error("YouTube platform not found!");
    process.exit(1);
  }

  // Channel Data: Hackride Studios (UCeYQkyhB4172Nw0sngJuK7g)
  const channelTitle = "Hackride Studios";
  const channelId = "UCeYQkyhB4172Nw0sngJuK7g";
  const avatarUrl = "https://yt3.ggpht.com/lO3p67_P4BveFDUDnAvjV9gaNDmfY76UykwyHRrHk0ZnUS1BwPRChlKsY8Um8P5r-qNBcbuwtg=s800-c-k-c0xffffffff-no-rj-mo";

  console.log(`Adding ${channelTitle}...`);

  // 1. Insert Streamer
  const [streamer] = await db
    .insert(streamers)
    .values({
      displayName: channelTitle,
      slug: "hackride-studios",
      avatarUrl: avatarUrl,
      nsfw: false,
    })
    .onConflictDoUpdate({
      target: streamers.slug,
      set: { displayName: channelTitle, avatarUrl: avatarUrl }
    })
    .returning();

  // 2. Insert Account
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
      set: { channelId: channelId, channelUrl: `https://youtube.com/channel/${channelId}` }
    });

  // 3. Init Live State
  await db
    .insert(liveStates)
    .values({
      streamerId: streamer.id,
      platformId: youtube.id,
      isLive: false,
    })
    .onConflictDoNothing();

  console.log("Success! Hackride Studios added.");
  process.exit(0);
}

addHackride();
