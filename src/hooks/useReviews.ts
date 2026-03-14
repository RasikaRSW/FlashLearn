import { useState, useEffect } from 'react';
import { DueReview } from '@/types';
import { useAuth } from './useAuth';

export function useReviews() {
  const [dueReviews, setDueReviews] = useState<DueReview[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const { user } = useAuth();

  useEffect(() => {
    if (!user) {
      setDueReviews([]);
      setLoading(false);
      return;
    }

    const fetchDueReviews = async () => {
      try {
        setLoading(true);
        const response = await fetch('/api/review/due');
        if (!response.ok) throw new Error('Failed to fetch due reviews');
        const data = await response.json();
        setDueReviews(data.reviews || []);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'An error occurred');
      } finally {
        setLoading(false);
      }
    };

    fetchDueReviews();
  }, [user]);

  const submitReview = async (flashcardId: string, quality: 1 | 2 | 3 | 4 | 5) => {
    try {
      const response = await fetch('/api/review', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          flashcardId,
          quality,
          responseTimeMs: 0, // You can track actual response time
        }),
      });

      if (!response.ok) throw new Error('Failed to submit review');
      
      // Remove reviewed card from due reviews
      setDueReviews(prev => prev.filter(r => r.flashcard.id !== flashcardId));
      
      return await response.json();
    } catch (err) {
      throw err;
    }
  };

  return {
    dueReviews,
    loading,
    error,
    submitReview,
    reviewCount: dueReviews.length,
  };
}