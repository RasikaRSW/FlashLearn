import { config } from 'dotenv';
import { resolve } from 'path';

config({ path: resolve(__dirname, '../.env.local') });

import { getWeaviateClient } from '../src/lib/weaviate/client';

async function deleteAllEpisodes() {
  try {
    const client = getWeaviateClient();

    console.log('⚠️ Fetching all Episode objects...');

    // Fetch all Episodes
    const result = await client.graphql
      .get()
      .withClassName('Episode')
      .withFields('_additional { id }')
      .withLimit(1000) // adjust if you have more than 1000 episodes
      .do();

    const episodes = result.data?.Get?.Episode;

    if (!episodes || episodes.length === 0) {
      console.log('✅ No episodes found');
      return;
    }

    console.log(`🗑️ Deleting ${episodes.length} episodes...`);

    // Delete each episode by ID
    for (const ep of episodes) {
      await client.data
        .deleter()
        .withClassName('Episode')
        .withId(ep._additional.id)
        .do();
      console.log(`  ✅ Deleted episode ID: ${ep._additional.id}`);
    }

    console.log('🎉 All episodes deleted successfully!');
  } catch (error) {
    console.error('❌ Error deleting episodes:', error);
  }
}

deleteAllEpisodes();