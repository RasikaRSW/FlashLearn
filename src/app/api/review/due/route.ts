import { NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { getWeaviateClient } from '@/lib/weaviate/client';

export async function GET(request: Request) {
  try {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    // Get all saved flashcards for user
    const { data: savedCards, error: savedError } = await supabase
      .from('saved_flashcards')
      .select('flashcard_id, created_at')
      .eq('user_id', user.id);

    if (savedError) throw savedError;

    if (!savedCards || savedCards.length === 0) {
      return NextResponse.json({ reviews: [] });
    }

    // Get latest review for each flashcard
    const flashcardIds = savedCards.map(c => c.flashcard_id);
    
    const { data: latestReviews, error: reviewError } = await supabase
      .from('review_history')
      .select('*')
      .in('flashcard_id', flashcardIds)
      .eq('user_id', user.id)
      .order('review_date', { ascending: false });

    if (reviewError) throw reviewError;

    // Find due reviews
    const now = new Date();
    const dueFlashcardIds = new Set();
    const reviewMap = new Map();

    // Process existing reviews
    latestReviews?.forEach(review => {
      if (!reviewMap.has(review.flashcard_id)) {
        reviewMap.set(review.flashcard_id, review);
        const nextReviewDate = new Date(review.next_review_date);
        if (nextReviewDate <= now) {
          dueFlashcardIds.add(review.flashcard_id);
        }
      }
    });

    // Cards with no review history are also due
    savedCards.forEach(card => {
      if (!reviewMap.has(card.flashcard_id)) {
        dueFlashcardIds.add(card.flashcard_id);
      }
    });

    if (dueFlashcardIds.size === 0) {
      return NextResponse.json({ reviews: [] });
    }

    // Fetch flashcard details from Weaviate
    const weaviateClient = getWeaviateClient();
    const dueIdsArray = Array.from(dueFlashcardIds);
    
    const reviews = [];
    for (const id of dueIdsArray) {
      try {
        const result = await weaviateClient.graphql
          .get()
          .withClassName('Flashcard')
          .withFields('id word context_sentence definition part_of_speech synonyms antonyms examples cefr_level difficulty created_at')
          .withWhere({
            path: ['id'],
            operator: 'Equal',
            valueString: id as string,
          })
          .withLimit(1)
          .do();
        
        const flashcard = result.data.Get.Flashcard?.[0];
        if (flashcard) {
          reviews.push({
            flashcard,
            saved_flashcard: savedCards.find(c => c.flashcard_id === id),
            review_history: reviewMap.get(id),
            next_review_date: reviewMap.get(id)?.next_review_date || new Date().toISOString(),
          });
        }
      } catch (error) {
        console.error(`Error fetching flashcard ${id}:`, error);
        // Continue with other flashcards even if one fails
      }
    }

    return NextResponse.json({ reviews });
  } catch (error) {
    console.error('Error fetching due reviews:', error);
    return NextResponse.json(
      { error: 'Failed to fetch due reviews' },
      { status: 500 }
    );
  }
}