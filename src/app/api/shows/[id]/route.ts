import { NextResponse } from 'next/server';
import { getWeaviateClient } from '@/lib/weaviate/client';

export async function GET(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const showId = params.id;

    const weaviateClient = getWeaviateClient();

    const result = await weaviateClient.graphql
      .get()
      .withClassName('Show')
      .withFields('title description cover_image genre year type total_seasons total_episodes')
      .withWhere({
        path: ['id'],
        operator: 'Equal',
        valueString: showId,
      })
      .withLimit(1)
      .do();

    const show = result.data.Get.Show?.[0];
    
    if (!show) {
      return NextResponse.json(
        { error: 'Show not found' },
        { status: 404 }
      );
    }

    return NextResponse.json({ show });
  } catch (error) {
    console.error('Error fetching show:', error);
    return NextResponse.json(
      { error: 'Failed to fetch show' },
      { status: 500 }
    );
  }
}