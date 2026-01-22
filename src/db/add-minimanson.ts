
import "dotenv/config";
import { db } from "./index";
import { streamers, streamerAccounts } from "./schema";

const apiKey = process.env.YOUTUBE_API_KEY;

async function main() {
  console.log("Adding Mini Manson...");

  const channelId = "UCJhmZp3sSZlT-xQzV9rdisw";
  
  // Fetch channel details to get avatar
  const url = `https://www.googleapis.com/youtube/v3/channels?part=snippet&id=${channelId}&key=${apiKey}`;
  
  let avatarUrl = "";
  let title = "Mini Manson";
  let customUrl = "mini-manson";

  try {
    const res = await fetch(url);
    const data = await res.json();
    if (data.items && data.items.length > 0) {
        const snippet = data.items[0].snippet;
        title = snippet.title;
        avatarUrl = snippet.thumbnails?.high?.url || snippet.thumbnails?.default?.url;
        customUrl = snippet.customUrl || "mini-manson";
        console.log(`Fetched details for: ${title}`);
    }
  } catch (e) {
      console.log("Failed to fetch details, using defaults.");
  }

  try {
    const [newStreamer] = await db.insert(streamers).values({
      displayName: title,
      slug: "mini-manson", // Using a clean slug
      avatarUrl: avatarUrl,
      nsfw: false,
      softHidden: false,
    }).returning();

    console.log(`Added streamer: ${newStreamer.displayName} (ID: ${newStreamer.id})`);

    await db.insert(streamerAccounts).values({
      streamerId: newStreamer.id,
      platformId: 2, // YouTube
      channelId: channelId,
      channelUrl: `https://youtube.com/channel/${channelId}`,
    });

    console.log("Streamer account linked.");
  } catch (error) {
    console.error("Error adding streamer:", error);
  }
  process.exit(0);
}

main();
