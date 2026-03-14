import { getWeaviateClient } from '../src/lib/weaviate/client';

async function initializeSchema() {
  console.log('🔧 Initializing Weaviate schema with contextionary...');
  
  try {
    const client = getWeaviateClient();

    // Check if classes already exist
    const schema = await client.schema.getter().do();
    const existingClasses = schema.classes?.map(c => c.class) || [];

    // Define Show class with contextionary
    if (!existingClasses.includes('Show')) {
      console.log('Creating Show class...');
      const showClass = {
        class: 'Show',
        description: 'TV Shows and Movies',
        vectorizer: 'text2vec-contextionary',
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
    } else {
      console.log('Show class already exists');
    }

    // Define Episode class with contextionary
    if (!existingClasses.includes('Episode')) {
      console.log('Creating Episode class...');
      const episodeClass = {
        class: 'Episode',
        description: 'Episodes with subtitles',
        vectorizer: 'text2vec-contextionary',
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
    } else {
      console.log('Episode class already exists');
    }

    // Define Flashcard class with contextionary
    if (!existingClasses.includes('Flashcard')) {
      console.log('Creating Flashcard class...');
      const flashcardClass = {
        class: 'Flashcard',
        description: 'Vocabulary flashcards',
        vectorizer: 'text2vec-contextionary',
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
    } else {
      console.log('Flashcard class already exists');
    }

    console.log('🎉 Schema initialization complete!');
  } catch (error) {
    console.error('❌ Error initializing schema:', error);
  }
}

initializeSchema();