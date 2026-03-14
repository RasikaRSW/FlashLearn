import { NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { getWeaviateClient } from '@/lib/weaviate/client';

export async function GET(request: Request) {
  try {
    console.log('Fetching saved flashcards...');
    
    const supabase = await createClient();
    const { data: { user }, error: userError } = await supabase.auth.getUser();

    if (userError || !user) {
      console.error('Auth error:', userError);
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    console.log('User authenticated:', user.id);

    // Get saved flashcards from Supabase
    const { data: savedCards, error: savedError } = await supabase
      .from('saved_flashcards')
      .select('*')
      .eq('user_id', user.id)
      .order('created_at', { ascending: false });

    if (savedError) {
      console.error('Supabase error:', savedError);
      throw savedError;
    }

    console.log(`Found ${savedCards?.length || 0} saved flashcards in Supabase`);

    if (!savedCards || savedCards.length === 0) {
      return NextResponse.json({ savedCards: [] });
    }

    // Get flashcard details from Weaviate
    const weaviateClient = getWeaviateClient();
    const flashcardIds = savedCards.map(card => card.flashcard_id);

    console.log('Fetching from Weaviate, IDs:', flashcardIds);

    // Weaviate query to get flashcards by IDs
    const query = weaviateClient.graphql
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
      `)
      .withWhere({
        operator: 'ContainsAny',
        path: ['id'],
        valueTextArray: flashcardIds
      });

    const result = await query.do();
    console.log('Weaviate query result:', JSON.stringify(result, null, 2));

    const flashcards = result.data?.Get?.Flashcard || [];
    console.log(`Found ${flashcards.length} flashcards in Weaviate`);

     // Create a map for quick lookup
    const flashcardMap = new Map();
    flashcards.forEach((flashcard: any) => {
      flashcardMap.set(flashcard._additional?.id, flashcard);
    });

    // Transform Weaviate flashcards and merge with saved card data
    const enrichedSavedCards = savedCards.map(savedCard => {
      const flashcardDetails = flashcardMap.get(savedCard.flashcard_id);

      return {
        ...savedCard,
        flashcard_details: flashcardDetails ? {
          ...flashcardDetails,
          id: flashcardDetails._additional?.id
        } : null
      };
    });

    console.log('Successfully enriched cards:', enrichedSavedCards.length);
    return NextResponse.json({ savedCards: enrichedSavedCards });
  } catch (error) {
    console.error('Error in /api/flashcards/saved:', error);
    return NextResponse.json(
      { error: 'Failed to fetch saved flashcards', details: error instanceof Error ? error.message : String(error) },
      { status: 500 }
    );
  }
}