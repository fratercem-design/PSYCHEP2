
import "dotenv/config";
import { db } from "./index";
import { streamers, streamerAccounts } from "./schema";

async function main() {
  console.log("Restoring Trident Fitness Irl...");

  try {
    const [newStreamer] = await db.insert(streamers).values({
      displayName: "Trident Fitness Irl",
      slug: "trident-irl",
      avatarUrl: "https://yt3.ggpht.com/6DwWlOefqMg1D_d5V13MDp_T33GvVvG7Pu9QOl1nQ6xAHX_EfcuntYVDVO3o2EFx8NEbohjRCPM=s800-c-k-c0xffffffff-no-rj-mo",
      nsfw: false,
      softHidden: false,
    }).returning();

    console.log(`Added streamer with ID: ${newStreamer.id}`);

    await db.insert(streamerAccounts).values({
      streamerId: newStreamer.id,
      platformId: 2, // YouTube
      channelId: "UCEZTIqMRPukJsTxE38gVWKA",
      channelUrl: "https://youtube.com/channel/UCEZTIqMRPukJsTxE38gVWKA",
    });

    console.log("Streamer account linked.");
  } catch (error) {
    console.error("Error restoring Trident:", error);
  }
  process.exit(0);
}

main();
