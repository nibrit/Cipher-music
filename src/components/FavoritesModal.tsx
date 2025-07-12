import React from 'react';
import { X, Heart, Play, Cloud, User } from 'lucide-react';
import { YouTubeVideo } from '../types';
import { useAuth } from '../hooks/useAuth';
import VideoCard from './VideoCard';
import EmptyState from './EmptyState';

interface FavoritesModalProps {
  isOpen: boolean;
  onClose: () => void;
  favorites: YouTubeVideo[];
  onPlay: (video: YouTubeVideo) => void;
  onToggleFavorite: (video: YouTubeVideo) => void;
  currentVideo?: YouTubeVideo | null;
}

const FavoritesModal: React.FC<FavoritesModalProps> = ({
  isOpen,
  onClose,
  favorites,
  onPlay,
  onToggleFavorite,
  currentVideo
}) => {
  const { user, isAuthenticated } = useAuth();

  if (!isOpen) return null;

  const handlePlayAll = () => {
    if (favorites.length > 0) {
      // Play the first song and set the entire favorites list as the playlist
      onPlay(favorites[0]);
    }
  };

  const handlePlaySong = (video: YouTubeVideo) => {
    // When playing a specific song from favorites, use the favorites list as playlist
    onPlay(video);
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
      <div className="bg-white dark:bg-gray-900 rounded-2xl shadow-2xl w-full max-w-6xl max-h-[90vh] overflow-hidden animate-slide-up">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200 dark:border-gray-800">
          <div className="flex items-center space-x-3">
            <div className="p-2 bg-error-100 dark:bg-error-900/30 rounded-full">
              <Heart className="h-6 w-6 text-error-600 dark:text-error-400" fill="currentColor" />
            </div>
            <div>
              <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
                {isAuthenticated ? 'Your Cloud Favorites' : 'Your Local Favorites'}
              </h2>
              <div className="flex items-center space-x-4 text-sm text-gray-600 dark:text-gray-400">
                <span>
                  {favorites.length} {favorites.length === 1 ? 'song' : 'songs'} saved
                </span>
                {isAuthenticated && user && (
                  <div className="flex items-center space-x-1">
                    <Cloud className="h-4 w-4 text-success-500" />
                    <span className="text-success-600 dark:text-success-400">
                      Synced to {user.email}
                    </span>
                  </div>
                )}
                {!isAuthenticated && (
                  <div className="flex items-center space-x-1">
                    <User className="h-4 w-4 text-warning-500" />
                    <span className="text-warning-600 dark:text-warning-400">
                      Sign in to sync across devices
                    </span>
                  </div>
                )}
              </div>
            </div>
          </div>
          
          <button
            onClick={onClose}
            className="p-2 rounded-full bg-gray-100 dark:bg-gray-800 hover:bg-gray-200 dark:hover:bg-gray-700 text-gray-600 dark:text-gray-400 transition-colors"
          >
            <X className="h-6 w-6" />
          </button>
        </div>
        
        {/* Content */}
        <div className="p-6 overflow-y-auto max-h-[calc(90vh-120px)]">
          {favorites.length === 0 ? (
            <div className="text-center py-12">
              <EmptyState 
                type="favorites" 
                message={
                  isAuthenticated 
                    ? "You haven't added any favorites yet. Start exploring music to build your cloud collection!"
                    : "You haven't added any favorites yet. Sign in to sync your favorites across all devices!"
                }
                onAction={onClose}
                actionLabel="Explore Music"
              />
            </div>
          ) : (
            <>
              {/* Play All Button */}
              <div className="mb-6 flex items-center justify-between">
                <button
                  onClick={handlePlayAll}
                  className="flex items-center space-x-2 px-6 py-3 bg-primary-600 hover:bg-primary-700 text-white rounded-full font-medium transition-colors shadow-lg hover:shadow-xl"
                >
                  <Play className="h-5 w-5" fill="currentColor" />
                  <span>Play All Favorites</span>
                </button>
                
                {isAuthenticated && (
                  <div className="flex items-center space-x-2 text-sm text-success-600 dark:text-success-400">
                    <Cloud className="h-4 w-4" />
                    <span>Automatically synced to cloud</span>
                  </div>
                )}
              </div>
              
              {/* Favorites Grid */}
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {favorites.map((video) => (
                  <VideoCard
                    key={video.id.videoId}
                    video={video}
                    onPlay={handlePlaySong}
                    onToggleFavorite={onToggleFavorite}
                    isFavorite={true}
                    isPlaying={currentVideo?.id.videoId === video.id.videoId}
                  />
                ))}
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
};

export default FavoritesModal;