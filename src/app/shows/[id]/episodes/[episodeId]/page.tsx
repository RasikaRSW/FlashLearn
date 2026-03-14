import { notFound } from 'next/navigation';
import { getWeaviateClient } from '@/lib/weaviate/client';
import { getEpisode } from '@/lib/weaviate/queries';
import FlashcardGenerator from '@/components/flashcards/FlashcardGenerator';
import Card, { CardContent } from '@/components/ui/Card';
import { Calendar, Clock } from 'lucide-react';
import AuthGuard from '@/components/auth/AuthGuard';

interface EpisodePageProps {
  params: {
    id: string;
    episodeId: string;
  };
}

export default async function EpisodePage({ 
  params 
}: { 
  params: Promise<{ id: string; episodeId: string }> 
}) {
  const { id, episodeId } = await params;
  
  const episode = await getEpisode(episodeId)
  if (!episode) {
    notFound();
  }

  return (
    <AuthGuard>
      <div className="max-w-4xl mx-auto space-y-8">
        {/* Episode Header */}
        <div>
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            {episode.title}
          </h1>
          <div className="flex items-center space-x-4 text-gray-600">
            <span>Season {episode.season_number}, Episode {episode.episode_number}</span>
            <span>•</span>
            <div className="flex items-center">
              <Clock className="w-4 h-4 mr-1" />
              <span>{episode.duration} min</span>
            </div>
            <span>•</span>
            <div className="flex items-center">
              <Calendar className="w-4 h-4 mr-1" />
              <span>{new Date(episode.air_date).toLocaleDateString()}</span>
            </div>
          </div>
        </div>

        {/* Episode Description */}
        <Card>
          <CardContent className="pt-6">
            <h2 className="text-lg font-semibold text-gray-900 mb-2">About this episode</h2>
            <p className="text-gray-700">{episode.description}</p>
          </CardContent>
        </Card>

        {/* Flashcard Generator */}
        <FlashcardGenerator
          episodeId={episodeId}
          episodeTitle={episode.title}
        />

        {/* Subtitle Preview */}
        <Card>
          <CardContent className="pt-6">
            <h2 className="text-lg font-semibold text-gray-900 mb-2">Subtitle Preview</h2>
            <div className="bg-gray-50 rounded-lg p-4 max-h-60 overflow-y-auto">
              <p className="text-gray-700 whitespace-pre-line">
                {episode.subtitle_content.slice(0, 1000)}
                {episode.subtitle_content.length > 1000 && '...'}
              </p>
            </div>
          </CardContent>
        </Card>
      </div>
    </AuthGuard>
  );
}