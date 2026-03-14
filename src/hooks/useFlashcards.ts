import { useState, useEffect } from 'react';
import { Flashcard, SavedFlashcard } from '@/types';
import { useAuth } from './useAuth';

export function useFlashcards(episodeId?: string) {
  const [flashcards, setFlashcards] = useState<Flashcard[]>([]); // All flashcards (never deleted)
  const [reviewQueue, setReviewQueue] = useState<SavedFlashcard[]>([]); // Only flashcards marked for review
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const { user } = useAuth();

  useEffect(() => {
    if (!user) {
      setFlashcards([]);
      setReviewQueue([]);
      setLoading(false);
      return;
    }

    const fetchFlashcards = async () => {
      try {
        setLoading(true);
        
        // 1. Fetch ALL flashcards from Weaviate (these never get deleted)
        let url = '/api/flashcards';
        if (episodeId) {
          url += `?episodeId=${episodeId}`;
        }

        const response = await fetch(url);
        if (!response.ok) throw new Error('Failed to fetch flashcards');
        const data = await response.json();
        setFlashcards(data.flashcards);

        // 2. Fetch user's review queue (saved flashcards)
        const reviewResponse = await fetch('/api/flashcards/review-queue');
        if (reviewResponse.ok) {
          const reviewData = await reviewResponse.json();
          setReviewQueue(reviewData.reviewQueue);
        }
      } catch (err) {
        setError(err instanceof Error ? err.message : 'An error occurred');
      } finally {
        setLoading(false);
      }
    };

    fetchFlashcards();
  }, [user, episodeId]);

  // Add flashcard to review queue
  const addToReviewQueue = async (
  flashcardId: string,
  personalNotes?: string,
  difficultyRating?: 'easy' | 'medium' | 'hard'
) => {
  try {
    console.log('Adding to review queue:', flashcardId); // Debug log
    
    const response = await fetch('/api/flashcards/review-queue', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        flashcardId,
        personalNotes,
        difficultyRating,
      }),
    });

    const data = await response.json();
    console.log('Add to review response:', data); // Debug log

    if (!response.ok) {
      if (response.status === 400 && data.error === 'Flashcard already in review queue') {
        console.log('Flashcard already in queue, updating UI state');
        setReviewQueue(prev => {
          const exists = prev.some(card => card.flashcard_id === flashcardId);
          if (!exists) {
            const mockEntry = {
              id: `temp-${Date.now()}`,
              user_id: user?.id || '',
              flashcard_id: flashcardId,
              personal_notes: personalNotes,
              difficulty_rating: difficultyRating,
              is_bookmarked: true,
              created_at: new Date().toISOString(),
            } as SavedFlashcard;
            const newQueue = [...prev, mockEntry];
            console.log('Updated review queue (from 400):', newQueue);
            return newQueue;
          }
          return prev;
        });
        return;
      }
      throw new Error(data.error || 'Failed to add to review queue');
    }

    // Success case
    setReviewQueue(prev => {
      const newQueue = [...prev, data.savedFlashcard];
      console.log('Updated review queue (success):', newQueue);
      return newQueue;
    });
    return data.savedFlashcard;
  } catch (err) {
    console.error('Error in addToReviewQueue:', err);
    throw err;
  }
};

  // Remove flashcard from review queue
  const removeFromReviewQueue = async (flashcardId: string) => {
  try {
    console.log('removeFromReviewQueue called with:', {
      flashcardId,
      type: typeof flashcardId,
      value: flashcardId
    });
    
    // Check what's in the current reviewQueue
    console.log('Current reviewQueue:', reviewQueue);
    console.log('Looking for card with flashcard_id:', flashcardId);
    
    const cardToRemove = reviewQueue.find(card => {
      console.log('Comparing:', {
        cardFlashcardId: card.flashcard_id,
        inputFlashcardId: flashcardId,
        match: card.flashcard_id === flashcardId
      });
      return card.flashcard_id === flashcardId;
    });
    
    console.log('Card to remove found:', cardToRemove);
    
    if (!cardToRemove) {
      console.log('No card found in reviewQueue with that ID');
    }
    
    const response = await fetch(`/api/flashcards/review-queue/${flashcardId}`, {
      method: 'DELETE',
      headers: {
        'Content-Type': 'application/json',
      },
    });

    const data = await response.json();
    console.log('Remove from review response:', data);

    if (!response.ok) {
      throw new Error(data.error || 'Failed to remove from review queue');
    }

    setReviewQueue(prev => {
      const newQueue = prev.filter(card => card.flashcard_id !== flashcardId);
      console.log('Updated review queue:', newQueue);
      return newQueue;
    });

    return data;
  } catch (err) {
    console.error('Error in removeFromReviewQueue:', err);
    throw err;
  }
};

  // Check if a flashcard is in the review queue
  const isInReviewQueue = (flashcardId: string) => {
    return reviewQueue.some(card => card.flashcard_id === flashcardId);
  };

  return {
    flashcards, // All flashcards (never changes except on new generation)
    reviewQueue, // Only flashcards marked for review
    loading,
    error,
    addToReviewQueue,
    removeFromReviewQueue,
    isInReviewQueue,
  };
}