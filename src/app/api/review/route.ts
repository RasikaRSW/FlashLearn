import { NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { calculateNextReview, INITIAL_EASE_FACTOR } from '@/lib/utils/spacedRepetition';

export async function POST(request: Request) {
  try {
    const { flashcardId, quality, responseTimeMs } = await request.json();

    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    // Get previous review history
    const { data: previousReviews } = await supabase
      .from('review_history')
      .select('*')
      .eq('user_id', user.id)
      .eq('flashcard_id', flashcardId)
      .order('review_date', { ascending: false })
      .limit(1);

    const lastReview = previousReviews?.[0];
    
    // Calculate next review date using spaced repetition
    const { nextReviewDate, intervalDays, easeFactor } = calculateNextReview(
      quality,
      lastReview?.ease_factor || INITIAL_EASE_FACTOR,
      lastReview?.interval_days || 0,
      lastReview ? (lastReview.interval_days > 0 ? 1 : 0) : 0
    );

    // Save review
    const { error } = await supabase
      .from('review_history')
      .insert({
        user_id: user.id,
        flashcard_id: flashcardId,
        performance_rating: quality,
        response_time_ms: responseTimeMs,
        next_review_date: nextReviewDate.toISOString(),
        interval_days: intervalDays,
        ease_factor: easeFactor,
      });

    if (error) throw error;

    return NextResponse.json({ 
      success: true,
      nextReviewDate: nextReviewDate.toISOString(),
    });
  } catch (error) {
    console.error('Error saving review:', error);
    return NextResponse.json(
      { error: 'Failed to save review' },
      { status: 500 }
    );
  }
}