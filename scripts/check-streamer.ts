import { db } from '@/db';

async function checkStreamerAccount() {
  try {
    const streamer = await db.query.streamers.findFirst({
      where: (streamers, { eq }) => eq(streamers.slug, 'm0n3y420'),
      with: {
        accounts: true,
      },
    });

    if (streamer) {
      console.log('Streamer found:', JSON.stringify(streamer, null, 2));
    } else {
      console.log('Streamer not found.');
    }
  } catch (error) {
    console.error('Error querying database:', error);
  }
}

checkStreamerAccount();
