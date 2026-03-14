'use client';

import Link from 'next/link';
import Image from 'next/image';
import { Show } from '@/types';
import Card, { CardContent } from '@/components/ui/Card';
import Badge from '@/components/ui/Badge';
import { Film, Tv } from 'lucide-react';

interface ShowCardProps {
  show: Show;
}

export default function ShowCard({ show }: ShowCardProps) {
  // The ID comes from _additional.id in Weaviate
  const showId = show._additional?.id;
  
  console.log('Show:', show.title, 'ID:', showId); 

  console.log('Linking to:', `/shows/${showId}`);

  if (!showId) {
    console.error('Show missing ID:', show);
    return null;
  }
  return (
    <Link href={`/shows/${showId}`}>
      <Card variant="interactive" className="h-full">
        <div className="relative h-48 w-full">
          <Image
            src={show.cover_image || '/images/placeholder.jpg'}
            alt={show.title}
            fill
            unoptimized
            className="object-cover rounded-t-xl"
          />
          <div className="absolute top-2 right-2">
            <Badge variant="secondary" className="flex items-center">
              {show.type === 'tv_show' ? (
                <Tv className="w-3 h-3 mr-1" />
              ) : (
                <Film className="w-3 h-3 mr-1" />
              )}
              {show.type === 'tv_show' ? 'TV Show' : 'Movie'}
            </Badge>
          </div>
        </div>
        <CardContent className="p-4">
          <h3 className="text-lg font-semibold text-gray-900 mb-2 line-clamp-1">
            {show.title}
          </h3>
          <p className="text-sm text-gray-600 mb-3 line-clamp-2">
            {show.description}
          </p>
          <div className="flex items-center justify-between">
            <div className="flex flex-wrap gap-1">
              {show.genre.slice(0, 2).map((g) => (
                <Badge key={g} variant="outline" size="sm">
                  {g}
                </Badge>
              ))}
              {show.genre.length > 2 && (
                <Badge variant="outline" size="sm">
                  +{show.genre.length - 2}
                </Badge>
              )}
            </div>
            <span className="text-sm text-gray-500">{show.year}</span>
          </div>
          {show.type === 'tv_show' && (
            <div className="mt-3 text-xs text-gray-500">
              {show.total_seasons} season{show.total_seasons !== 1 ? 's' : ''} • {show.total_episodes} episodes
            </div>
          )}
        </CardContent>
      </Card>
    </Link>
  );
}