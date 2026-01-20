import { db } from '@/db';

async function checkLiveStatus() {
  try {
    const liveStreamers = await db.query.liveStates.findMany({
      where: (liveStates, { eq }) => eq(liveStates.isLive, true),
      with: {
        streamer: {
          columns: {
            displayName: true,
            slug: true,
          },
        },
      },
    });

    if (liveStreamers.length > 0) {
      console.log('Live streamers found:', JSON.stringify(liveStreamers, null, 2));
    } else {
      console.log('No live streamers found.');
    }
  } catch (error) {
    console.error('Error querying database:', error);
  }
}

checkLiveStatus();
