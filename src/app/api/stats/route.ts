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

    const weaviateClient = getWeaviateClient();

    // Get total flashcards count from Weaviate (for the user's saved cards)
    const savedFlashcardsQuery = await supabase
      .from('saved_flashcards')
      .select('flashcard_id')
      .eq('user_id', user.id);

    const savedFlashcardIds = savedFlashcardsQuery.data?.map(c => c.flashcard_id) || [];
    
    // Get flashcards count per difficulty from Weaviate
    let difficultyCounts = {
      beginner: 0,
      intermediate: 0,
      advanced: 0
    };

    if (savedFlashcardIds.length > 0) {
      // Fetch flashcards from Weaviate to get difficulty levels
      const flashcardsQuery = weaviateClient.graphql
        .get()
        .withClassName('Flashcard')
        .withFields('difficulty _additional { id }')
        .withWhere({
          operator: 'ContainsAny',
          path: ['_additional.id'],
          valueTextArray: savedFlashcardIds
        });

      const result = await flashcardsQuery.do();
      const flashcards = result.data.Get.Flashcard || [];
      
      // Count by difficulty
      difficultyCounts = flashcards.reduce((acc: any, card: any) => {
        const difficulty = card.difficulty?.toLowerCase() || 'beginner';
        if (difficulty === 'beginner' || difficulty === 'a1' || difficulty === 'a2') {
          acc.beginner++;
        } else if (difficulty === 'intermediate' || difficulty === 'b1' || difficulty === 'b2') {
          acc.intermediate++;
        } else if (difficulty === 'advanced' || difficulty === 'c1' || difficulty === 'c2') {
          acc.advanced++;
        }
        return acc;
      }, { beginner: 0, intermediate: 0, advanced: 0 });
    }

    // Get recent activity (last 7 days)
    const sevenDaysAgo = new Date();
    sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);

    const { data: recentActivity } = await supabase
      .from('saved_flashcards')
      .select('created_at')
      .eq('user_id', user.id)
      .gte('created_at', sevenDaysAgo.toISOString())
      .order('created_at', { ascending: false });

    // Get study streak (consecutive days with activity)
    const { data: allActivity } = await supabase
      .from('saved_flashcards')
      .select('created_at')
      .eq('user_id', user.id)
      .order('created_at', { ascending: false });

    let currentStreak = 0;
    if (allActivity && allActivity.length > 0) {
      // Calculate streak logic here
      const activityDates = allActivity.map(a => 
        new Date(a.created_at).toDateString()
      );
      
      const uniqueDates = [...new Set(activityDates)];
      const today = new Date().toDateString();
      const yesterday = new Date(Date.now() - 86400000).toDateString();
      
      if (uniqueDates.includes(today) || uniqueDates.includes(yesterday)) {
        currentStreak = 1;
        // Add more sophisticated streak calculation if needed
      }
    }

    const stats = {
      totalFlashcards: savedFlashcardIds.length,
      savedFlashcards: savedFlashcardIds.length,
      studyStreak: currentStreak,
      recentActivity: recentActivity?.length || 0,
      difficultyDistribution: difficultyCounts,
      recentSessions: recentActivity || []
    };

    return NextResponse.json(stats);
  } catch (error) {
    console.error('Error fetching stats:', error);
    return NextResponse.json(
      { error: 'Failed to fetch stats' },
      { status: 500 }
    );
  }
}