import { NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { getWeaviateClient } from '@/lib/weaviate/client';

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const episodeId = searchParams.get('episodeId');
    const difficulty = searchParams.get('difficulty');
    const saved = searchParams.get('saved') === 'true';

    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    const weaviateClient = getWeaviateClient();

    // Build query - FIXED: Use _additional.id instead of id
    let query = weaviateClient.graphql
      .get()
      .withClassName('Flashcard')
      .withFields(`
        word 
        context_sentence 
        definition 
        part_of_speech 
        synonyms 
        antonyms 
        examples 
        cefr_level 
        difficulty 
        created_at
        episode_id
        _additional {
          id
        }
      `);

    if (episodeId) {
      query = query.withWhere({
        path: ['episode_id'],
        operator: 'Equal',
        valueString: episodeId,
      });
    }

    if (difficulty) {
      query = query.withWhere({
        path: ['difficulty'],
        operator: 'Equal',
        valueString: difficulty,
      });
    }

    const result = await query.do();
    let flashcards = result.data.Get.Flashcard || [];

    // Transform to include id from _additional
    flashcards = flashcards.map((card: any) => ({
      ...card,
      id: card._additional?.id,
      _additional: undefined // Remove _additional to keep response clean
    }));

    if (saved) {
      // Filter to only saved flashcards
      const { data: savedCards } = await supabase
        .from('saved_flashcards')
        .select('flashcard_id')
        .eq('user_id', user.id);

      const savedIds = new Set(savedCards?.map((c: { flashcard_id: string }) => c.flashcard_id) || []);
      flashcards = flashcards.filter((card: { id: string }) => savedIds.has(card.id));
    }

    return NextResponse.json({ flashcards });
  } catch (error) {
    console.error('Error fetching flashcards:', error);
    return NextResponse.json(
      { error: 'Failed to fetch flashcards' },
      { status: 500 }
    );
  }
}

export async function POST(request: Request) {
  try {
    const { flashcardId, personalNotes, difficultyRating } = await request.json();

    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    // Check if already saved
    const { data: existing } = await supabase
      .from('saved_flashcards')
      .select('id')
      .eq('user_id', user.id)
      .eq('flashcard_id', flashcardId)
      .single();

    if (existing) {
      return NextResponse.json(
        { error: 'Flashcard already saved' },
        { status: 400 }
      );
    }

    // Save flashcard
    const { data, error } = await supabase
      .from('saved_flashcards')
      .insert({
        user_id: user.id,
        flashcard_id: flashcardId,
        personal_notes: personalNotes,
        difficulty_rating: difficultyRating,
        is_bookmarked: true,
      })
      .select()
      .single();

    if (error) throw error;

    return NextResponse.json({ savedFlashcard: data });
  } catch (error) {
    console.error('Error saving flashcard:', error);
    return NextResponse.json(
      { error: 'Failed to save flashcard' },
      { status: 500 }
    );
  }
}