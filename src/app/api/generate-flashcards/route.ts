import { NextResponse } from 'next/server';
import { getWeaviateClient } from '@/lib/weaviate/client';
// import { generateFlashcardsFromSubtitle } from '@/lib/gemini/client';
import { createClient } from '@/lib/supabase/server';

import { generateFlashcardsWithOpenRouter } from '@/lib/openrouter/client'; // CHANGE THIS

export async function POST(request: Request) {
  try {
    const { episodeId, userLevel, count = 5 } = await request.json();

    console.log('🔍 Generate flashcards request:', { episodeId, userLevel, count });

    // Validation
    if (!episodeId) {
      console.error('❌ No episodeId provided');
      return NextResponse.json(
        { error: 'Episode ID is required' },
        { status: 400 }
      );
    }

    // Validate count - allow 1-20 flashcards (adjust max as needed)
    const flashcardCount = Math.min(Math.max(parseInt(count) || 5, 1), 20);
    console.log('📊 Flashcard count:', flashcardCount);

    if (!userLevel) {
      return NextResponse.json(
        { error: 'User level is required' },
        { status: 400 }
      );
    }

    // Check Gemini API key early
    if (!process.env.OPENROUTER_API_KEY) {
      console.error('❌ GEMINI_API_KEY not set');
      return NextResponse.json(
        { error: 'Gemini API key not configured' },
        { status: 500 }
      );
    }

    // Get user from Supabase first (fail fast if not authenticated)
    const supabase = await createClient();
    const { data: { user }, error: authError } = await supabase.auth.getUser();

    if (authError || !user) {
      console.error('❌ User not authenticated:', authError);
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    console.log('✅ User authenticated:', user.id);

    // Get episode from Weaviate
    const weaviateClient = getWeaviateClient();
    console.log('🔍 Fetching episode:', episodeId);

    const episodeResult = await weaviateClient.graphql
      .get()
      .withClassName('Episode')
      .withFields('subtitle_content title show_id _additional { id }')
      .withWhere({
        path: ['id'],
        operator: 'Equal',
        valueString: episodeId,
      })
      .withLimit(1)
      .do();

    console.log('🔍 Weaviate response:', JSON.stringify(episodeResult, null, 2));

    const episode = episodeResult.data?.Get?.Episode?.[0];
    if (!episode) {
      console.error('❌ Episode not found:', episodeId);
      return NextResponse.json(
        { error: 'Episode not found' },
        { status: 404 }
      );
    }

    console.log('✅ Episode found:', episode.title);
    console.log('📝 Subtitle length:', episode.subtitle_content?.length || 0);

    // Check subtitle content
    if (!episode.subtitle_content || episode.subtitle_content.length < 10) {
      console.error('❌ Subtitle content too short or missing');
      return NextResponse.json(
        { error: 'Episode has no subtitle content' },
        { status: 400 }
      );
    }

    // Generate flashcards using OpenRouter
    console.log('🤖 Calling OpenRouter API...');
    const flashcards = await generateFlashcardsWithOpenRouter(
      episode.subtitle_content,
      userLevel,
      count
    );
    console.log('✅ Gemini generated', flashcards.length, 'flashcards');

    // Store flashcards in Weaviate
    const createdFlashcards = [];
    for (const card of flashcards) {
      const result = await weaviateClient.data
        .creator()
        .withClassName('Flashcard')
        .withProperties({
          ...card,
          episode_id: episodeId,
          cefr_level: userLevel,
          user_id: user.id, // Associate with user
          created_at: new Date().toISOString(),
        })
        .do();

      createdFlashcards.push({
        id: result.id,
        ...card,
        episode_id: episodeId,
        cefr_level: userLevel,
      });
    }

    console.log('✅ Stored', createdFlashcards.length, 'flashcards in Weaviate');

    return NextResponse.json({
      success: true,
      count: createdFlashcards.length,
      flashcards: createdFlashcards,
    });

  } catch (error) {
    console.error('❌ Error generating flashcards:', error);
    
    // Handle specific error types
    if (error instanceof SyntaxError) {
      return NextResponse.json(
        { error: 'Invalid JSON response from AI model' },
        { status: 502 }
      );
    }

    return NextResponse.json(
      { 
        error: error instanceof Error ? error.message : 'Failed to generate flashcards',
        details: error instanceof Error ? error.stack : undefined
      },
      { status: 500 }
    );
  }
}