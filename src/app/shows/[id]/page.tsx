import { notFound } from 'next/navigation';
import { getWeaviateClient } from '@/lib/weaviate/client';
import { getShowEpisodes } from '@/lib/weaviate/queries';
import Image from 'next/image';
import EpisodeList from '@/components/shows/EpisodeList';
import Badge from '@/components/ui/Badge';
import { Calendar, Film, Tv } from 'lucide-react';

interface ShowPageProps {
  params: {
    id: string;
  };
}

export default async function ShowPage({ params }: { params: Promise<{ id: string }> }) {

   // Await the params promise
  const { id } = await params;

  if (!id) {
    return <div>Invalid show ID</div>;
  }

  console.log('Looking for show with ID:', id); 
  const client = getWeaviateClient();
  
  // Fetch show details
  const showResult = await client.graphql
    .get()
    .withClassName('Show')
    .withFields('title description cover_image genre year type total_seasons total_episodes _additional { id }')
    .withWhere({
      path: ['id'],
      operator: 'Equal',
      valueString: id,
    })
    .withLimit(1)
    .do();

  const show = showResult.data.Get.Show?.[0];
  
   if (!show) {
    console.log('Show not found for ID:', id);
    return <div>Show not found</div>;
  }


  // Fetch episodes
  const episodes = await getShowEpisodes(id);

  return (
    <div className="space-y-8">
      {/* Hero Section */}
      <div className="relative h-96 rounded-2xl overflow-hidden">
        <Image
          src={show.cover_image || '/images/placeholder.jpg'}
          alt={show.title}
          fill
          unoptimized
          className="object-cover"
          priority
        />
        <div className="absolute inset-0 bg-linear-to-t from-black/80 via-black/40 to-transparent" />
        <div className="absolute bottom-0 left-0 right-0 p-8">
          <div className="container mx-auto">
            <div className="flex items-center space-x-2 mb-3">
              <Badge variant="secondary" className="bg-white/20 text-white border-0">
                {show.type === 'tv_show' ? (
                  <Tv className="w-3 h-3 mr-1" />
                ) : (
                  <Film className="w-3 h-3 mr-1" />
                )}
                {show.type === 'tv_show' ? 'TV Show' : 'Movie'}
              </Badge>
              <Badge variant="secondary" className="bg-white/20 text-white border-0">
                <Calendar className="w-3 h-3 mr-1" />
                {show.year}
              </Badge>
            </div>
            <h1 className="text-4xl font-bold text-white mb-4">{show.title}</h1>
            <p className="text-lg text-gray-200 max-w-2xl">{show.description}</p>
            <div className="flex flex-wrap gap-2 mt-4">
              {show.genre.map((genre: string) => (
                <Badge key={genre} variant="outline" className="text-white border-white/30">
                  {genre}
                </Badge>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Episodes Section */}
      <EpisodeList episodes={episodes} showId={id} />
    </div>
  );
}