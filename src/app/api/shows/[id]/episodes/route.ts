import { NextResponse } from 'next/server';
import { getWeaviateClient } from '@/lib/weaviate/client';

export async function GET(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const showId = params.id;
    const { searchParams } = new URL(request.url);
    const season = searchParams.get('season');

    const weaviateClient = getWeaviateClient();

    let query = weaviateClient.graphql
      .get()
      .withClassName('Episode')
      .withFields('show_id season_number episode_number title description subtitle_content duration air_date')
      .withWhere({
        path: ['show_id'],
        operator: 'Equal',
        valueString: showId,
      });

    if (season) {
      query = query.withWhere({
        path: ['season_number'],
        operator: 'Equal',
        valueInt: parseInt(season),
      });
    }

    const result = await query.withLimit(100).do();
    const episodes = result.data.Get.Episode || [];

    return NextResponse.json({ episodes });
  } catch (error) {
    console.error('Error fetching episodes:', error);
    return NextResponse.json(
      { error: 'Failed to fetch episodes' },
      { status: 500 }
    );
  }
}