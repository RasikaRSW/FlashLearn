import { NextResponse } from 'next/server';
import { getWeaviateClient } from '@/lib/weaviate/client';

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const query = searchParams.get('query') || '';
    const limit = parseInt(searchParams.get('limit') || '20');

    const weaviateClient = getWeaviateClient();

    let result;
    if (query) {
      // Search with text query
      result = await weaviateClient.graphql
        .get()
        .withClassName('Show')
        .withFields('title description cover_image genre year type total_seasons total_episodes _additional { id }')
        .withNearText({ concepts: [query] })
        .withLimit(limit)
        .do();
    } else {
      // Get all shows (with limit)
      result = await weaviateClient.graphql
        .get()
        .withClassName('Show')
        .withFields('title description cover_image genre year type total_seasons total_episodes _additional { id }')
        .withLimit(limit)
        .do();
    }

    const shows = result.data.Get.Show || [];
    return NextResponse.json({ shows });
  } catch (error) {
    console.error('Error fetching shows:', error);
    return NextResponse.json(
      { error: 'Failed to fetch shows' },
      { status: 500 }
    );
  }
}