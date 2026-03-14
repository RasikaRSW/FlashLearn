import { getWeaviateClient } from './client';

export async function initializeWeaviateSchema() {
  const client = getWeaviateClient();

  // Define Show class
  const showClass = {
    class: 'Show',
    description: 'TV Shows and Movies',
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
    vectorizer: 'text2vec-openai',
  };

  // Define Episode class
  const episodeClass = {
    class: 'Episode',
    description: 'Episodes with subtitles',
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
    vectorizer: 'text2vec-openai',
  };

  try {
    await client.schema.classCreator().withClass(showClass).do();
    await client.schema.classCreator().withClass(episodeClass).do();
  } catch (error) {
    console.error('Error creating schema:', error);
  }
}