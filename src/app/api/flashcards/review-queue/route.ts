import { NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';

export async function GET() {
  try {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    const { data: reviewQueue, error } = await supabase
      .from('saved_flashcards')
      .select('*')
      .eq('user_id', user.id);

    if (error) throw error;

    return NextResponse.json({ reviewQueue });
  } catch (error) {
    console.error('Error fetching review queue:', error);
    return NextResponse.json(
      { error: 'Failed to fetch review queue' },
      { status: 500 }
    );
  }
}

export async function POST(request: Request) {
  try {
    const { flashcardId, personalNotes, difficultyRating } = await request.json();

    if (!flashcardId) {
      return NextResponse.json(
        { error: 'Flashcard ID is required' },
        { status: 400 }
      );
    }

    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    // Check if already in review queue
    const { data: existing, error: checkError } = await supabase
      .from('saved_flashcards')
      .select('id')
      .eq('user_id', user.id)
      .eq('flashcard_id', flashcardId)
      .maybeSingle(); // Use maybeSingle instead of single to avoid errors

    if (checkError) {
      console.error('Error checking existing:', checkError);
      throw checkError;
    }

    if (existing) {
      return NextResponse.json(
        { error: 'Flashcard already in review queue', alreadyExists: true },
        { status: 400 }
      );
    }

    // Add to review queue
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
    console.error('Error adding to review queue:', error);
    return NextResponse.json(
      { error: 'Failed to add to review queue' },
      { status: 500 }
    );
  }
}