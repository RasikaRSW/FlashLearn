'use client';

import { useState, useEffect, useRef } from 'react';
import { useRouter } from 'next/navigation';
import FlashcardReview from '@/components/flashcards/FlashcardReview';
import Card, { CardContent } from '@/components/ui/Card';
import Button from '@/components/ui/Button';

interface FlashcardDetails {
  word: string;
  definition: string;
  context_sentence: string;
  part_of_speech: string;
  difficulty: string;
  cefr_level: string;
}

interface ReviewCard {
  id: string;
  flashcard_id: string;
  repetitions: number;
  ease_factor: number;
  interval_days?: number;
  flashcard_details: FlashcardDetails | null;
}

export default function ReviewPage() {
  const router = useRouter();
  const [cards, setCards] = useState<ReviewCard[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [loading, setLoading] = useState(true);
  const [completed, setCompleted] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [sessionStartTime] = useState(Date.now());
  
  // Track when answer was shown to measure response time
  const [answerRevealTime, setAnswerRevealTime] = useState<number | null>(null);

  useEffect(() => {
    fetchDueCards();
  }, []);

  const fetchDueCards = async () => {
    try {
      setLoading(true);
      const response = await fetch('/api/flashcards/review');
      
      if (!response.ok) {
        throw new Error('Failed to fetch due cards');
      }
      
      const data = await response.json();
      
      if (data.needsMigration) {
        console.log(data.message);
        setCards([]);
      } else {
        setCards(data.flashcards || []);
      }
    } catch (error) {
      console.error('Error fetching due cards:', error);
      setError(error instanceof Error ? error.message : 'Failed to fetch due cards');
      setCards([]);
    } finally {
      setLoading(false);
    }
  };

  const handleAnswerReveal = () => {
    // Record when the answer was revealed (start of response time measurement)
    setAnswerRevealTime(Date.now());
  };

  const handleReview = async (quality: 1 | 2 | 3 | 4 | 5) => {
    const currentCard = cards[currentIndex];
    
    // Calculate response time (from answer reveal to rating)
    let responseTimeMs = null;
    if (answerRevealTime) {
      responseTimeMs = Date.now() - answerRevealTime;
    }
    
    try {
      const response = await fetch('/api/flashcards/review', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          flashcardId: currentCard.flashcard_id,
          quality,
          responseTimeMs
        })
      });

      if (!response.ok) {
        throw new Error('Failed to submit review');
      }

      // Log user activity
      await fetch('/api/user/activity', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          activity_type: 'flashcard_review',
          metadata: {
            flashcard_id: currentCard.flashcard_id,
            quality,
            response_time_ms: responseTimeMs
          }
        })
      }).catch(err => console.error('Failed to log activity:', err));

      // Reset answer reveal time for next card
      setAnswerRevealTime(null);

      if (currentIndex < cards.length - 1) {
        setCurrentIndex(currentIndex + 1);
      } else {
        setCompleted(true);
        
        // Log session completion
        const sessionDuration = Date.now() - sessionStartTime;
        await fetch('/api/user/activity', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            activity_type: 'review_session_complete',
            metadata: {
              total_reviewed: cards.length,
              session_duration: sessionDuration
            }
          })
        }).catch(err => console.error('Failed to log session:', err));
      }
    } catch (error) {
      console.error('Error submitting review:', error);
      setError(error instanceof Error ? error.message : 'Failed to submit review');
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-96">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="max-w-2xl mx-auto text-center py-12">
        <Card className="p-8">
          <h2 className="text-2xl font-bold text-red-600 mb-4">Error</h2>
          <p className="text-gray-600 mb-6">{error}</p>
          <Button onClick={() => router.push('/dashboard')}>
            Go to Dashboard
          </Button>
        </Card>
      </div>
    );
  }

  if (cards.length === 0 || completed) {
    return (
      <div className="max-w-2xl mx-auto text-center py-12">
        <Card className="p-8">
          <h2 className="text-2xl font-bold text-gray-900 mb-4">
            {completed ? 'Review Complete! 🎉' : 'No Cards Due'}
          </h2>
          <p className="text-gray-600 mb-6">
            {completed 
              ? `Great job! You've reviewed ${cards.length} cards.`
              : 'You have no cards due for review right now.'}
          </p>
          <div className="space-x-4">
            <Button onClick={() => router.push('/dashboard')}>
              Go to Dashboard
            </Button>
            <Button variant="outline" onClick={() => router.push('/shows')}>
              Find New Cards
            </Button>
          </div>
        </Card>
      </div>
    );
  }

  const currentCard = cards[currentIndex];
  
  if (!currentCard.flashcard_details) {
    return (
      <div className="max-w-2xl mx-auto text-center py-12">
        <Card className="p-8">
          <h2 className="text-2xl font-bold text-red-600 mb-4">Error</h2>
          <p className="text-gray-600 mb-6">Flashcard details not found</p>
          <Button onClick={() => router.push('/dashboard')}>
            Go to Dashboard
          </Button>
        </Card>
      </div>
    );
  }

  // Get card status text
  const getCardStatus = () => {
    if (currentCard.repetitions === 0) return 'New card';
    if (currentCard.repetitions === 1) return 'Learning';
    if (currentCard.repetitions === 2) return 'Building';
    return 'Reviewing';
  };

  return (
    <div className="max-w-2xl mx-auto py-8">
      {/* Enhanced header with progress bar */}
      <div className="mb-6">
        <div className="flex items-center justify-between mb-2">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Review Session</h1>
            <p className="text-sm text-gray-600">
              Card {currentIndex + 1} of {cards.length} • {getCardStatus()}
            </p>
          </div>
          <div className="text-right">
            <div className="text-sm font-medium text-gray-700">
              Progress
            </div>
            <div className="w-32 h-2 bg-gray-200 rounded-full mt-1">
              <div 
                className="h-2 bg-blue-600 rounded-full transition-all duration-300"
                style={{ width: `${((currentIndex) / cards.length) * 100}%` }}
              ></div>
            </div>
          </div>
        </div>
      </div>
      
      <FlashcardReview
        flashcard={currentCard.flashcard_details}
        onReview={handleReview}
        onAnswerReveal={handleAnswerReveal}
      />

      {/* Session summary when complete */}
      {completed && (
        <Card className="mt-8 text-center">
          <CardContent className="py-8">
            <h2 className="text-2xl font-bold text-gray-900 mb-4">Session Complete! 🎉</h2>
            <p className="text-gray-600 mb-6">
              You've reviewed {cards.length} cards. Great job!
            </p>
            <div className="grid grid-cols-2 gap-4 max-w-md mx-auto mb-6">
              <div className="bg-green-50 p-3 rounded-lg">
                <p className="text-2xl font-bold text-green-600">
                  {cards.filter(c => (c.repetitions || 0) >= 3).length}
                </p>
                <p className="text-xs text-gray-600">Mastered cards</p>
              </div>
              <div className="bg-blue-50 p-3 rounded-lg">
                <p className="text-2xl font-bold text-blue-600">
                  {cards.filter(c => (c.repetitions || 0) === 0).length}
                </p>
                <p className="text-xs text-gray-600">New cards</p>
              </div>
            </div>
            <Button onClick={() => router.push('/dashboard')}>
              Return to Dashboard
            </Button>
          </CardContent>
        </Card>
      )}
    </div>
  );
}