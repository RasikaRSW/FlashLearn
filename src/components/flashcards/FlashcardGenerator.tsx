'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { EnglishLevel } from '@/types';
import Card, { CardContent, CardHeader } from '@/components/ui/Card';
import Button from '@/components/ui/Button';
import Select from '@/components/ui/Select';
import { Loader2, Wand2 } from 'lucide-react';

interface FlashcardGeneratorProps {
  episodeId: string;
  episodeTitle: string;
}

export default function FlashcardGenerator({ episodeId, episodeTitle }: FlashcardGeneratorProps) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [userLevel, setUserLevel] = useState<EnglishLevel>('B1');
  const [count, setCount] = useState(10);
  const [error, setError] = useState<string | null>(null);

  const handleGenerate = async () => {
    setLoading(true);
    setError(null);

    try {
      const response = await fetch('/api/generate-flashcards', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          episodeId,
          userLevel,
          count,
        }),
      });

      if (!response.ok) {
        throw new Error('Failed to generate flashcards');
      }

      const data = await response.json();
      router.push(`/flashcards?episode=${episodeId}`);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Card variant="doodle">
      <CardHeader className="bg-indigo-50 border-b-2 border-indigo-100">
        <div className="flex items-center gap-2 mb-2">
          <Wand2 className="text-indigo-500" />
          <h3 className="text-lg font-semibold">Generate Flashcards</h3>
        </div>
        <p className="text-sm text-slate-600">
          Create custom flashcards from "{episodeTitle}" based on your level
        </p>
      </CardHeader>
      <CardContent className="space-y-4">
        <Select
          label="Your English Level"
          value={userLevel}
          onChange={(e) => setUserLevel(e.target.value as EnglishLevel)}
        >
          <option value="A1">A1 - Beginner</option>
          <option value="A2">A2 - Elementary</option>
          <option value="B1">B1 - Intermediate</option>
          <option value="B2">B2 - Upper Intermediate</option>
          <option value="C1">C1 - Advanced</option>
          <option value="C2">C2 - Proficient</option>
        </Select>

        <Select
          label="Number of Flashcards"
          value={count.toString()}
          onChange={(e) => setCount(parseInt(e.target.value))}
        >
          <option value="5">5 cards</option>
          <option value="10">10 cards</option>
          <option value="15">15 cards</option>
          <option value="20">20 cards</option>
        </Select>

        {error && (
          <div className="p-3 bg-red-50 text-red-600 rounded-lg text-sm border border-red-100">
            {error}
          </div>
        )}

        <Button
          onClick={handleGenerate}
          disabled={loading}
          className="w-full"
        >
          {loading ? (
            <>
              <Loader2 className="w-4 h-4 mr-2 animate-spin" />
              Generating Flashcards...
            </>
          ) : (
            <>
              <Wand2 className="w-4 h-4 mr-2" />
              Generate Flashcards
            </>
          )}
        </Button>
      </CardContent>
    </Card>
  );
}