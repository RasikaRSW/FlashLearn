import { config } from 'dotenv';
import { resolve } from 'path';

// Load environment variables from .env.local
config({ path: resolve(__dirname, '../.env.local') });

import { getWeaviateClient } from '../src/lib/weaviate/client';

async function setupWeaviate() {
  console.log('🔧 Setting up Weaviate Cloud schema...');
  
  try {
    const client = getWeaviateClient();

    // Test connection
    const meta = await client.misc.metaGetter().do();
    console.log('✅ Connected to Weaviate Cloud:', meta.version);

    // Delete existing classes if they exist (for clean setup)
    try {
      await client.schema.classDeleter().withClassName('Flashcard').do();
      console.log('Deleted existing Flashcard class');
    } catch (e) {}
    try {
      await client.schema.classDeleter().withClassName('Episode').do();
      console.log('Deleted existing Episode class');
    } catch (e) {}
    try {
      await client.schema.classDeleter().withClassName('Show').do();
      console.log('Deleted existing Show class');
    } catch (e) {}

    // Create Show class with Hugging Face embeddings
    console.log('Creating Show class...');
    const showClass = {
      class: 'Show',
      description: 'TV Shows and Movies',
      vectorizer: 'text2vec-huggingface',
      moduleConfig: {
        'text2vec-huggingface': {
          model: 'sentence-transformers/all-MiniLM-L6-v2',
          waitForModel: true,
        },
      },
      properties: [
        {
          name: 'title',
          dataType: ['string'],
          description: 'Title of the show',
        },
        {
          name: 'description',
          dataType: ['text'],
          description: 'Description of the show',
        },
        {
          name: 'cover_image',
          dataType: ['string'],
          description: 'URL to cover image',
        },
        {
          name: 'genre',
          dataType: ['string[]'],
          description: 'Genres',
        },
        {
          name: 'year',
          dataType: ['int'],
          description: 'Release year',
        },
        {
          name: 'type',
          dataType: ['string'],
          description: 'tv_show or movie',
        },
        {
          name: 'total_seasons',
          dataType: ['int'],
          description: 'Total seasons (for TV shows)',
        },
        {
          name: 'total_episodes',
          dataType: ['int'],
          description: 'Total episodes',
        },
      ],
    };

    await client.schema.classCreator().withClass(showClass).do();
    console.log('✅ Show class created');

    // Create Episode class
    console.log('Creating Episode class...');
    const episodeClass = {
      class: 'Episode',
      description: 'Episodes with subtitles',
      vectorizer: 'text2vec-huggingface',
      moduleConfig: {
        'text2vec-huggingface': {
          model: 'sentence-transformers/all-MiniLM-L6-v2',
          waitForModel: true,
        },
      },
      properties: [
        {
          name: 'show_id',
          dataType: ['string'],
          description: 'ID of the show',
        },
        {
          name: 'season_number',
          dataType: ['int'],
          description: 'Season number',
        },
        {
          name: 'episode_number',
          dataType: ['int'],
          description: 'Episode number',
        },
        {
          name: 'title',
          dataType: ['string'],
          description: 'Episode title',
        },
        {
          name: 'description',
          dataType: ['text'],
          description: 'Episode description',
        },
        {
          name: 'subtitle_content',
          dataType: ['text'],
          description: 'Full subtitle content',
        },
        {
          name: 'duration',
          dataType: ['int'],
          description: 'Duration in minutes',
        },
        {
          name: 'air_date',
          dataType: ['date'],
          description: 'Original air date',
        },
      ],
    };

    await client.schema.classCreator().withClass(episodeClass).do();
    console.log('✅ Episode class created');

    // Create Flashcard class
    console.log('Creating Flashcard class...');
    const flashcardClass = {
      class: 'Flashcard',
      description: 'Vocabulary flashcards',
      vectorizer: 'text2vec-huggingface',
      moduleConfig: {
        'text2vec-huggingface': {
          model: 'sentence-transformers/all-MiniLM-L6-v2',
          waitForModel: true,
        },
      },
      properties: [
        {
          name: 'episode_id',
          dataType: ['string'],
          description: 'ID of the episode',
        },
        {
          name: 'word',
          dataType: ['string'],
          description: 'The word or phrase',
        },
        {
          name: 'context_sentence',
          dataType: ['text'],
          description: 'Sentence where the word appears',
        },
        {
          name: 'definition',
          dataType: ['text'],
          description: 'Definition of the word',
        },
        {
          name: 'part_of_speech',
          dataType: ['string'],
          description: 'Part of speech',
        },
        {
          name: 'synonyms',
          dataType: ['string[]'],
          description: 'Synonyms',
        },
        {
          name: 'antonyms',
          dataType: ['string[]'],
          description: 'Antonyms',
        },
        {
          name: 'examples',
          dataType: ['text[]'],
          description: 'Example sentences',
        },
        {
          name: 'cefr_level',
          dataType: ['string'],
          description: 'CEFR level (A1-C2)',
        },
        {
          name: 'difficulty',
          dataType: ['string'],
          description: 'easy/medium/hard',
        },
        {
          name: 'created_at',
          dataType: ['date'],
          description: 'Creation date',
        },
      ],
    };

    await client.schema.classCreator().withClass(flashcardClass).do();
    console.log('✅ Flashcard class created');

    console.log('🎉 Weaviate Cloud setup complete!');
  } catch (error) {
    console.error('❌ Error:', error);
  }
}

setupWeaviate();