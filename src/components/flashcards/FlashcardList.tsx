'use client';

import { Flashcard as FlashcardType } from '@/types';
import Flashcard from './Flashcard';

interface FlashcardListProps {
  flashcards: FlashcardType[];
  reviewQueueStatus: Record<string, boolean>;
  onAddToReview: (flashcardId: string, notes?: string, difficulty?: 'easy' | 'medium' | 'hard') => Promise<void>;
  onRemoveFromReview?: (flashcardId: string) => Promise<void>;
  // savedStatus: Record<string, boolean>;
  // onSave: (flashcardId: string, notes?: string, difficulty?: 'easy' | 'medium' | 'hard') => Promise<void>;
  // onUnsave?: (flashcardId: string) => Promise<void>; 
}

export default function FlashcardList({ flashcards, reviewQueueStatus, 
  onAddToReview,
  onRemoveFromReview  }: FlashcardListProps) {
  if (flashcards.length === 0) {
    return (
      <div className="text-center py-12 bg-white rounded-3xl border-2 border-dashed border-slate-300">
        <p className="text-slate-500 font-medium">No flashcards to display.</p>
      </div>
    );
  }

  return (
   
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
      {flashcards.map((flashcard) => (
        <Flashcard
          key={flashcard.id}
          flashcard={flashcard}
          isInReviewQueue={reviewQueueStatus[flashcard.id]}
          onAddToReview={() => onAddToReview(flashcard.id)}
          onRemoveFromReview={onRemoveFromReview ? () => onRemoveFromReview(flashcard.id) : undefined}
        />
      ))}
    </div>
  );
}