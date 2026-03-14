import { EnglishLevel } from '@/types';

export const CEFR_LEVELS: EnglishLevel[] = ['A1', 'A2', 'B1', 'B2', 'C1', 'C2'];

export const CEFR_DESCRIPTIONS: Record<EnglishLevel, string> = {
  A1: 'Beginner: Can understand and use familiar everyday expressions',
  A2: 'Elementary: Can communicate in simple and routine tasks',
  B1: 'Intermediate: Can deal with most situations while traveling',
  B2: 'Upper Intermediate: Can interact with a degree of fluency',
  C1: 'Advanced: Can express ideas fluently and spontaneously',
  C2: 'Proficient: Can understand virtually everything heard or read',
};

export const DIFFICULTY_COLORS = {
  easy: 'bg-green-100 text-green-800',
  medium: 'bg-yellow-100 text-yellow-800',
  hard: 'bg-red-100 text-red-800',
};

export const PERFORMANCE_LABELS: Record<number, string> = {
  1: 'Very Hard - Could not remember',
  2: 'Hard - Remembered with difficulty',
  3: 'Medium - Remembered but hesitant',
  4: 'Easy - Remembered quickly',
  5: 'Very Easy - Perfect recall',
};

// Spaced Repetition Constants - MAKE SURE THESE ARE EXPORTED
export const INITIAL_EASE_FACTOR = 2.5;
export const MINIMUM_EASE_FACTOR = 1.3;
export const REVIEW_INTERVALS = [1, 3, 7, 14, 30, 60, 120]; // days