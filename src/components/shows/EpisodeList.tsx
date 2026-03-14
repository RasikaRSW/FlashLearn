'use client';

import { useState } from 'react';
import Link from 'next/link';
import { Episode } from '@/types';
import Button from '@/components/ui/Button';
import { ChevronDown, ChevronUp, Play, Sparkles } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

interface EpisodeListProps {
  episodes: Episode[];
  showId: string;
}

export default function EpisodeList({ episodes, showId }: EpisodeListProps) {
  const [expandedSeason, setExpandedSeason] = useState<number | null>(1);

  const episodesBySeason = episodes.reduce((acc, episode) => {
    const season = episode.season_number;
    if (!acc[season]) acc[season] = [];
    acc[season].push(episode);
    return acc;
  }, {} as Record<number, Episode[]>);

  const seasons = Object.keys(episodesBySeason).map(Number).sort((a, b) => a - b);

  if (episodes.length === 0) {
    return (
      <div className="text-center py-12 bg-white rounded-3xl border-2 border-dashed border-slate-300">
        <p className="text-slate-500 font-medium">No episodes found yet.</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <h2 className="text-3xl font-extrabold text-slate-800 flex items-center gap-2">
        <Sparkles className="text-amber-400" /> Episodes
      </h2>
      
      {seasons.map((season) => (
        <div key={`season-${season}`} className="bg-white rounded-3xl border-2 border-slate-100 overflow-hidden soft-shadow">
          <button
            onClick={() => setExpandedSeason(expandedSeason === season ? null : season)}
            className="w-full px-6 py-5 flex items-center justify-between bg-slate-50 hover:bg-indigo-50 transition-colors"
          >
            <div className="flex items-center gap-3">
              <span className="bg-white px-4 py-2 rounded-xl font-extrabold text-indigo-600 border-2 border-indigo-100">
                S{season}
              </span>
              <span className="font-bold text-slate-700">
                {episodesBySeason[season].length} Episodes
              </span>
            </div>
            {expandedSeason === season ? (
              <ChevronUp className="h-6 w-6 text-slate-400" />
            ) : (
              <ChevronDown className="h-6 w-6 text-slate-400" />
            )}
          </button>

          <AnimatePresence>
            {expandedSeason === season && (
              <motion.div
                initial={{ height: 0, opacity: 0 }}
                animate={{ height: 'auto', opacity: 1 }}
                exit={{ height: 0, opacity: 0 }}
                className="divide-y divide-slate-100"
              >
                {episodesBySeason[season]
                  .sort((a, b) => a.episode_number - b.episode_number)
                  .map((episode) => (
                    <div key={episode._additional?.id} className="p-6 hover:bg-slate-50 transition-colors flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                      <div className="flex-1">
                        <div className="flex items-center gap-3 mb-1">
                          <span className="text-xs font-bold text-indigo-500 bg-indigo-50 px-2 py-1 rounded-md">
                            EP {episode.episode_number}
                          </span>
                          <span className="text-xs text-slate-400 font-medium">{episode.duration} min</span>
                        </div>
                        <h4 className="text-lg font-bold text-slate-800 mb-1">
                          {episode.title}
                        </h4>
                        <p className="text-slate-500 text-sm line-clamp-1">
                          {episode.description}
                        </p>
                      </div>
                      
                      <Link href={`/shows/${showId}/episodes/${episode._additional?.id}`}>
                        <Button size="sm" variant="outline" className="whitespace-nowrap">
                          <Play className="h-4 w-4 mr-2 fill-current" />
                          Study This
                        </Button>
                      </Link>
                    </div>
                  ))}
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      ))}
    </div>
  );
}