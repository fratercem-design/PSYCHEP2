import { db } from '../src/db/index.js';

async function checkLiveState(streamerSlug: string) {
  try {
    // First find the streamer
    const streamer = await db.query.streamers.findFirst({
      where: (streamers, { eq }) => eq(streamers.slug, streamerSlug),
    });

    if (!streamer) {
      console.log(`Streamer ${streamerSlug} not found`);
      return;
    }

    console.log(`Found streamer: ${streamer.displayName} (ID: ${streamer.id})`);

    // Check live state
    const liveState = await db.query.liveStates.findFirst({
      where: (liveStates, { eq }) => eq(liveStates.streamerId, streamer.id),
    });

    if (!liveState) {
      console.log(`No live state found for ${streamerSlug}`);
      return;
    }

    console.log('Live state:', {
      isLive: liveState.isLive,
      title: liveState.title,
      viewerCount: liveState.viewerCount,
      startedAt: liveState.startedAt,
      updatedAt: liveState.updatedAt,
    });

    // Check recent stream records
    const recentStreams = await db.query.streams.findMany({
      where: (streams, { eq, and, gte }) => and(
        eq(streams.streamerId, streamer.id),
        gte(streams.createdAt, new Date(Date.now() - 24 * 60 * 60 * 1000)) // Last 24 hours
      ),
      orderBy: (streams, { desc }) => [desc(streams.createdAt)],
      limit: 5,
    });

    console.log(`Recent streams (${recentStreams.length}):`);
    recentStreams.forEach((stream, index) => {
      console.log(`  ${index + 1}. ${stream.title} - ${stream.createdAt} (Live: ${stream.isLive})`);
    });

  } catch (error) {
    console.error('Error checking live state:', error);
  }
}

const streamerSlug = process.argv[2];
if (!streamerSlug) {
  console.log('Usage: npx tsx --env-file=.env scripts/check-live-state.ts <streamer-slug>');
  process.exit(1);
}

checkLiveState(streamerSlug);