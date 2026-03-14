// User Types
export type User = {
  id: string;
  email: string;
  name?: string;
  avatar_url?: string;
  created_at: string;
  english_level: EnglishLevel;
  settings: UserSettings;
};

export type EnglishLevel = 'A1' | 'A2' | 'B1' | 'B2' | 'C1' | 'C2';

export type UserSettings = {
  daily_review_goal: number;
  notifications_enabled: boolean;
  theme: 'light' | 'dark';
};

// Show Types
export type Show = {
  id: string;
  title: string;
  description: string;
  cover_image: string;
  genre: string[];
  year: number;
  type: 'tv_show' | 'movie';
  total_seasons?: number;
  total_episodes?: number;
  created_at: string;
  _additional?: {
    id: string;
  };
};

export type Episode = {
  id: string;
  show_id: string;
  season_number: number;
  episode_number: number;
  title: string;
  description: string;
  subtitle_content: string;
  duration: number;
  air_date: string;
  created_at: string;
  _additional?: {
    id: string;
  };
};

// Flashcard Types
export type Flashcard = {
  id: string;
  episode_id: string;
  word: string;
  context_sentence: string;
  definition: string;
  part_of_speech: string;
  synonyms: string[];
  antonyms: string[];
  examples: string[];
  cefr_level: EnglishLevel;
  difficulty: 'easy' | 'medium' | 'hard';
  created_at: string;
  _additional?: {
    id: string;
  };
};

export type SavedFlashcard = {
  id: string;
  user_id: string;
  flashcard_id: string;
  personal_notes?: string;
  difficulty_rating?: 'easy' | 'medium' | 'hard';
  is_bookmarked: boolean;
  created_at: string;
};

export type ReviewHistory = {
  id: string;
  user_id: string;
  flashcard_id: string;
  review_date: string;
  performance_rating: 1 | 2 | 3 | 4 | 5; // 1=worst, 5=best
  response_time_ms: number;
  next_review_date: string;
  interval_days: number;
  ease_factor: number;
};

export type DueReview = {
  flashcard: Flashcard;
  saved_flashcard: SavedFlashcard;
  review_history?: ReviewHistory;
  next_review_date: string;
};

// API Types
export type GenerateFlashcardsRequest = {
  episodeId: string;
  userLevel: EnglishLevel;
  count?: number;
};

export type GenerateFlashcardsResponse = {
  flashcards: Flashcard[];
};

export type SaveFlashcardRequest = {
  flashcardId: string;
  personalNotes?: string;
  difficultyRating?: 'easy' | 'medium' | 'hard';
};

export type ReviewFlashcardRequest = {
  flashcardId: string;
  performanceRating: 1 | 2 | 3 | 4 | 5;
  responseTimeMs: number;
};