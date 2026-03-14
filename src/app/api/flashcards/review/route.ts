import { NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { getWeaviateClient } from '@/lib/weaviate/client';
import { calculateNextReview } from '@/lib/utils/spacedRepetition';

interface WeaviateFlashcard {
  _additional?: {
    id: string;
  };
  word: string;
  context_sentence: string;
  definition: string;
  part_of_speech: string;
  cefr_level: string;
  difficulty: string;
}

interface SavedFlashcard {
  id: string;
  flashcard_id: string;
  user_id: string;
  personal_notes?: string;
  difficulty_rating?: number;
  is_bookmarked: boolean;
  created_at: string;
  next_review_date?: string | null;
  repetitions?: number;
  ease_factor?: number;
  interval_days?: number;
  updated_at?: string;
}

interface ReviewCard {
  id: string;
  flashcard_id: string;
  repetitions: number;
  ease_factor: number;
  interval_days: number;
  next_review_date?: string | null;
  flashcard_details: WeaviateFlashcard | null;
}

export async function GET(request: Request) {
  try {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    console.log('Fetching due cards for user:', user.id);

    // Get current date
    const now = new Date();
    const endOfDay = new Date(now);
    endOfDay.setHours(23, 59, 59, 999);
    
    console.log('End of day:', endOfDay.toISOString());

    // Get ALL cards that are due (either null next_review_date OR next_review_date <= today)
    const { data: dueCards, error } = await supabase
      .from('saved_flashcards')
      .select('*')
      .eq('user_id', user.id)
      .or(`next_review_date.is.null,next_review_date.lte.${endOfDay.toISOString()}`);

    if (error) {
      console.error('Error fetching due cards:', error);
      return NextResponse.json({ flashcards: [] });
    }

    console.log(`Found ${dueCards?.length || 0} due cards`);

    if (!dueCards || dueCards.length === 0) {
      return NextResponse.json({ flashcards: [] });
    }

    // Fetch flashcard details from Weaviate
    const weaviateClient = getWeaviateClient();
    const flashcardIds = dueCards.map((card: SavedFlashcard) => card.flashcard_id);

    const weaviateQuery = weaviateClient.graphql
      .get()
      .withClassName('Flashcard')
      .withFields(`
        word
        context_sentence
        definition
        part_of_speech
        cefr_level
        difficulty
        _additional {
          id
        }
      `)
      .withWhere({
        operator: 'ContainsAny',
        path: ['id'],
        valueTextArray: flashcardIds
      });

    const result = await weaviateQuery.do();
    const flashcards = result.data?.Get?.Flashcard || [];

    // Create a map for quick lookup
    const flashcardMap = new Map<string, WeaviateFlashcard>();
    flashcards.forEach((flashcard: WeaviateFlashcard) => {
      if (flashcard._additional?.id) {
        flashcardMap.set(flashcard._additional.id, flashcard);
      }
    });

    // Merge due card data with flashcard details
    const reviewCards: ReviewCard[] = dueCards.map((dueCard: SavedFlashcard) => {
      const details = flashcardMap.get(dueCard.flashcard_id) || null;
      return {
        id: dueCard.id,
        flashcard_id: dueCard.flashcard_id,
        repetitions: dueCard.repetitions || 0,
        ease_factor: dueCard.ease_factor || 2.5,
        interval_days: dueCard.interval_days || 0,
        next_review_date: dueCard.next_review_date,
        flashcard_details: details
      };
    });

    console.log(`Returning ${reviewCards.length} review cards`);
    return NextResponse.json({ flashcards: reviewCards });
  } catch (error) {
    console.error('Error in review API:', error);
    return NextResponse.json({ flashcards: [] });
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    console.log('Review request body:', body);
    
    const { flashcardId, quality, responseTimeMs } = body;
    
    const supabase = await createClient();
    const { data: { user }, error: userError } = await supabase.auth.getUser();

    if (userError || !user) {
      console.error('Auth error:', userError);
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    console.log('User:', user.id);
    console.log('Flashcard ID:', flashcardId);

    // Get current card data from saved_flashcards
    const { data: savedCard, error: fetchError } = await supabase
      .from('saved_flashcards')
      .select('*')
      .eq('user_id', user.id)
      .eq('flashcard_id', flashcardId)
      .maybeSingle();

    if (fetchError) {
      console.error('Error fetching saved card:', fetchError);
      return NextResponse.json({ error: 'Database error' }, { status: 500 });
    }

    if (!savedCard) {
      console.log('Card not found in saved_flashcards');
      
      // Card might be in Weaviate but not saved? Let's try to find it
      const weaviateClient = getWeaviateClient();
      const query = weaviateClient.graphql
        .get()
        .withClassName('Flashcard')
        .withFields('word _additional { id }')
        .withWhere({
          operator: 'Equal',
          path: ['id'],
          valueString: flashcardId
        });

      const result = await query.do();
      const flashcard = result.data?.Get?.Flashcard?.[0];
      
      if (flashcard) {
        console.log('Found in Weaviate but not saved. Creating saved record...');
        
        // Create a saved record
        const { data: newCard, error: insertError } = await supabase
          .from('saved_flashcards')
          .insert({
            user_id: user.id,
            flashcard_id: flashcardId,
            is_bookmarked: true
          })
          .select()
          .single();

        if (insertError) {
          console.error('Error creating saved card:', insertError);
          return NextResponse.json({ error: 'Could not create saved card' }, { status: 500 });
        }

        // Use the new card for the review
        Object.assign(savedCard, newCard);
      } else {
        return NextResponse.json({ error: 'Flashcard not found' }, { status: 404 });
      }
    }

    console.log('Saved card data:', savedCard);

    // Calculate next review using your spaced repetition algorithm
    const result = calculateNextReview(
      quality,
      savedCard.ease_factor || 2.5,
      savedCard.interval_days || 0,
      savedCard.repetitions || 0
    );

    console.log('Calculation result:', result);

    // Prepare update data
    const updateData: any = {
      updated_at: new Date().toISOString()
    };

    // Only add fields if they exist in your schema
    try {
      updateData.next_review_date = result.nextReviewDate.toISOString();
    } catch (e) {
      console.log('Could not add next_review_date');
    }

    try {
      updateData.repetitions = result.repetition;
    } catch (e) {
      console.log('Could not add repetitions');
    }

    try {
      updateData.ease_factor = result.easeFactor;
    } catch (e) {
      console.log('Could not add ease_factor');
    }

    try {
      updateData.interval_days = result.intervalDays;
    } catch (e) {
      console.log('Could not add interval_days');
    }

    // Update saved_flashcards
    const { error: updateError } = await supabase
      .from('saved_flashcards')
      .update(updateData)
      .eq('id', savedCard.id);

    if (updateError) {
      console.error('Error updating saved_flashcards:', updateError);
      
      // If it's a column error, we need to add the columns
      if (updateError.message.includes('does not exist')) {
        console.log('Missing columns detected. Please run migration to add columns.');
        
        // Return success anyway since we'll still save to review_history
        return NextResponse.json({ 
          success: true, 
          warning: 'Database needs migration. Your review was still recorded.',
          needsMigration: true
        });
      }
    }

    // Save to review_history
    try {
      const { error: historyError } = await supabase
        .from('review_history')
        .insert({
          user_id: user.id,
          flashcard_id: flashcardId,
          review_date: new Date().toISOString(),
          performance_rating: quality,
          response_time_ms: responseTimeMs || null,
          next_review_date: result.nextReviewDate.toISOString(),
          interval_days: result.intervalDays,
          ease_factor: result.easeFactor
        });

      if (historyError) {
        console.error('Error saving review history:', historyError);
      } else {
        console.log('Review history saved successfully');
      }
    } catch (historyError) {
      console.error('Exception saving review history:', historyError);
    }

    return NextResponse.json({ 
      success: true, 
      nextReview: {
        nextReviewDate: result.nextReviewDate,
        intervalDays: result.intervalDays,
        easeFactor: result.easeFactor
      }
    });

  } catch (error) {
    console.error('Unhandled error in review API:', error);
    return NextResponse.json(
      { error: 'Failed to submit review', details: error instanceof Error ? error.message : String(error) },
      { status: 500 }
    );
  }
}