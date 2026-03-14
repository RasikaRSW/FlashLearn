import { config } from 'dotenv';
import { resolve } from 'path';

config({ path: resolve(__dirname, '../.env.local') });

import { getWeaviateClient } from '../src/lib/weaviate/client';

async function deleteBrokenObject() {
  try {
    const client = getWeaviateClient();

    const uuid = 'c005ed26-a88a-4e2d-bcdd-4bad3015b438';

    await client.data
      .deleter()
      .withClassName('Show')
      .withId(uuid)
      .do();

    console.log('✅ Broken object deleted successfully!');
  } catch (error) {
    console.error('❌ Error deleting object:', error);
  }
}

deleteBrokenObject();