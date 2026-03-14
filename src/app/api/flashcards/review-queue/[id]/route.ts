import { NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';

export async function DELETE(
  request: Request,
  { params }: { params: Promise<{ id: string }> | { id: string } }
) {
  try {
    // Handle both Promise and direct params (Next.js 15+ vs older versions)
    const resolvedParams = await params;
    const flashcardId = resolvedParams.id;
    
    console.log('DELETE route - received flashcard_id:', flashcardId);
    console.log('DELETE route - params:', resolvedParams);

    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    console.log('DELETE route - user:', user.id);
    console.log('DELETE route - attempting to delete flashcard_id:', flashcardId);

    // Delete using the flashcard_id column
    const { data, error } = await supabase
      .from('saved_flashcards')
      .delete()
      .eq('user_id', user.id)
      .eq('flashcard_id', flashcardId)
      .select();

    if (error) {
      console.error('DELETE route - Supabase error:', error);
      throw error;
    }

    console.log('DELETE route - delete result:', data);

    if (!data || data.length === 0) {
      return NextResponse.json(
        { error: 'No record found to delete' },
        { status: 404 }
      );
    }

    return NextResponse.json({ 
      success: true, 
      deleted: data 
    });
  } catch (error) {
    console.error('DELETE route - error:', error);
    return NextResponse.json(
      { error: 'Failed to remove from review queue' },
      { status: 500 }
    );
  }
}