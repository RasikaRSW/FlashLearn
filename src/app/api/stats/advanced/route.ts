import { NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { getWeaviateClient } from '@/lib/weaviate/client';

export async function GET(request: Request) {
  try {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Get all saved flashcards
    const { data: savedCards } = await supabase
      .from('saved_flashcards')
      .select('*')
      .eq('user_id', user.id);

    // Get review history with flashcard details
    const { data: reviewHistory } = await supabase
      .from('review_history')
      .select(`
        *,
        saved_flashcards!inner (
          flashcard_id
        )
      `)
      .eq('user_id', user.id)
      .order('review_date', { ascending: false });

    // Get flashcards from Weaviate to get part of speech and other details
    const weaviateClient = getWeaviateClient();
    const flashcardIds = savedCards?.map(c => c.flashcard_id) || [];
    
    let flashcardsMap = new Map();
    if (flashcardIds.length > 0) {
      const query = weaviateClient.graphql
        .get()
        .withClassName('Flashcard')
        .withFields(`
          word
          part_of_speech
          difficulty
          cefr_level
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
      const flashcards = result.data?.Get?.Flashcard || [];
      flashcards.forEach((f: any) => {
        if (f._additional?.id) {
          flashcardsMap.set(f._additional.id, f);
        }
      });
    }

    // Calculate advanced stats
    const now = new Date();
    
    // 1. Card status distribution
    const cardStatus = {
      new: savedCards?.filter(c => !c.repetitions || c.repetitions === 0).length || 0,
      learning: savedCards?.filter(c => c.repetitions && c.repetitions < 3).length || 0,
      mastered: savedCards?.filter(c => c.repetitions && c.repetitions >= 3).length || 0,
    };

    // 2. Due cards with explanations
    const dueCards = savedCards?.filter(c => {
      if (!c.next_review_date) return true;
      return new Date(c.next_review_date) <= now;
    }) || [];

    const dueCardsWithInfo = dueCards.map(card => {
      const daysUntilDue = card.next_review_date 
        ? Math.ceil((new Date(card.next_review_date).getTime() - now.getTime()) / (1000 * 60 * 60 * 24))
        : 0;
      
      let reason = '';
      if (!card.next_review_date) {
        reason = 'New card - needs initial review';
      } else if (daysUntilDue <= 0) {
        reason = `Due today (last reviewed ${Math.abs(daysUntilDue)} days ago)`;
      }

      return {
        ...card,
        daysUntilDue,
        reason,
        flashcard_details: flashcardsMap.get(card.flashcard_id)
      };
    });

    // 3. Performance metrics
    const totalReviews = reviewHistory?.length || 0;
    const recentReviews = reviewHistory?.filter(r => {
      const reviewDate = new Date(r.review_date);
      const weekAgo = new Date(now.setDate(now.getDate() - 7));
      return reviewDate >= weekAgo;
    }) || [];

    const performanceByRating = {
      1: reviewHistory?.filter(r => r.performance_rating === 1).length || 0,
      2: reviewHistory?.filter(r => r.performance_rating === 2).length || 0,
      3: reviewHistory?.filter(r => r.performance_rating === 3).length || 0,
      4: reviewHistory?.filter(r => r.performance_rating === 4).length || 0,
      5: reviewHistory?.filter(r => r.performance_rating === 5).length || 0,
    };

    // 4. Average response time
    const avgResponseTime = reviewHistory?.reduce((sum, r) => 
      sum + (r.response_time_ms || 0), 0) / (totalReviews || 1);

    // 5. Performance by part of speech
    const performanceByPos = new Map();
    reviewHistory?.forEach(review => {
      const flashcard = flashcardsMap.get(review.flashcard_id);
      if (flashcard?.part_of_speech) {
        const pos = flashcard.part_of_speech;
        if (!performanceByPos.has(pos)) {
          performanceByPos.set(pos, { total: 0, sum: 0 });
        }
        const stats = performanceByPos.get(pos);
        stats.total++;
        stats.sum += review.performance_rating;
      }
    });

    const posPerformance = Array.from(performanceByPos.entries()).map(([pos, stats]) => ({
      part_of_speech: pos,
      averageRating: stats.sum / stats.total,
      reviewCount: stats.total
    }));

    // 6. Learning curve (performance over time)
    const learningCurve = reviewHistory?.slice(0, 20).map((r, index) => ({
      reviewNumber: index + 1,
      rating: r.performance_rating,
      date: r.review_date
    }));

    // 7. Retention rate (cards remembered vs forgotten)
    const retentionRate = {
      remembered: reviewHistory?.filter(r => r.performance_rating >= 3).length || 0,
      forgotten: reviewHistory?.filter(r => r.performance_rating < 3).length || 0,
    };

    // 8. Most improved cards
    const cardImprovement = new Map();
    reviewHistory?.forEach(review => {
      if (!cardImprovement.has(review.flashcard_id)) {
        cardImprovement.set(review.flashcard_id, {
          ratings: [],
          flashcard: flashcardsMap.get(review.flashcard_id)
        });
      }
      cardImprovement.get(review.flashcard_id).ratings.push(review.performance_rating);
    });

    const improvedCards = Array.from(cardImprovement.entries())
      .map(([id, data]) => ({
        flashcard_id: id,
        word: data.flashcard?.word || 'Unknown',
        firstRating: data.ratings[0] || 0,
        lastRating: data.ratings[data.ratings.length - 1] || 0,
        improvement: (data.ratings[data.ratings.length - 1] || 0) - (data.ratings[0] || 0)
      }))
      .filter(c => c.improvement > 0)
      .sort((a, b) => b.improvement - a.improvement)
      .slice(0, 5);

    // 9. Weak areas (cards with consistently low ratings)
    const weakCards = Array.from(cardImprovement.entries())
      .map(([id, data]) => ({
        flashcard_id: id,
        word: data.flashcard?.word || 'Unknown',
        avgRating: data.ratings.reduce((sum: number, r: number) => sum + r, 0) / data.ratings.length,
        reviewCount: data.ratings.length
      }))
      .filter(c => c.avgRating < 3 && c.reviewCount >= 2)
      .sort((a, b) => a.avgRating - b.avgRating)
      .slice(0, 5);

    return NextResponse.json({
      cardStatus,
      dueCards: dueCardsWithInfo,
      performanceMetrics: {
        totalReviews,
        recentReviews: recentReviews.length,
        averageRating: reviewHistory?.reduce((sum, r) => sum + r.performance_rating, 0) / (totalReviews || 1),
        averageResponseTime: avgResponseTime,
        performanceByRating,
      },
      posPerformance,
      learningCurve,
      retentionRate,
      improvedCards,
      weakCards,
      nextReviewForecast: generateReviewForecast(savedCards || [])
    });

  } catch (error) {
    console.error('Error fetching advanced stats:', error);
    return NextResponse.json(
      { error: 'Failed to fetch advanced stats' },
      { status: 500 }
    );
  }
}

function generateReviewForecast(savedCards: any[]) {
  const forecast = [];
  const now = new Date();
  
  for (let i = 0; i < 7; i++) {
    const date = new Date(now);
    date.setDate(date.getDate() + i);
    
    const cardsDue = savedCards.filter(card => {
      if (!card.next_review_date) return i === 0; // New cards due today
      const reviewDate = new Date(card.next_review_date);
      return reviewDate.toDateString() === date.toDateString();
    }).length;

    forecast.push({
      date: date.toDateString(),
      cardsDue,
      day: date.toLocaleDateString('en-US', { weekday: 'short' })
    });
  }

  return forecast;
}