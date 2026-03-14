import { config } from 'dotenv';
import { resolve } from 'path';

// Load environment variables from .env.local
config({ path: resolve(__dirname, '../.env.local') });

// Debug: Check if variables are loaded
console.log('WEAVIATE_URL:', process.env.WEAVIATE_URL ? '✅ Found' : '❌ Missing');
console.log('WEAVIATE_API_KEY:', process.env.WEAVIATE_API_KEY ? '✅ Found' : '❌ Missing');

import { getWeaviateClient } from '../src/lib/weaviate/client';

async function populateShows() {
  console.log('📺 Adding sample shows...');
  
  try {
    const client = getWeaviateClient();

    const sampleShows = [
      {
        title: 'Friends',
        description: 'Follow the lives of six friends living in Manhattan',
        cover_image: 'https://wallpapercave.com/wp/zWUfbBC.jpg',
        genre: ['Comedy', 'Romance'],
        year: 1994,
        type: 'tv_show',
        total_seasons: 10,
        total_episodes: 236,
      },
      {
        title: 'Game of Thrones',
        description: 'Nine noble families fight for control over the lands of Westeros',
        cover_image: 'https://www.notebookcheck.net/fileadmin/Notebooks/News/_nc4/game-of-thrones-kingsroad-early-access.jpg',
        genre: ['Drama', 'Fantasy'],
        year: 2011,
        type: 'tv_show',
        total_seasons: 8,
        total_episodes: 73,
      },
      {
        title: 'The Big Bang Theory',
        description: 'A woman who moves into an apartment across the hall from two brilliant but socially awkward physicists shows them how little they know about life outside of the laboratory',
        cover_image: 'https://beam-images.warnermediacdn.com/BEAM_LWM_DELIVERABLES/c8ea8e19-cae7-4683-9b62-cdbbed744784/fec21ce5-f0bb-11f0-a2b3-12a894277793?host=wbd-images.prod-vod.h264.io&partner=beamcom&w=500',
        genre: ['Comedy'],
        year: 2007,
        type: 'tv_show',
        total_seasons: 12,
        total_episodes: 279,
      },
      {
        title: 'Breaking Bad',
        description: 'A high school chemistry teacher diagnosed with inoperable lung cancer turns to manufacturing and selling methamphetamine in order to secure his family\'s future',
        cover_image: 'https://images5.alphacoders.com/675/thumb-1920-675475.jpg',
        genre: ['Drama', 'Crime'],
        year: 2008,
        type: 'tv_show',
        total_seasons: 5,
        total_episodes: 62,
      },
    ];

    for (const show of sampleShows) {
      const result = await client.data
        .creator()
        .withClassName('Show')
        .withProperties(show)
        .do();
      console.log(`  ✅ Added: ${show.title} (ID: ${result.id})`);
    }

    console.log('🎉 Population complete!');
  } catch (error) {
    console.error('❌ Error populating data:', error);
  }
}

populateShows();