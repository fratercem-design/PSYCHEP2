import "dotenv/config";
import { db } from "../db";
import { liveStates, streamers } from "../db/schema";
import { eq } from "drizzle-orm";

async function main() {
  console.log("Starting mock ingestion...");

  // Fetch all streamers
  const allStreamers = await db.query.streamers.findMany({
    with: {
      liveState: true,
    },
  });

  console.log(`Found ${allStreamers.length} streamers.`);

  for (const streamer of allStreamers) {
    // Randomly decide if live (30% chance)
    const isLive = Math.random() < 0.3;
    
    // If live, generate some mock data
    const viewerCount = isLive ? Math.floor(Math.random() * 50000) + 100 : 0;
    const title = isLive ? `Mock Stream: ${streamer.displayName} doing IRL things!` : null;
    const thumbnailUrl = isLive 
      ? `https://picsum.photos/seed/${streamer.slug}/1280/720` 
      : null;

    console.log(`Updating ${streamer.displayName}: ${isLive ? "LIVE" : "OFFLINE"} (${viewerCount} viewers)`);

    // Update live state
    // Note: In a real app, we would upsert based on platform, but here we assume 1:1 for simplicity or update the existing record
    if (streamer.liveState) {
        await db
        .update(liveStates)
        .set({
            isLive,
            viewerCount,
            title,
            thumbnailUrl,
            updatedAt: new Date(),
            startedAt: isLive ? new Date() : null,
        })
        .where(eq(liveStates.streamerId, streamer.id));
    } else {
        // Should have been created by seed, but just in case
        console.warn(`No live state record for ${streamer.displayName}`);
    }
  }

  console.log("Mock ingestion complete!");
  process.exit(0);
}

main().catch((err) => {
  console.error("Ingestion failed:", err);
  process.exit(1);
});
