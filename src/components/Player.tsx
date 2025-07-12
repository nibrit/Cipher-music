import React, { useEffect, useState } from 'react';
import { X, Heart, ExternalLink, User, Calendar, Maximize2, Volume2 } from 'lucide-react';
import { YouTubeVideo } from '../types';
import { getVideoUrl } from '../services/youtube';

interface PlayerProps {
  video: YouTubeVideo | null;
  onClose: () => void;
  onToggleFavorite: (video: YouTubeVideo) => void;
  isFavorite: boolean;
}

const Player: React.FC<PlayerProps> = ({ video, onClose, onToggleFavorite, isFavorite }) => {
  const [isLoading, setIsLoading] = useState(true);
  const [isFullscreen, setIsFullscreen] = useState(false);

  useEffect(() => {
    if (video) {
      setIsLoading(true);
    }
  }, [video]);

  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        onClose();
      }
    };

    if (video) {
      document.addEventListener('keydown', handleEscape);
      document.body.style.overflow = 'hidden'; // Prevent background scrolling
    }

    return () => {
      document.removeEventListener('keydown', handleEscape);
      document.body.style.overflow = 'unset';
    };
  }, [video, onClose]);

  if (!video) return null;

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  const openInYouTube = () => {
    window.open(`https://www.youtube.com/watch?v=${video.id.videoId}`, '_blank');
  };

  const toggleFullscreen = () => {
    setIsFullscreen(!isFullscreen);
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/90 backdrop-blur-sm flex items-center justify-center p-4">
      <div className={`
        bg-white dark:bg-gray-900 rounded-2xl shadow-2xl overflow-hidden animate-slide-up
        ${isFullscreen 
          ? 'w-full h-full max-w-none max-h-none' 
          : 'w-full max-w-5xl max-h-[90vh]'
        }
      `}>
        {/* Header */}
        <div className="flex items-center justify-between p-4 lg:p-6 border-b border-gray-200 dark:border-gray-800">
          <div className="flex-1 min-w-0">
            <h2 className="text-lg lg:text-xl font-bold text-gray-900 dark:text-white truncate">
              {video.snippet.title}
            </h2>
            <div className="flex items-center space-x-4 mt-2 text-sm text-gray-600 dark:text-gray-400">
              <div className="flex items-center space-x-1">
                <User className="h-4 w-4" />
                <span className="truncate">{video.snippet.channelTitle}</span>
              </div>
              <div className="flex items-center space-x-1">
                <Calendar className="h-4 w-4" />
                <span>{formatDate(video.snippet.publishedAt)}</span>
              </div>
            </div>
          </div>
          
          <div className="flex items-center space-x-2 ml-4">
            <button
              onClick={() => onToggleFavorite(video)}
              className={`
                p-2 rounded-full transition-all duration-200 
                ${isFavorite 
                  ? 'bg-error-500 hover:bg-error-600 text-white' 
                  : 'bg-gray-100 dark:bg-gray-800 hover:bg-gray-200 dark:hover:bg-gray-700 text-gray-600 dark:text-gray-400'
                }
              `}
              title={isFavorite ? 'Remove from favorites' : 'Add to favorites'}
            >
              <Heart className="h-5 w-5" fill={isFavorite ? 'currentColor' : 'none'} />
            </button>
            
            <button
              onClick={toggleFullscreen}
              className="p-2 rounded-full bg-gray-100 dark:bg-gray-800 hover:bg-gray-200 dark:hover:bg-gray-700 text-gray-600 dark:text-gray-400 transition-colors"
              title={isFullscreen ? 'Exit fullscreen' : 'Enter fullscreen'}
            >
              <Maximize2 className="h-5 w-5" />
            </button>
            
            <button
              onClick={openInYouTube}
              className="p-2 rounded-full bg-gray-100 dark:bg-gray-800 hover:bg-gray-200 dark:hover:bg-gray-700 text-gray-600 dark:text-gray-400 transition-colors"
              title="Open in YouTube"
            >
              <ExternalLink className="h-5 w-5" />
            </button>
            
            <button
              onClick={onClose}
              className="p-2 rounded-full bg-gray-100 dark:bg-gray-800 hover:bg-gray-200 dark:hover:bg-gray-700 text-gray-600 dark:text-gray-400 transition-colors"
              title="Close player (ESC)"
            >
              <X className="h-5 w-5" />
            </button>
          </div>
        </div>
        
        {/* Video Player */}
        <div className={`
          relative bg-black
          ${isFullscreen ? 'h-[calc(100vh-120px)]' : 'aspect-video'}
        `}>
          {isLoading && (
            <div className="absolute inset-0 flex items-center justify-center bg-gray-100 dark:bg-gray-800">
              <div className="flex flex-col items-center space-y-4">
                <div className="animate-spin rounded-full h-12 w-12 border-4 border-primary-500 border-t-transparent"></div>
                <p className="text-gray-600 dark:text-gray-400 text-sm">Loading video...</p>
              </div>
            </div>
          )}
          
          <iframe
            src={getVideoUrl(video.id.videoId, true)}
            title={video.snippet.title}
            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
            allowFullScreen
            className="w-full h-full border-0"
            onLoad={() => setIsLoading(false)}
          />
          
          {/* Video Controls Overlay */}
          <div className="absolute bottom-4 left-4 right-4 flex items-center justify-between opacity-0 hover:opacity-100 transition-opacity duration-300 pointer-events-none">
            <div className="flex items-center space-x-2 bg-black/50 rounded-full px-3 py-2 pointer-events-auto">
              <Volume2 className="h-4 w-4 text-white" />
              <span className="text-white text-sm">Playing in Cipher Music</span>
            </div>
          </div>
        </div>
        
        {/* Description */}
        {!isFullscreen && video.snippet.description && (
          <div className="p-4 lg:p-6 max-h-32 overflow-y-auto border-t border-gray-200 dark:border-gray-800">
            <h3 className="font-semibold text-gray-900 dark:text-white mb-2">Description</h3>
            <p className="text-sm text-gray-600 dark:text-gray-400 whitespace-pre-wrap line-clamp-4">
              {video.snippet.description.length > 200 
                ? video.snippet.description.substring(0, 200) + '...'
                : video.snippet.description
              }
            </p>
          </div>
        )}
      </div>
    </div>
  );
};

export default Player;