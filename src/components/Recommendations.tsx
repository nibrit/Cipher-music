import React, { useState, useEffect } from 'react';
import { 
  TrendingUp, 
  Clock, 
  Music, 
  Sparkles,
  RefreshCw
} from 'lucide-react';
import { YouTubeVideo } from '../types';
import { searchYouTubeVideos } from '../services/youtube';
import VideoCard from './VideoCard';
import LoadingSpinner from './LoadingSpinner';

interface RecommendationsProps {
  onPlay: (video: YouTubeVideo) => void;
  onOpenModal?: (video: YouTubeVideo) => void;
  onToggleFavorite: (video: YouTubeVideo) => void;
  isFavorite: (videoId: string) => boolean;
  currentVideo?: YouTubeVideo | null;
}

type RecommendationCategory = 'trending' | 'recent' | 'genres';

const recommendationQueries = {
  trending: [
    'trending music 2024',
    'viral songs 2024',
    'top hits 2024',
    'popular music now',
    'chart toppers 2024'
  ],
  recent: [
    'new music releases 2024',
    'latest songs 2024',
    'fresh music 2024',
    'new hits this week',
    'recently released songs'
  ],
  genres: [
    'pop music hits',
    'rock music classics',
    'hip hop rap music',
    'electronic dance music',
    'indie alternative music',
    'jazz music smooth',
    'classical music beautiful',
    'country music hits'
  ]
};

const Recommendations: React.FC<RecommendationsProps> = ({
  onPlay,
  onOpenModal,
  onToggleFavorite,
  isFavorite,
  currentVideo
}) => {
  const [activeCategory, setActiveCategory] = useState<RecommendationCategory>('trending');
  const [videos, setVideos] = useState<YouTubeVideo[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const loadRecommendations = async (category: RecommendationCategory) => {
    setLoading(true);
    setError(null);
    
    try {
      const queries = recommendationQueries[category];
      const randomQuery = queries[Math.floor(Math.random() * queries.length)];
      
      const response = await searchYouTubeVideos(randomQuery, 12);
      setVideos(response.items);
    } catch (err) {
      console.error('Error loading recommendations:', err);
      setError('Failed to load recommendations. Please try again.');
      setVideos([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadRecommendations(activeCategory);
  }, [activeCategory]);

  const handleCategoryChange = (category: RecommendationCategory) => {
    setActiveCategory(category);
  };

  const handleRefresh = () => {
    loadRecommendations(activeCategory);
  };

  const categories = [
    {
      id: 'trending' as RecommendationCategory,
      name: 'Trending Now',
      icon: TrendingUp,
      description: 'What\'s hot right now'
    },
    {
      id: 'recent' as RecommendationCategory,
      name: 'Recently Popular',
      icon: Clock,
      description: 'Latest releases'
    },
    {
      id: 'genres' as RecommendationCategory,
      name: 'Popular Genres',
      icon: Music,
      description: 'Explore different styles'
    }
  ];

  return (
    <div className="w-full space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-3">
          <div className="p-2 bg-primary-100 dark:bg-primary-900/30 rounded-full">
            <Sparkles className="h-6 w-6 text-primary-600 dark:text-primary-400" />
          </div>
          <div>
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
              Recommendations
            </h2>
            <p className="text-sm text-gray-600 dark:text-gray-400">
              Discover amazing music curated for you
            </p>
          </div>
        </div>
        
        <button
          onClick={handleRefresh}
          disabled={loading}
          className="flex items-center space-x-2 px-4 py-2 bg-gray-100 dark:bg-gray-800 hover:bg-gray-200 dark:hover:bg-gray-700 rounded-lg transition-colors disabled:opacity-50"
          title="Refresh recommendations"
        >
          <RefreshCw className={`h-4 w-4 ${loading ? 'animate-spin' : ''}`} />
          <span className="hidden sm:block">Refresh</span>
        </button>
      </div>
      
      {/* Category Tabs */}
      <div className="flex space-x-1 bg-gray-100 dark:bg-gray-800 rounded-lg p-1">
        {categories.map((category) => {
          const IconComponent = category.icon;
          return (
            <button
              key={category.id}
              onClick={() => handleCategoryChange(category.id)}
              className={`
                flex-1 flex items-center justify-center space-x-2 px-4 py-3 rounded-md transition-all duration-200
                ${activeCategory === category.id
                  ? 'bg-white dark:bg-gray-700 text-primary-600 dark:text-primary-400 shadow-sm'
                  : 'text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-200'
                }
              `}
            >
              <IconComponent className="h-4 w-4" />
              <span className="font-medium text-sm">{category.name}</span>
            </button>
          );
        })}
      </div>
      
      {/* Category Description */}
      <div className="text-center">
        <p className="text-gray-600 dark:text-gray-400">
          {categories.find(cat => cat.id === activeCategory)?.description}
        </p>
      </div>
      
      {/* Loading State */}
      {loading && (
        <LoadingSpinner size="lg" message="Loading fresh recommendations..." />
      )}
      
      {/* Error State */}
      {error && !loading && (
        <div className="text-center py-12">
          <div className="text-4xl mb-4">😕</div>
          <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">
            Oops! Something went wrong
          </h3>
          <p className="text-gray-600 dark:text-gray-400 mb-6">
            {error}
          </p>
          <button
            onClick={handleRefresh}
            className="px-6 py-3 bg-primary-600 hover:bg-primary-700 text-white rounded-full font-medium transition-colors"
          >
            Try Again
          </button>
        </div>
      )}
      
      {/* Recommendations Grid */}
      {!loading && !error && videos.length > 0 && (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {videos.map((video) => (
            <VideoCard
              key={video.id.videoId}
              video={video}
              onPlay={onPlay}
              onOpenModal={onOpenModal}
              onToggleFavorite={onToggleFavorite}
              isFavorite={isFavorite(video.id.videoId)}
              isPlaying={currentVideo?.id.videoId === video.id.videoId}
            />
          ))}
        </div>
      )}
      
      {/* Empty State */}
      {!loading && !error && videos.length === 0 && (
        <div className="text-center py-12">
          <Music className="h-16 w-16 text-gray-300 dark:text-gray-600 mx-auto mb-4" />
          <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">
            No recommendations available
          </h3>
          <p className="text-gray-600 dark:text-gray-400 mb-6">
            We couldn't load recommendations right now. Please try refreshing.
          </p>
          <button
            onClick={handleRefresh}
            className="px-6 py-3 bg-primary-600 hover:bg-primary-700 text-white rounded-full font-medium transition-colors"
          >
            Refresh
          </button>
        </div>
      )}
    </div>
  );
};

export default Recommendations;