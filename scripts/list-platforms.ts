import { db } from '@/db';

async function listPlatforms() {
  try {
    const allPlatforms = await db.query.platforms.findMany();
    console.log('Available platforms:', JSON.stringify(allPlatforms, null, 2));
  } catch (error) {
    console.error('Error querying database:', error);
  }
}

listPlatforms();
