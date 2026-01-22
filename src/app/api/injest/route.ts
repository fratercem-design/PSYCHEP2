
import { db } from "@/db";
import { platforms, streamerAccounts, liveStates, streamers } from "@/db/schema";
import { isChannelLive, getChannelDetails } from "@/lib/youtube";
import { eq } from "drizzle-orm";
import { revalidatePath } from "next/cache";
import { NextResponse } from "next/server";

// We can call this on a cron job
export async function GET() {
  console.log("Starting ingest...");

  const youtubePlatform = await db.query.platforms.findFirst({
    where: eq(platforms.name, "YouTube"),
  });

  if (!youtubePlatform) {
    console.error("YouTube platform not found in the database.");
    return NextResponse.json(
      { error: "YouTube platform not found" },
      { status: 500 }
    );
  }

  const youtubeAccounts = await db.query.streamerAccounts.findMany({
    where: eq(streamerAccounts.platformId, youtubePlatform.id),
    with: { streamer: true },
  });

  console.log(`Found ${youtubeAccounts.length} YouTube accounts to check.`);

  const promises = youtubeAccounts.map(async (account) => {
    try {
      console.log(`Processing streamer: ${account.streamer.displayName} (ID: ${account.streamer.id})`);

      // 1. Check Live Status
      const liveDetails = await isChannelLive(account.channelId);

      const dataToUpdate = {
        isLive: liveDetails.isLive,
        thumbnailUrl: liveDetails.isLive ? liveDetails.thumbnailUrl : null,
        title: liveDetails.isLive ? liveDetails.title : null,
        viewerCount: liveDetails.isLive ? liveDetails.viewerCount : 0,
        startedAt: liveDetails.isLive ? liveDetails.startedAt : null,
        updatedAt: new Date(),
      };

      await db
        .update(liveStates)
        .set(dataToUpdate)
        .where(eq(liveStates.streamerId, account.streamerId));

      // 2. Check/Update Avatar if missing
      if (!account.streamer.avatarUrl) {
        const channelDetails = await getChannelDetails(account.channelId);
        if (channelDetails.avatarUrl) {
          await db.update(streamers)
            .set({ avatarUrl: channelDetails.avatarUrl })
            .where(eq(streamers.id, account.streamerId));
        }
      }
       console.log(` -> Successfully processed ${account.streamer.displayName}`);
    } catch (error) {
      console.error(`Failed to process streamer ${account.streamer.displayName}:`, error);
    }
  });

  await Promise.all(promises);

  revalidatePath("/");

  console.log("Ingest completed.");
  return NextResponse.json({ message: "Ingest completed successfully" });
}
