'use client';

import { useState } from 'react';
import { motion } from 'framer-motion';
import { Flashcard as FlashcardType } from '@/types';
import Card, { CardContent, CardFooter, CardHeader } from '@/components/ui/Card';
import Button from '@/components/ui/Button';
import Badge from '@/components/ui/Badge';
import { Bookmark, BookOpen, ThumbsUp, ThumbsDown, Info, BookmarkX } from 'lucide-react';
import { cn } from '@/lib/utils/helpers';

interface FlashcardProps {
  flashcard: FlashcardType;
  isInReviewQueue?: boolean; // Renamed from isSaved
  onAddToReview?: () => void; // Renamed from onSave
  onRemoveFromReview?: () => void; // Renamed from onUnsave
  // isSaved?: boolean;
  // onSave?: () => void;
  // onUnsave?: () => void; // Add unsave callback
  onRate?: (difficulty: 'easy' | 'medium' | 'hard') => void;
  onReview?: (quality: 1 | 2 | 3 | 4 | 5) => void;
  showActions?: boolean;
  className?: string;
}

export default function Flashcard({
  flashcard,
  isInReviewQueue = false,  // Changed
  onAddToReview,  // Changed
  onRemoveFromReview,  // Changed
  // isSaved = false,
  // onSave,
  // onUnsave, // Add unsave prop
  onRate,
  onReview,
  showActions = true,
  className,
}: FlashcardProps) {

  const [isProcessing, setIsProcessing] = useState(false);
  const [showDefinition, setShowDefinition] = useState(false);

  const difficultyColors = {
    easy: 'bg-emerald-100 text-emerald-800 border-emerald-200',
    medium: 'bg-amber-100 text-amber-800 border-amber-200',
    hard: 'bg-rose-100 text-rose-800 border-rose-200',
  };

  const handleReviewQueueClick = async (e: React.MouseEvent) => {
    e.stopPropagation();
    if (isProcessing) return;
    
    setIsProcessing(true);
    try {
      if (isInReviewQueue && onRemoveFromReview) {
        await onRemoveFromReview();
      } else if (!isInReviewQueue && onAddToReview) {
        await onAddToReview();
      }
    } catch (error) {
      console.error('Error updating review queue:', error);
      // You could show a toast notification here
    } finally {
      setIsProcessing(false);
    }
  };

  // const handleSaveClick = (e: React.MouseEvent) => {
  //   e.stopPropagation();
  //   if (isSaved && onUnsave) {
  //     onUnsave();
  //   } else if (!isSaved && onSave) {
  //     onSave();
  //   }
  // };

  return (
    <div className={cn('perspective-1000 w-full h-80 group', className)}>
      <motion.div
        className="relative w-full h-full preserve-3d transition-all duration-500"
      >
        {/* FRONT */}
        <Card
          variant="doodle"
          className={cn('absolute w-full h-full backface-hidden flex flex-col bg-white')}
        >
          <CardHeader className="border-b-2 border-dashed border-slate-100 py-3">
            <div className="flex items-center justify-between">
              <Badge variant="secondary" className="capitalize text-xs">{flashcard.part_of_speech}</Badge>
              <div className="flex items-center space-x-2">
                <Badge className={cn('text-xs', difficultyColors[flashcard.difficulty])}>
                  {flashcard.difficulty}
                </Badge>
                { isInReviewQueue  && (
                  <Badge variant="success" className="flex items-center text-xs">
                    <Bookmark className="w-3 h-3 mr-1 fill-current" />
                    Added to Review
                  </Badge>
                )}
              </div>
            </div>
          </CardHeader>

          <CardContent className="flex-1 flex flex-col p-4">
            <h3 className="text-2xl font-bold text-center text-slate-900 mb-2">
              {flashcard.word}
            </h3>
            <p className="text-slate-600 italic text-center text-sm line-clamp-2">
              "{flashcard.context_sentence}"
            </p>
            
            {/* Show definition when toggled */}
            {showDefinition && (
              <div className="mt-3 p-3 bg-indigo-50 rounded-xl border border-indigo-100">
                <p className="text-slate-700 text-sm text-center line-clamp-3">
                  {flashcard.definition}
                </p>
              </div>
            )}
          </CardContent>

          {showActions && (
            <CardFooter className="border-t-2 border-dashed border-slate-100 pt-3 pb-3 px-4">
              <div className="flex items-center justify-between w-full">
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={(e) => {
                    e.stopPropagation();
                    setShowDefinition(!showDefinition);
                  }}
                  className="text-xs text-slate-500 hover:text-indigo-600"
                >
                  <Info className="w-4 h-4 mr-1" />
                  {showDefinition ? 'Hide' : 'Show'} Definition
                </Button>
                
                <div className="flex items-center space-x-1">
                  {/* Save/Unsave Button */}
                  {( onAddToReview || onRemoveFromReview) && (
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={handleReviewQueueClick}
                      disabled={isProcessing}
                      className={cn(
                        "transition-colors",
                        isInReviewQueue 
                          ? "text-amber-500 hover:text-amber-600 hover:bg-amber-50" 
                          : "text-slate-400 hover:text-amber-500",
                        isProcessing && "opacity-50 cursor-not-allowed"
                      )}
                    >
                      {isProcessing ? (
                        <div className="w-4 h-4 border-2 border-current border-t-transparent rounded-full animate-spin" />
                      ) : isInReviewQueue ? (
                        <>
                          <BookmarkX className="w-4 h-4" />
                          <span className="sr-only">Remove from Review</span>
                        </>
                      ) : (
                        <>
                          <Bookmark className="w-4 h-4" />
                          <span className="sr-only">Add to Review</span>
                        </>
                      )}
                    </Button>
                  )}
                  
                  {/* Rate buttons */}
                  {onRate && (
                    <>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={(e) => {
                          e.stopPropagation();
                          onRate('easy');
                        }}
                        className="text-emerald-500 hover:text-emerald-600 hover:bg-emerald-50"
                      >
                        <ThumbsUp className="w-4 h-4" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={(e) => {
                          e.stopPropagation();
                          onRate('hard');
                        }}
                        className="text-rose-500 hover:text-rose-600 hover:bg-rose-50"
                      >
                        <ThumbsDown className="w-4 h-4" />
                      </Button>
                    </>
                  )}
                  
                  {/* Review quality buttons */}
                  {onReview && (
                    <div className="flex items-center space-x-1">
                      {[1, 2, 3, 4, 5].map((quality) => (
                        <Button
                          key={quality}
                          variant="ghost"
                          size="sm"
                          onClick={(e) => {
                            e.stopPropagation();
                            onReview(quality as 1 | 2 | 3 | 4 | 5);
                          }}
                          className="w-7 h-7 p-0 text-xs font-bold hover:bg-indigo-100"
                          title={
                            quality === 1 ? 'Again - Completely forgot' :
                            quality === 2 ? 'Hard - Remembered with effort' :
                            quality === 3 ? 'Good - Some hesitation' :
                            quality === 4 ? 'Easy - Quick recall' :
                            'Perfect - Instant recall'
                          }
                        >
                          {quality}
                        </Button>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            </CardFooter>
          )}
        </Card>

        {/* BACK */}
        <Card
          variant="doodle"
          className="absolute w-full h-full backface-hidden flex flex-col bg-indigo-50 rotate-y-180"
          
        >
          <CardHeader className="border-b-2 border-indigo-100 py-3">
            <h3 className="text-lg font-semibold text-slate-900 text-center">
              {flashcard.word}
            </h3>
          </CardHeader>

          <CardContent className="flex-1 overflow-y-auto p-4 space-y-3">
            <div>
              <h4 className="font-semibold text-slate-700 mb-1 text-sm">Definition:</h4>
              <p className="text-slate-600 text-sm leading-snug">{flashcard.definition}</p>
            </div>
            
            {flashcard.synonyms.length > 0 && (
              <div>
                <h4 className="font-semibold text-slate-700 mb-1 text-sm">Synonyms:</h4>
                <div className="flex flex-wrap gap-1">
                  {flashcard.synonyms.map((synonym, index) => (
                    <Badge key={index} variant="outline" className="text-xs">{synonym}</Badge>
                  ))}
                </div>
              </div>
            )}
            
            {flashcard.antonyms.length > 0 && (
              <div>
                <h4 className="font-semibold text-slate-700 mb-1 text-sm">Antonyms:</h4>
                <div className="flex flex-wrap gap-1">
                  {flashcard.antonyms.map((antonym, index) => (
                    <Badge key={index} variant="outline" className="text-xs">{antonym}</Badge>
                  ))}
                </div>
              </div>
            )}
            
            {flashcard.examples.length > 0 && (
              <div>
                <h4 className="font-semibold text-slate-700 mb-1 text-sm">Examples:</h4>
                <ul className="list-disc list-inside space-y-1">
                  {flashcard.examples.map((example, index) => (
                    <li key={index} className="text-slate-600 text-xs leading-snug">{example}</li>
                  ))}
                </ul>
              </div>
            )}
          </CardContent>

          <CardFooter className="border-t-2 border-indigo-100 pt-3 pb-3 px-4">
            <p className="text-xs text-slate-400 text-center w-full">Click to flip back</p>
          </CardFooter>
        </Card>
      </motion.div>
    </div>
  );
}