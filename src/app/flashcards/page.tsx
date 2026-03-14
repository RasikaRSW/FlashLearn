'use client';

import { useState, useMemo } from 'react'; // Add useMemo
import { useSearchParams } from 'next/navigation';
import { useFlashcards } from '@/hooks/useFlashcards';
import { SavedFlashcard } from '@/types';
import FlashcardList from '@/components/flashcards/FlashcardList';
import LoadingSpinner from '@/components/ui/LoadingSpinner';
import AuthGuard from '@/components/auth/AuthGuard';
import Select from '@/components/ui/Select';
import { Filter } from 'lucide-react';

export default function FlashcardsPage() {
  const searchParams = useSearchParams();
  const episodeId = searchParams.get('episode') || undefined;
  const [filter, setFilter] = useState<'all' | 'review'>('all');
  
  const { 
    flashcards, 
    reviewQueue, 
    loading, 
    error, 
    addToReviewQueue, 
    removeFromReviewQueue, 
    isInReviewQueue 
  } = useFlashcards(episodeId);

  // Recalculate status whenever reviewQueue changes
  const reviewQueueStatus = useMemo(() => {
    console.log('Recalculating reviewQueueStatus from:', reviewQueue); // Debug log
    return reviewQueue.reduce((acc: Record<string, boolean>, card: SavedFlashcard) => {
      acc[card.flashcard_id] = true;
      return acc;
    }, {});
  }, [reviewQueue]); // Re-run when reviewQueue changes

  // Also log to see what's happening
  console.log('Current reviewQueue:', reviewQueue);
  console.log('Current status map:', reviewQueueStatus);

  const filteredFlashcards = filter === 'review'
    ? flashcards.filter(card => {
        const cardId = card._additional?.id || card.id;
        return reviewQueueStatus[cardId];
      })
    : flashcards;

  if (loading) {
    return (
      <AuthGuard>
        <div className="flex justify-center py-12">
          <LoadingSpinner size="lg" />
        </div>
      </AuthGuard>
    );
  }

  return (
    <AuthGuard>
      <div className="space-y-8">
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Flashcards</h1>
            <p className="text-gray-600 mt-2">
              {filteredFlashcards.length} flashcards found
            </p>
          </div>
          
          <div className="flex items-center space-x-2">
            <Filter className="h-5 w-5 text-gray-500" />
            <Select
              value={filter}
              onChange={(e) => setFilter(e.target.value as 'all' | 'review')}
              className="w-40"
            >
              <option value="all">All Cards</option>
              <option value="review">Review Queue</option>
            </Select>
          </div>
        </div>

        {error && (
          <div className="p-4 bg-red-50 text-red-600 rounded-lg">
            {error}
          </div>
        )}

        {filteredFlashcards.length === 0 ? (
          <div className="text-center py-12">
            <p className="text-gray-500">
              {filter === 'review'
                ? "Your review queue is empty. Add some flashcards to review!"
                : 'No flashcards found for this episode.'}
            </p>
          </div>
        ) : (
          <FlashcardList
            flashcards={filteredFlashcards}
            reviewQueueStatus={reviewQueueStatus}
            onAddToReview={addToReviewQueue}
            onRemoveFromReview={removeFromReviewQueue}
          />
        )}
      </div>
    </AuthGuard>
  );
}