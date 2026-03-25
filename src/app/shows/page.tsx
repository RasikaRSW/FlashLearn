'use client';

import { useEffect, useState } from 'react';
import { Show } from '@/types';
import ShowCard from '@/components/shows/ShowCard';
import SearchBar from '@/components/shows/SearchBar';
import LoadingSpinner from '@/components/ui/LoadingSpinner';

export default function ShowsPage() {
  const [shows, setShows] = useState<Show[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');

  useEffect(() => {
    const fetchShows = async () => {
      setLoading(true);
      try {
        const params = new URLSearchParams();
        if (searchQuery) params.set('query', searchQuery);
        else params.set('query', 'popular tv shows movies');

        const res = await fetch(`/api/shows?${params.toString()}`);
        const data = await res.json();
        console.log('Shows data:', data.shows);
        setShows(data.shows || []);
      } catch (error) {
        console.error('Error fetching shows:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchShows();
  }, [searchQuery]);

  return (
    <div className="space-y-8">
      <div className="text-center">
        <h1 className="text-3xl font-bold text-gray-900 mb-4">
          Browse TV Shows & Movies
        </h1>
        <p className="text-gray-600 max-w-2xl mx-auto">
          Select your favorite show or movie to generate vocabulary flashcards from any episode
        </p>
      </div>

      <SearchBar onSearch={setSearchQuery} />

      {loading ? (
        <div className="flex justify-center py-12">
          <LoadingSpinner size="lg" />
        </div>
      ) : shows.length === 0 ? (
        <div className="text-center py-12">
          <p className="text-gray-500">No shows found. Try a different search.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {shows.map((show) => (
            <ShowCard key={show.id || `show-${show.title}`} show={show} />
          ))}
        </div>
      )}
    </div>
  );
}