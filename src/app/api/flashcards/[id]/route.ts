import { NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';

export async function DELETE(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const flashcardId = params.id;
    console.log('DELETE request for flashcard:', flashcardId); 

    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    console.log('User:', user.id, 'removing flashcard:', flashcardId);

    const { error, count } = await supabase
      .from('saved_flashcards')
      .delete()
      .eq('user_id', user.id)
      .eq('flashcard_id', flashcardId);

    if (error) throw error;

    
    if (error) {
      console.error('Supabase delete error:', error);
      throw error;
    }

    console.log('Delete successful, count:', count);
    
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error removing flashcard:', error);
    return NextResponse.json(
      { error: 'Failed to remove flashcard' },
      { status: 500 }
    );
  }
}

export async function PATCH(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const flashcardId = params.id;
    const { personalNotes, difficultyRating } = await request.json();

    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    const { data, error } = await supabase
      .from('saved_flashcards')
      .update({
        personal_notes: personalNotes,
        difficulty_rating: difficultyRating,
      })
      .eq('user_id', user.id)
      .eq('flashcard_id', flashcardId)
      .select()
      .single();

    if (error) throw error;

    return NextResponse.json({ savedFlashcard: data });
  } catch (error) {
    console.error('Error updating flashcard:', error);
    return NextResponse.json(
      { error: 'Failed to update flashcard' },
      { status: 500 }
    );
  }
}