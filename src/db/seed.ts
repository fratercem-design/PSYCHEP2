
import { db } from '.';
import { streamers, streamerAccounts, platforms } from './schema';
import { eq, inArray } from 'drizzle-orm';

import { config } from 'dotenv';
config({ path: './env.local' });

const placeholderStreamers = [
  'ishowspeed',
];

const streamersToAdd = [
  { displayName: 'cultofpsyche', youtubeHandle: 'cultofpsyche' },
  { displayName: 'hotmesssummer', youtubeHandle: 'hotmesssummer' },
  { displayName: 'djelectrafrye', youtubeHandle: 'djelectrafrye' },
  { displayName: 'dannystranger87', youtubeHandle: 'dannystranger87' },
  { displayName: 'doceansdeepwoo2532', youtubeHandle: 'doceansdeepwoo2532' },
  { displayName: 'm0n3y420', youtubeHandle: 'm0n3y420' },
  { displayName: 'chonaadventurevlogs', youtubeHandle: 'chonaadventurevlogs' },
  { displayName: 'heytherespunky', youtubeHandle: 'heytherespunky' },
];

async function getYoutubeChannelId(youtubeHandle: string): Promise<string | null> {
  const url = `https://www.googleapis.com/youtube/v3/search?part=snippet&type=channel&q=${youtubeHandle}&key=${process.env.YOUTUBE_API_KEY}`;
  try {
    const response = await fetch(url);
    const data = await response.json();
    if (data.items && data.items.length > 0) {
      return data.items[0].snippet.channelId;
    }
    return null;
  } catch (error) {
    console.error(`Failed to get channel ID for ${youtubeHandle}:`, error);
    return null;
  }
}

async function seed() {
  console.log('Seeding database...');

  const youtubePlatform = await db.query.platforms.findFirst({
    where: eq(platforms.key, 'youtube'),
  });

  if (!youtubePlatform) {
    console.error('YouTube platform not found in the database.');
    process.exit(1);
  }

  // Remove placeholder streamers
  if (placeholderStreamers.length > 0) {
    const streamersToDelete = await db.query.streamers.findMany({
        where: inArray(streamers.slug, placeholderStreamers),
    });
    if (streamersToDelete.length > 0) {
        const ids = streamersToDelete.map((s) => s.id);
        await db.delete(streamers).where(inArray(streamers.id, ids));
        console.log(`Removed placeholder streamers: ${placeholderStreamers.join(', ')}`);
    }
  }

  // Add new streamers
  for (const streamerInfo of streamersToAdd) {
    const channelId = await getYoutubeChannelId(streamerInfo.youtubeHandle);
    if (!channelId) {
      console.log(`Could not find YouTube channel for ${streamerInfo.youtubeHandle}. Skipping.`);
      continue;
    }

    const existingStreamer = await db.query.streamers.findFirst({
      where: eq(streamers.slug, streamerInfo.displayName),
    });

    let streamerId: number;

    if (existingStreamer) {
      streamerId = existingStreamer.id;
      console.log(`Streamer ${streamerInfo.displayName} already exists.`);
    } else {
      const newStreamer = await db.insert(streamers).values({
        displayName: streamerInfo.displayName,
        slug: streamerInfo.displayName,
      }).returning({ id: streamers.id });
      streamerId = newStreamer[0].id;
      console.log(`Added new streamer: ${streamerInfo.displayName}`);
    }

    const existingAccount = await db.query.streamerAccounts.findFirst({
        where: eq(streamerAccounts.channelId, channelId),
    });

    if (!existingAccount) {
        await db.insert(streamerAccounts).values({
            streamerId: streamerId,
            platformId: youtubePlatform.id,
            channelId: channelId,
            channelUrl: `https://www.youtube.com/channel/${channelId}`,
        });
        console.log(`Added YouTube account for ${streamerInfo.displayName}`);
    }
  }

  console.log('Seeding complete.');
}

seed().catch((error) => {
  console.error('Seeding failed:', error);
  process.exit(1);
});
