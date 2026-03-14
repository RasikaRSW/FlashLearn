import { config } from 'dotenv';
import { resolve } from 'path';

config({ path: resolve(__dirname, '../.env.local') });

import { getWeaviateClient } from '../src/lib/weaviate/client';

async function updateShowImages() {
  try {
    const client = getWeaviateClient();

    console.log('🔍 Fetching all shows...');

    const result = await client.graphql
      .get()
      .withClassName('Show')
      .withFields('title cover_image _additional { id }')
      .withLimit(20)
      .do();

    const shows = result.data?.Get?.Show;

    if (!shows || shows.length === 0) {
      console.log('❌ No shows found');
      return;
    }

    // 🔥 New image URLs
    const updatedImages: Record<string, string> = {
      'Breaking Bad': 'https://addons-media.operacdn.com/media/CACHE/images/themes/85/172285/1.0-rev1/images/50b41d81-8185-4a3a-9227-7553dfb4d749/11abb37935c9f6f6929ae4491255c7a3.jpg'
    };

    for (const show of shows) {
      const newImage = updatedImages[show.title];

      if (!newImage) continue;

      await client.data
        .updater()
        .withClassName('Show')
        .withId(show._additional.id)
        .withProperties({
          cover_image: newImage,
        })
        .do();

      console.log(`✅ Updated ${show.title}`);
    }

    console.log('🎉 Image update complete!');
  } catch (error) {
    console.error('❌ Error updating images:', error);
  }
}

updateShowImages();