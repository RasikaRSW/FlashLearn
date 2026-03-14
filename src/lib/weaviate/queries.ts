// import { getWeaviateClient } from './client';

// export async function searchShows(query: string, limit: number = 20) {
//   const client = getWeaviateClient();

//   // This now uses contextionary for semantic search!
//   const result = await client.graphql
//     .get()
//     .withClassName('Show')
//     .withFields('title description cover_image genre year type total_seasons total_episodes')
//     .withNearText({ concepts: [query] })
//     .withLimit(limit)
//     .do();

//   return result.data.Get.Show;
// }

// export async function semanticSearchEpisodes(concept: string, limit: number = 10) {
//   const client = getWeaviateClient();

//   const result = await client.graphql
//     .get()
//     .withClassName('Episode')
//     .withFields('title description season_number episode_number show_id')
//     .withNearText({ concepts: [concept] })
//     .withLimit(limit)
//     .do();

//   return result.data.Get.Episode;
// }

// // Rest of your queries remain the same
// export async function getShowEpisodes(showId: string, limit: number = 50) {
//   const client = getWeaviateClient();

//   const result = await client.graphql
//     .get()
//     .withClassName('Episode')
//     .withFields('show_id season_number episode_number title description subtitle_content duration air_date')
//     .withWhere({
//       path: ['show_id'],
//       operator: 'Equal',
//       valueString: showId,
//     })
//     .withLimit(limit)
//     .do();

//   return result.data.Get.Episode;
// }

// export async function getEpisode(episodeId: string) {
//   const client = getWeaviateClient();

//   const result = await client.graphql
//     .get()
//     .withClassName('Episode')
//     .withFields('show_id season_number episode_number title description subtitle_content duration air_date')
//     .withWhere({
//       path: ['id'],
//       operator: 'Equal',
//       valueString: episodeId,
//     })
//     .withLimit(1)
//     .do();

//   return result.data.Get.Episode?.[0];
// }


import { getWeaviateClient } from './client';

export async function searchShows(query: string, limit: number = 20) {
  const client = getWeaviateClient();

  // This now uses semantic search via Hugging Face embeddings!
  const result = await client.graphql
    .get()
    .withClassName('Show')
    .withFields('title description cover_image genre year type total_seasons total_episodes _additional { id }') 
    .withNearText({ concepts: [query] })
    .withLimit(limit)
    .do();

  return result.data.Get.Show;
}

export async function semanticSearchFlashcards(concept: string, limit: number = 10) {
  const client = getWeaviateClient();

  // Search flashcards by meaning, not just keywords
  const result = await client.graphql
    .get()
    .withClassName('Flashcard')
    .withFields('word definition context_sentence part_of_speech examples')
    .withNearText({ concepts: [concept] })
    .withLimit(limit)
    .do();

  return result.data.Get.Flashcard;
}

export async function getShowEpisodes(showId: string, limit: number = 50) {
  const client = getWeaviateClient();

   const result = await client.graphql
    .get()
    .withClassName('Episode')
    .withFields('show_id season_number episode_number title description subtitle_content duration air_date _additional { id }') // ADD THIS
    .withWhere({
      path: ['show_id'],
      operator: 'Equal',
      valueString: showId,
    })
    .withLimit(limit)
    .do();

  return result.data.Get.Episode;
}

export async function getEpisode(episodeId: string) {
  const client = getWeaviateClient();

  const result = await client.graphql
    .get()
    .withClassName('Episode')
    .withFields('show_id season_number episode_number title description subtitle_content duration air_date')
    .withWhere({
      path: ['id'],
      operator: 'Equal',
      valueString: episodeId,
    })
    .withLimit(1)
    .do();

  return result.data.Get.Episode?.[0];
}