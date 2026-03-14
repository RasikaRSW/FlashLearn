import { MINIMUM_EASE_FACTOR, REVIEW_INTERVALS } from './constants';

export interface ReviewResult {
  nextReviewDate: Date;
  intervalDays: number;
  easeFactor: number;
  repetition: number; 
}

export const INITIAL_EASE_FACTOR = 2.5;  // Make sure this is exported

export function calculateNextReview(
  quality: 1 | 2 | 3 | 4 | 5,
  currentEaseFactor: number = INITIAL_EASE_FACTOR,
  currentInterval: number = 0,
  repetitions: number = 0
): ReviewResult {
  let easeFactor = currentEaseFactor;
  let interval = currentInterval;
  let repetition = repetitions;

  // Calculate new ease factor
  easeFactor = Math.max(
    MINIMUM_EASE_FACTOR,
    currentEaseFactor + (0.1 - (5 - quality) * (0.08 + (5 - quality) * 0.02))
  );

  // Calculate new interval based on performance
  if (quality < 3) {
    // If quality is less than 3, reset repetitions
    repetition = 0;
    interval = 1;
  } else {
    repetition++;
    
    if (repetition === 1) {
      interval = 1;
    } else if (repetition === 2) {
      interval = 6;
    } else {
      interval = Math.round(currentInterval * easeFactor);
    }
    
    // Cap interval to maximum
    interval = Math.min(interval, REVIEW_INTERVALS[REVIEW_INTERVALS.length - 1]);
  }

  const nextReviewDate = new Date();
  nextReviewDate.setDate(nextReviewDate.getDate() + interval);

  return {
    nextReviewDate,
    intervalDays: interval,
    easeFactor,
    repetition,  // Make sure this is returned
  };
}

export function getDueReviews(flashcards: any[]): any[] {
  const now = new Date();
  return flashcards.filter(card => {
    const nextReview = card.next_review_date ? new Date(card.next_review_date) : null;
    return !nextReview || nextReview <= now;
  });
}