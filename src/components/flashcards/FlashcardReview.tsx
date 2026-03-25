'use client';

import { useState, useEffect } from 'react';
import Card, { CardContent } from '../ui/Card';
import Button from '../ui/Button';

interface FlashcardReviewProps {
  flashcard: {
    word: string;
    definition: string;
    context_sentence: string;
    part_of_speech: string;
    difficulty: string;
    cefr_level: string;
  };
  onReview: (quality: 1 | 2 | 3 | 4 | 5) => void;
  onAnswerReveal?: () => void;
}

export default function FlashcardReview({ flashcard, onReview, onAnswerReveal }: FlashcardReviewProps) {
  const [showAnswer, setShowAnswer] = useState(false);

  // Reset to question side whenever the flashcard changes
  useEffect(() => {
    setShowAnswer(false);
  }, [flashcard.word]);

  const handleCardClick = () => {
    // Toggle between question and answer
    const newShowAnswer = !showAnswer;
    setShowAnswer(newShowAnswer);
    
    // If we're revealing the answer for the first time, call onAnswerReveal
    if (newShowAnswer && onAnswerReveal) {
      onAnswerReveal();
    }
  };

  const qualityButtons = [
    { 
      value: 1, 
      label: 'Again', 
      description: 'Completely forgot', 
      color: 'bg-red-500 hover:bg-red-600',
      detailed: 'Hard to remember, need to see again soon'
    },
    { 
      value: 2, 
      label: 'Hard', 
      description: 'Remembered with effort', 
      color: 'bg-orange-500 hover:bg-orange-600',
      detailed: 'Took some time but got it right'
    },
    { 
      value: 3, 
      label: 'Good', 
      description: 'Some hesitation', 
      color: 'bg-yellow-500 hover:bg-yellow-600',
      detailed: 'Knew it but not instantly'
    },
    { 
      value: 4, 
      label: 'Easy', 
      description: 'Quick recall', 
      color: 'bg-green-500 hover:bg-green-600',
      detailed: 'Remembered quickly and confidently'
    },
    { 
      value: 5, 
      label: 'Perfect', 
      description: 'Instant recall', 
      color: 'bg-blue-500 hover:bg-blue-600',
      detailed: 'Knew it immediately, no hesitation'
    },
  ];

  return (
    <div className="space-y-6">
      {/* Flashcard */}
      <Card 
        className="min-h-[300px] cursor-pointer hover:shadow-lg transition-shadow" 
        onClick={handleCardClick}
      >
        <CardContent className="flex flex-col items-center justify-center min-h-[300px] p-8">
          {!showAnswer ? (
            // Show Question
            <>
              <span className="text-sm text-gray-500 mb-4">
                {flashcard.part_of_speech} • {flashcard.difficulty} • {flashcard.cefr_level?.toUpperCase()}
              </span>
              <h2 className="text-3xl font-bold text-gray-900 mb-4 text-center">
                {flashcard.word}
              </h2>
              <p className="text-gray-600 text-center italic">
                "{flashcard.context_sentence}"
              </p>
              <p className="text-sm text-gray-400 mt-4">Click to reveal answer</p>
            </>
          ) : (
            // Show Answer
            <>
              <h3 className="text-xl font-semibold text-gray-900 mb-4">Definition</h3>
              <p className="text-gray-700 text-center mb-6">{flashcard.definition}</p>
              
              {/* Add more answer details */}
              <div className="mt-4 text-sm text-gray-600 border-t pt-4 w-full">
                <p><span className="font-medium">Part of speech:</span> {flashcard.part_of_speech}</p>
                <p><span className="font-medium">Difficulty:</span> {flashcard.difficulty}</p>
                <p><span className="font-medium">CEFR Level:</span> {flashcard.cefr_level}</p>
              </div>
              
              <p className="text-sm text-gray-400 mt-4">Click to see question</p>
            </>
          )}
        </CardContent>
      </Card>

      {/* Quality Rating Buttons - Only show when answer is revealed */}
      {showAnswer && (
        <div className="space-y-4">
          <h3 className="text-lg font-semibold text-gray-900 text-center">
            How well did you remember?
          </h3>
          <div className="grid grid-cols-5 gap-3">
            {qualityButtons.map((btn) => (
              <Button
                key={btn.value}
                onClick={() => onReview(btn.value as 1 | 2 | 3 | 4 | 5)}
                className={`${btn.color} text-white p-3 h-auto flex flex-col items-center transition-colors group relative`}
              >
                <span className="font-bold text-lg">{btn.label}</span>
                <span className="text-xs mt-1 hidden sm:block">{btn.description}</span>
                
                {/* Tooltip with detailed explanation */}
                <div className="absolute bottom-full left-1/2 transform -translate-x-1/2 mb-2 px-3 py-2 bg-gray-900 text-white text-xs rounded-lg opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap pointer-events-none z-10">
                  {btn.detailed}
                  <div className="absolute top-full left-1/2 transform -translate-x-1/2 -mt-1 border-4 border-transparent border-t-gray-900"></div>
                </div>
              </Button>
            ))}
          </div>
          
          {/* Spaced repetition explanation */}
          <div className="mt-6 p-4 bg-blue-50 rounded-lg">
            <h4 className="font-medium text-blue-800 mb-2">How your rating affects next review:</h4>
            <div className="grid grid-cols-2 md:grid-cols-5 gap-2 text-xs text-blue-700">
              <div className="text-center p-2 bg-white rounded">
                <span className="font-bold block">1 (Again)</span>
                <p>Review tomorrow • Resets progress</p>
              </div>
              <div className="text-center p-2 bg-white rounded">
                <span className="font-bold block">2 (Hard)</span>
                <p>Review tomorrow • Slight penalty</p>
              </div>
              <div className="text-center p-2 bg-white rounded">
                <span className="font-bold block">3 (Good)</span>
                <p>1d → 6d • Normal progress</p>
              </div>
              <div className="text-center p-2 bg-white rounded">
                <span className="font-bold block">4 (Easy)</span>
                <p>1d → 6d • Faster progress</p>
              </div>
              <div className="text-center p-2 bg-white rounded">
                <span className="font-bold block">5 (Perfect)</span>
                <p>1d → 6d → longer • Optimal</p>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}