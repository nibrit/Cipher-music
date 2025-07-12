import React, { useState, useCallback } from 'react';
import { YouTubeVideo } from './types';
import { searchYouTubeVideos } from './services/youtube';
import { useFavorites } from './hooks/useFavorites';
import { useMusicPlayer } from './hooks/useMusicPlayer';
import { useAuth } from './hooks/useAuth';

// Components
import Header from './components/Header';
import SearchBar from './components/SearchBar';
import Recommendations from './components/Recommendations';
import VideoCard from './components/VideoCard';
import Player from './components/Player';
import MusicPlayer from './components/MusicPlayer';
import LoadingSpinner from './components/LoadingSpinner';
import EmptyState from './components/EmptyState';
import FavoritesModal from './components/FavoritesModal';
import AuthModal from './components/AuthModal';

function App() {
  const [videos, setVideos] = useState<YouTubeVideo[]>([]);
  const [modalVideo, setModalVideo] = useState<YouTubeVideo | null>(null);
  const [loading, setLoading] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [showFavorites, setShowFavorites] = useState(false);
  const [showAuth, setShowAuth] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [currentPlaylist, setCurrentPlaylist] = useState<'search' | 'favorites' | 'recommendations'>('search');
  
  const { favorites, addFavorite, removeFavorite, isFavorite } = useFavorites();
  const musicPlayer = useMusicPlayer();
  const { user, isAuthenticated } = useAuth();

  const handleSearch = useCallback(async (query: string) => {
    if (!query.trim()) return;
    
    setLoading(true);
    setError(null);
    setSearchQuery(query);
    setCurrentPlaylist('search');
    
    try {
      const response = await searchYouTubeVideos(query);
      setVideos(response.items);
    } catch (err) {
      console.error('Search error:', err);
      setError('Failed to search videos. Please try again.');
      setVideos([]);
    } finally {
      setLoading(false);
    }
  }, []);

  const handlePlayVideo = useCallback((video: YouTubeVideo, playlistType?: 'search' | 'favorites' | 'recommendations') => {
    let playlist: YouTubeVideo[] = [];
    
    // Determine which playlist to use based on context
    if (playlistType === 'favorites') {
      playlist = favorites;
    } else if (playlistType === 'search' && videos.length > 0) {
      playlist = videos;
    } else if (playlistType === 'recommendations') {
      // For recommendations, we'll use a single-song playlist for now
      // This could be enhanced to include related recommendations
      playlist = [video];
    } else {
      // Default behavior - try to determine from current state
      if (favorites.some(fav => fav.id.videoId === video.id.videoId) && currentPlaylist === 'favorites') {
        playlist = favorites;
      } else if (videos.length > 0 && currentPlaylist === 'search') {
        playlist = videos;
      } else {
        playlist = [video];
      }
    }
    
    musicPlayer.playVideo(video, playlist);
  }, [musicPlayer, videos, favorites, currentPlaylist]);

  const handlePlayFromFavorites = useCallback((video: YouTubeVideo) => {
    setCurrentPlaylist('favorites');
    handlePlayVideo(video, 'favorites');
  }, [handlePlayVideo]);

  const handlePlayFromRecommendations = useCallback((video: YouTubeVideo) => {
    setCurrentPlaylist('recommendations');
    handlePlayVideo(video, 'recommendations');
  }, [handlePlayVideo]);

  const handlePlayFromSearch = useCallback((video: YouTubeVideo) => {
    setCurrentPlaylist('search');
    handlePlayVideo(video, 'search');
  }, [handlePlayVideo]);

  const handleOpenModal = useCallback((video: YouTubeVideo) => {
    setModalVideo(video);
  }, []);

  const handleCloseModal = useCallback(() => {
    setModalVideo(null);
  }, []);

  const handleToggleFavorite = useCallback((video: YouTubeVideo) => {
    if (isFavorite(video.id.videoId)) {
      removeFavorite(video.id.videoId);
    } else {
      addFavorite(video);
    }
  }, [isFavorite, addFavorite, removeFavorite]);

  const hasSearched = searchQuery.length > 0 || videos.length > 0;

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 transition-colors pb-24">
      {/* Header */}
      <Header 
        onShowFavorites={() => setShowFavorites(true)}
        onShowAuth={() => setShowAuth(true)}
        favoritesCount={favorites.length}
      />
      
      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Hero Section */}
        <div className="text-center mb-12">
          <h1 className="text-4xl md:text-6xl font-bold text-gray-900 dark:text-white mb-4">
            {isAuthenticated && user ? (
              <>
                Welcome back,
                <span className="block text-transparent bg-clip-text bg-gradient-to-r from-primary-600 to-secondary-600">
                  {user.displayName?.split(' ')[0] || 'Music Lover'}!
                </span>
              </>
            ) : (
              <>
                Discover Your
                <span className="block text-transparent bg-clip-text bg-gradient-to-r from-primary-600 to-secondary-600">
                  Perfect Sound
                </span>
              </>
            )}
          </h1>
          <p className="text-xl text-gray-600 dark:text-gray-400 mb-8 max-w-2xl mx-auto">
            {isAuthenticated 
              ? "Your music, your way. Search, discover, and enjoy your personalized collection."
              : "Stream millions of songs for free. Search, discover, and enjoy music from around the world."
            }
          </p>
          
          {/* Search Bar */}
          <div className="mb-12">
            <SearchBar onSearch={handleSearch} loading={loading} />
          </div>
        </div>

        {/* Recommendations - Show when no search has been made */}
        {!hasSearched && (
          <div className="mb-12">
            <Recommendations 
              onPlay={handlePlayFromRecommendations}
              onOpenModal={handleOpenModal}
              onToggleFavorite={handleToggleFavorite}
              isFavorite={isFavorite}
              currentVideo={musicPlayer.currentVideo}
            />
          </div>
        )}

        {/* Loading State */}
        {loading && (
          <LoadingSpinner size="lg" message="Searching for amazing music..." />
        )}

        {/* Error State */}
        {error && !loading && (
          <EmptyState 
            type="error" 
            message={error}
            onAction={() => setError(null)}
            actionLabel="Try Again"
          />
        )}

        {/* Search Results */}
        {!loading && !error && videos.length > 0 && (
          <div className="space-y-6">
            <div className="flex items-center justify-between">
              <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
                {searchQuery ? `Results for "${searchQuery}"` : 'Music Videos'}
              </h2>
              <p className="text-gray-600 dark:text-gray-400">
                {videos.length} {videos.length === 1 ? 'video' : 'videos'} found
              </p>
            </div>
            
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
              {videos.map((video) => (
                <VideoCard
                  key={video.id.videoId}
                  video={video}
                  onPlay={handlePlayFromSearch}
                  onOpenModal={handleOpenModal}
                  onToggleFavorite={handleToggleFavorite}
                  isFavorite={isFavorite(video.id.videoId)}
                  isPlaying={musicPlayer.currentVideo?.id.videoId === video.id.videoId}
                />
              ))}
            </div>
          </div>
        )}

        {/* Empty State */}
        {!loading && !error && hasSearched && videos.length === 0 && (
          <EmptyState 
            type="search"
            message="No music videos found for your search. Try different keywords or explore our recommendations."
          />
        )}
      </main>

      {/* Built-in Music Player */}
      <MusicPlayer
        currentVideo={musicPlayer.currentVideo}
        playlist={musicPlayer.playlist}
        currentIndex={musicPlayer.currentIndex}
        isPlaying={musicPlayer.isPlaying}
        onPlay={() => musicPlayer.setIsPlaying(true)}
        onPause={() => musicPlayer.setIsPlaying(false)}
        onNext={musicPlayer.playNext}
        onPrevious={musicPlayer.playPrevious}
        onSeek={() => {}}
        onVolumeChange={() => {}}
        onToggleFavorite={handleToggleFavorite}
        isFavorite={musicPlayer.currentVideo ? isFavorite(musicPlayer.currentVideo.id.videoId) : false}
        onToggleExpanded={musicPlayer.toggleExpanded}
        isExpanded={musicPlayer.isExpanded}
      />

      {/* Video Player Modal */}
      <Player
        video={modalVideo}
        onClose={handleCloseModal}
        onToggleFavorite={handleToggleFavorite}
        isFavorite={modalVideo ? isFavorite(modalVideo.id.videoId) : false}
      />

      {/* Favorites Modal */}
      <FavoritesModal
        isOpen={showFavorites}
        onClose={() => setShowFavorites(false)}
        favorites={favorites}
        onPlay={handlePlayFromFavorites}
        onToggleFavorite={handleToggleFavorite}
        currentVideo={musicPlayer.currentVideo}
      />

      {/* Authentication Modal */}
      <AuthModal
        isOpen={showAuth}
        onClose={() => setShowAuth(false)}
      />
    </div>
  );
}

export default App;