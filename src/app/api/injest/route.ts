
import { db } from "@/db";
import { platforms, streamerAccounts, liveStates, streamers } from "@/db/schema";
import { isChannelLive, getChannelDetails } from "@/lib/youtube";
import { isKickChannelLive, getKickChannelDetails } from "@/lib/kick";
import { isTwitchChannelLive, getTwitchChannelDetails } from "@/lib/twitch";
import { eq } from "drizzle-orm";
import { revalidatePath } from "next/cache";
import { NextResponse } from "next/server";

interface LiveCheckResult {
  isLive: boolean;
  thumbnailUrl?: string | null;
  title?: string | null;
  viewerCount?: number;
  startedAt?: Date | null;
}

interface AvatarResult {
  avatarUrl?: string;
}

// Check if a platform has the required API config
function isPlatformConfigured(platformKey: string): boolean {
  switch (platformKey) {
    case "youtube":
      return !!process.env.YOUTUBE_API_KEY;
    case "twitch":
      return !!(process.env.TWITCH_CLIENT_ID && process.env.TWITCH_CLIENT_SECRET);
    case "kick":
      return true; // Kick uses public API, no keys needed
    default:
      return false;
  }
}

// Platform-specific live check functions
async function checkLiveStatus(
  platformKey: string,
  channelId: string
): Promise<LiveCheckResult> {
  if (!isPlatformConfigured(platformKey)) {
    return { isLive: false };
  }

  switch (platformKey) {
    case "youtube":
      return isChannelLive(channelId);
    case "kick":
      return isKickChannelLive(channelId);
    case "twitch":
      return isTwitchChannelLive(channelId);
    default:
      console.warn(`Unknown platform: ${platformKey}`);
      return { isLive: false };
  }
}

// Platform-specific avatar fetch functions
async function fetchAvatar(
  platformKey: string,
  channelId: string
): Promise<AvatarResult> {
  switch (platformKey) {
    case "youtube":
      return getChannelDetails(channelId);
    case "kick":
      return getKickChannelDetails(channelId);
    case "twitch":
      return getTwitchChannelDetails(channelId);
    default:
      return {};
  }
}

// We can call this on a cron job (every 15 min via vercel.json)
export async function GET() {
  const startTime = Date.now();
  console.log("Starting multi-platform ingest...");

  // Get all platforms from DB
  const allPlatforms = await db.query.platforms.findMany();

  if (allPlatforms.length === 0) {
    console.error("No platforms found in the database.");
    return NextResponse.json(
      { error: "No platforms configured" },
      { status: 500 }
    );
  }

  console.log(`Platforms found: ${allPlatforms.map(p => p.name).join(", ")}`);

  // Get all streamer accounts with their streamer data
  const allAccounts = await db.query.streamerAccounts.findMany({
    with: {
      streamer: true,
      platform: true,
    },
  });

  console.log(`Found ${allAccounts.length} total accounts across all platforms.`);

  // Group by platform for logging
  const byPlatform: Record<string, number> = {};
  for (const acc of allAccounts) {
    const key = acc.platform.key;
    byPlatform[key] = (byPlatform[key] || 0) + 1;
  }
  console.log("Breakdown:", JSON.stringify(byPlatform));

  // Track results for the response
  const results = {
    total: allAccounts.length,
    checked: 0,
    live: 0,
    errors: 0,
    avatarsUpdated: 0,
  };

  // Group accounts by streamer so we can check all platforms per streamer
  // and pick the best live result (highest viewers wins)
  const accountsByStreamer = new Map<
    number,
    typeof allAccounts
  >();

  for (const account of allAccounts) {
    const existing = accountsByStreamer.get(account.streamerId) || [];
    existing.push(account);
    accountsByStreamer.set(account.streamerId, existing);
  }

  // Log which platforms are configured
  const configuredPlatforms = ["youtube", "kick", "twitch"].filter(isPlatformConfigured);
  const skippedPlatforms = ["youtube", "kick", "twitch"].filter(p => !isPlatformConfigured(p));
  console.log(`Configured platforms: ${configuredPlatforms.join(", ") || "NONE"}`);
  if (skippedPlatforms.length > 0) {
    console.log(`Skipping (no API keys): ${skippedPlatforms.join(", ")}`);
  }

  console.log(`Processing ${accountsByStreamer.size} unique streamers...`);

  // Process streamers in batches
  const BATCH_SIZE = 5;
  const streamerEntries = Array.from(accountsByStreamer.entries());

  for (let i = 0; i < streamerEntries.length; i += BATCH_SIZE) {
    const batch = streamerEntries.slice(i, i + BATCH_SIZE);

    const batchPromises = batch.map(async ([streamerId, accounts]) => {
      const streamerName = accounts[0].streamer.displayName;

      try {
        // Check all platform accounts for this streamer
        const liveChecks = await Promise.all(
          accounts.map(async (account) => {
            const platformKey = account.platform.key;
            console.log(`[${platformKey}] Checking: ${streamerName}`);
            results.checked++;

            const liveDetails = await checkLiveStatus(platformKey, account.channelId);
            return {
              account,
              platformKey,
              liveDetails,
            };
          })
        );

        // Find the best live result (prefer highest viewer count)
        const liveResults = liveChecks.filter((r) => r.liveDetails.isLive);

        let bestResult: (typeof liveChecks)[0] | null = null;

        if (liveResults.length > 0) {
          // Pick the platform with the most viewers
          bestResult = liveResults.reduce((best, current) =>
            (current.liveDetails.viewerCount || 0) > (best.liveDetails.viewerCount || 0)
              ? current
              : best
          );
          results.live++;
          console.log(
            `  -> 🔴 LIVE: ${streamerName} on ${bestResult.platformKey} (${bestResult.liveDetails.viewerCount || 0} viewers)`
          );
        }

        // Update live_states
        if (bestResult) {
          await db
            .update(liveStates)
            .set({
              isLive: true,
              platformId: bestResult.account.platformId,
              thumbnailUrl: bestResult.liveDetails.thumbnailUrl || null,
              title: bestResult.liveDetails.title || null,
              viewerCount: bestResult.liveDetails.viewerCount || 0,
              startedAt: bestResult.liveDetails.startedAt || null,
              updatedAt: new Date(),
            })
            .where(eq(liveStates.streamerId, streamerId));
        } else {
          // Not live on any platform
          await db
            .update(liveStates)
            .set({
              isLive: false,
              thumbnailUrl: null,
              title: null,
              viewerCount: 0,
              startedAt: null,
              updatedAt: new Date(),
            })
            .where(eq(liveStates.streamerId, streamerId));
        }

        // Check/Update Avatar if missing (try first available platform)
        const streamer = accounts[0].streamer;
        if (!streamer.avatarUrl) {
          for (const account of accounts) {
            const channelDetails = await fetchAvatar(
              account.platform.key,
              account.channelId
            );
            if (channelDetails.avatarUrl) {
              await db
                .update(streamers)
                .set({ avatarUrl: channelDetails.avatarUrl })
                .where(eq(streamers.id, streamerId));
              results.avatarsUpdated++;
              break;
            }
          }
        }

        console.log(`  -> ✅ ${streamerName}`);
      } catch (error) {
        results.errors++;
        console.error(`  -> ❌ Failed: ${streamerName}:`, error);
      }
    });

    await Promise.all(batchPromises);
  }

  revalidatePath("/");

  const duration = ((Date.now() - startTime) / 1000).toFixed(1);
  const summary = {
    message: "Multi-platform ingest completed",
    duration: `${duration}s`,
    ...results,
  };

  console.log("Ingest completed:", JSON.stringify(summary));
  return NextResponse.json(summary);
}
