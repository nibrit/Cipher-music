import React from 'react';
import { Play, Heart, Clock, User, ExternalLink } from 'lucide-react';
import { YouTubeVideo } from '../types';

interface VideoCardProps {
  video: YouTubeVideo;
  onPlay: (video: YouTubeVideo) => void;
  onOpenModal?: (video: YouTubeVideo) => void;
  onToggleFavorite: (video: YouTubeVideo) => void;
  isFavorite: boolean;
  isPlaying?: boolean;
}

const VideoCard: React.FC<VideoCardProps> = ({ 
  video, 
  onPlay, 
  onOpenModal,
  onToggleFavorite, 
  isFavorite, 
  isPlaying = false 
}) => {
  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffTime = Math.abs(now.getTime() - date.getTime());
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    
    if (diffDays === 1) return '1 day ago';
    if (diffDays < 30) return `${diffDays} days ago`;
    if (diffDays < 365) return `${Math.floor(diffDays / 30)} months ago`;
    return `${Math.floor(diffDays / 365)} years ago`;
  };

  const truncateText = (text: string, maxLength: number) => {
    return text.length > maxLength ? text.substring(0, maxLength) + '...' : text;
  };

  return (
    <div className={`
      group relative bg-white dark:bg-gray-800 rounded-xl shadow-md hover:shadow-xl 
      transition-all duration-300 overflow-hidden hover:-translate-y-1
      ${isPlaying ? 'ring-2 ring-primary-500 shadow-primary-500/20' : ''}
    `}>
      {/* Thumbnail */}
      <div className="relative aspect-video overflow-hidden bg-gray-100 dark:bg-gray-700">
        <img
          src={video.snippet.thumbnails.medium?.url || video.snippet.thumbnails.default.url}
          alt={video.snippet.title}
          className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
        />
        
        {/* Play Overlay */}
        <div className="absolute inset-0 bg-black/0 group-hover:bg-black/30 transition-all duration-300 flex items-center justify-center">
          <div className="flex items-center space-x-2 opacity-0 group-hover:opacity-100 transform scale-75 group-hover:scale-100 transition-all duration-300">
            <button
              onClick={() => onPlay(video)}
              className="bg-primary-600 hover:bg-primary-700 text-white p-3 rounded-full shadow-lg hover:shadow-xl active:scale-95 transition-all"
              title="Play in music player"
            >
              <Play className="h-5 w-5 ml-0.5" fill="currentColor" />
            </button>
            
            {onOpenModal && (
              <button
                onClick={() => onOpenModal(video)}
                className="bg-white/90 hover:bg-white text-gray-900 p-3 rounded-full shadow-lg hover:shadow-xl active:scale-95 transition-all"
                title="Open full video"
              >
                <ExternalLink className="h-5 w-5" />
              </button>
            )}
          </div>
        </div>
        
        {/* Playing Indicator */}
        {isPlaying && (
          <div className="absolute top-3 right-3 bg-primary-600 text-white px-2 py-1 rounded-full text-xs font-medium flex items-center space-x-1">
            <div className="w-2 h-2 bg-white rounded-full animate-pulse" />
            <span>Playing</span>
          </div>
        )}
        
        {/* Favorite Button */}
        <button
          onClick={() => onToggleFavorite(video)}
          className={`
            absolute top-3 left-3 p-2 rounded-full transition-all duration-200 
            ${isFavorite 
              ? 'bg-error-500 text-white shadow-lg' 
              : 'bg-white/80 hover:bg-white text-gray-700 opacity-0 group-hover:opacity-100'
            }
          `}
        >
          <Heart 
            className="h-4 w-4" 
            fill={isFavorite ? 'currentColor' : 'none'} 
          />
        </button>
      </div>
      
      {/* Content */}
      <div className="p-4 space-y-3">
        <h3 className="font-semibold text-gray-900 dark:text-white line-clamp-2 leading-tight">
          {truncateText(video.snippet.title, 60)}
        </h3>
        
        <div className="flex items-center space-x-2 text-sm text-gray-600 dark:text-gray-400">
          <User className="h-4 w-4" />
          <span className="truncate">{video.snippet.channelTitle}</span>
        </div>
        
        <div className="flex items-center justify-between text-xs text-gray-500 dark:text-gray-500">
          <div className="flex items-center space-x-1">
            <Clock className="h-3 w-3" />
            <span>{formatDate(video.snippet.publishedAt)}</span>
          </div>
        </div>
      </div>
      
      {/* Hover Effect Background */}
      <div className="absolute inset-0 bg-gradient-to-t from-primary-500/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none" />
    </div>
  );
};

export default VideoCard;