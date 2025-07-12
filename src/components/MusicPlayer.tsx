import React, { useState, useRef, useEffect } from 'react';
import { 
  Play, 
  Pause, 
  SkipBack, 
  SkipForward, 
  Volume2, 
  VolumeX, 
  Repeat, 
  Shuffle,
  Heart,
  Maximize2,
  Minimize2,
  ChevronUp,
  ChevronDown
} from 'lucide-react';
import { YouTubeVideo } from '../types';

interface MusicPlayerProps {
  currentVideo: YouTubeVideo | null;
  playlist: YouTubeVideo[];
  currentIndex: number;
  isPlaying: boolean;
  onPlay: () => void;
  onPause: () => void;
  onNext: () => void;
  onPrevious: () => void;
  onSeek: (time: number) => void;
  onVolumeChange: (volume: number) => void;
  onToggleFavorite: (video: YouTubeVideo) => void;
  isFavorite: boolean;
  onToggleExpanded: () => void;
  isExpanded: boolean;
}

const MusicPlayer: React.FC<MusicPlayerProps> = ({
  currentVideo,
  playlist,
  currentIndex,
  isPlaying,
  onPlay,
  onPause,
  onNext,
  onPrevious,
  onSeek,
  onVolumeChange,
  onToggleFavorite,
  isFavorite,
  onToggleExpanded,
  isExpanded
}) => {
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [volume, setVolume] = useState(0.8);
  const [isMuted, setIsMuted] = useState(false);
  const [isRepeat, setIsRepeat] = useState(false);
  const [isShuffle, setIsShuffle] = useState(false);
  const [playerReady, setPlayerReady] = useState(false);
  const [playerError, setPlayerError] = useState<string | null>(null);
  const playerRef = useRef<any>(null);
  const playerContainerRef = useRef<HTMLDivElement>(null);

  // Initialize YouTube player when video changes
  useEffect(() => {
    if (!currentVideo || !window.YT || !window.YT.Player) {
      return;
    }

    // Clean up existing player
    if (playerRef.current && typeof playerRef.current.destroy === 'function') {
      try {
        playerRef.current.destroy();
      } catch (error) {
        console.warn('Error destroying player:', error);
      }
    }

    setPlayerReady(false);
    setPlayerError(null);

    try {
      // Create new player
      playerRef.current = new window.YT.Player('youtube-audio-player', {
        height: '0',
        width: '0',
        videoId: currentVideo.id.videoId,
        playerVars: {
          autoplay: 1, // Enable autoplay for immediate playback
          controls: 0,
          disablekb: 1,
          fs: 0,
          iv_load_policy: 3,
          modestbranding: 1,
          rel: 0,
          showinfo: 0,
          playsinline: 1,
          enablejsapi: 1,
          origin: window.location.origin
        },
        events: {
          onReady: (event: any) => {
            console.log('YouTube player ready');
            setPlayerReady(true);
            setDuration(event.target.getDuration());
            event.target.setVolume(volume * 100);
            
            // Start playing immediately
            event.target.playVideo();
          },
          onStateChange: (event: any) => {
            console.log('Player state changed:', event.data);
            
            if (event.data === window.YT.PlayerState.PLAYING) {
              onPlay();
              setPlayerError(null);
            } else if (event.data === window.YT.PlayerState.PAUSED) {
              onPause();
            } else if (event.data === window.YT.PlayerState.ENDED) {
              if (isRepeat) {
                event.target.seekTo(0);
                event.target.playVideo();
              } else {
                onNext();
              }
            } else if (event.data === window.YT.PlayerState.BUFFERING) {
              console.log('Player buffering...');
            }
          },
          onError: (event: any) => {
            console.error('YouTube player error:', event.data);
            let errorMessage = 'Playback error occurred';
            
            switch (event.data) {
              case 2:
                errorMessage = 'Invalid video ID';
                break;
              case 5:
                errorMessage = 'HTML5 player error';
                break;
              case 100:
                errorMessage = 'Video not found or private';
                break;
              case 101:
              case 150:
                errorMessage = 'Video cannot be played in embedded players';
                break;
            }
            
            setPlayerError(errorMessage);
            // Try to play next video on error
            setTimeout(() => onNext(), 2000);
          }
        }
      });
    } catch (error) {
      console.error('Error creating YouTube player:', error);
      setPlayerError('Failed to initialize player');
    }

    // Cleanup function
    return () => {
      if (playerRef.current && typeof playerRef.current.destroy === 'function') {
        try {
          playerRef.current.destroy();
        } catch (error) {
          console.warn('Error in cleanup:', error);
        }
      }
    };
  }, [currentVideo?.id.videoId]);

  // Sync player state with isPlaying prop
  useEffect(() => {
    if (playerReady && playerRef.current) {
      try {
        if (isPlaying) {
          playerRef.current.playVideo();
        } else {
          playerRef.current.pauseVideo();
        }
      } catch (error) {
        console.error('Error controlling playback:', error);
      }
    }
  }, [isPlaying, playerReady]);

  // Update current time
  useEffect(() => {
    if (!playerReady || !playerRef.current) return;

    const interval = setInterval(() => {
      try {
        if (playerRef.current && typeof playerRef.current.getCurrentTime === 'function') {
          const time = playerRef.current.getCurrentTime();
          setCurrentTime(time);
        }
      } catch (error) {
        console.warn('Error getting current time:', error);
      }
    }, 1000);

    return () => clearInterval(interval);
  }, [playerReady]);

  const handlePlayPause = () => {
    if (!playerReady || !playerRef.current) return;

    try {
      if (isPlaying) {
        playerRef.current.pauseVideo();
      } else {
        playerRef.current.playVideo();
      }
    } catch (error) {
      console.error('Error toggling playback:', error);
    }
  };

  const handleSeek = (e: React.ChangeEvent<HTMLInputElement>) => {
    const time = parseFloat(e.target.value);
    setCurrentTime(time);
    
    if (playerReady && playerRef.current) {
      try {
        playerRef.current.seekTo(time);
      } catch (error) {
        console.error('Error seeking:', error);
      }
    }
    onSeek(time);
  };

  const handleVolumeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newVolume = parseFloat(e.target.value);
    setVolume(newVolume);
    setIsMuted(newVolume === 0);
    
    if (playerReady && playerRef.current) {
      try {
        playerRef.current.setVolume(newVolume * 100);
      } catch (error) {
        console.error('Error setting volume:', error);
      }
    }
    onVolumeChange(newVolume);
  };

  const toggleMute = () => {
    const newMuted = !isMuted;
    setIsMuted(newMuted);
    
    if (playerReady && playerRef.current) {
      try {
        if (newMuted) {
          playerRef.current.mute();
        } else {
          playerRef.current.unMute();
        }
      } catch (error) {
        console.error('Error toggling mute:', error);
      }
    }
  };

  const formatTime = (time: number) => {
    const minutes = Math.floor(time / 60);
    const seconds = Math.floor(time % 60);
    return `${minutes}:${seconds.toString().padStart(2, '0')}`;
  };

  const handleSongInfoClick = () => {
    onToggleExpanded();
  };

  if (!currentVideo) return null;

  return (
    <>
      {/* Hidden YouTube Player Container */}
      <div 
        ref={playerContainerRef}
        className="fixed -top-full -left-full opacity-0 pointer-events-none"
        style={{ width: '1px', height: '1px' }}
      >
        <div id="youtube-audio-player" />
      </div>
      
      {/* Music Player UI */}
      <div className={`
        fixed bottom-0 left-0 right-0 z-50 bg-white dark:bg-gray-900 border-t border-gray-200 dark:border-gray-800 shadow-2xl
        transition-all duration-300 ${isExpanded ? 'h-96' : 'h-20'}
      `}>
        {/* Error Display */}
        {playerError && (
          <div className="bg-error-500 text-white px-4 py-2 text-sm flex items-center justify-between">
            <span>{playerError} - Trying next song...</span>
            <button
              onClick={() => setPlayerError(null)}
              className="text-white hover:text-gray-200"
            >
              <X className="h-4 w-4" />
            </button>
          </div>
        )}
        
        {/* Minimize Button - Only visible when expanded */}
        {isExpanded && (
          <div className="absolute top-2 right-4 z-10">
            <button
              onClick={onToggleExpanded}
              className="p-2 rounded-full bg-gray-100 dark:bg-gray-800 hover:bg-gray-200 dark:hover:bg-gray-700 text-gray-600 dark:text-gray-400 transition-colors shadow-lg"
              title="Minimize player"
            >
              <ChevronDown className="h-5 w-5" />
            </button>
          </div>
        )}
        
        {/* Expanded Player */}
        {isExpanded && (
          <div className="p-6 h-full overflow-y-auto">
            <div className="max-w-4xl mx-auto">
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 h-full">
                {/* Album Art & Info */}
                <div className="flex flex-col items-center justify-center space-y-4">
                  <img
                    src={currentVideo.snippet.thumbnails.high?.url || currentVideo.snippet.thumbnails.medium.url}
                    alt={currentVideo.snippet.title}
                    className="w-48 h-48 rounded-xl shadow-lg object-cover"
                  />
                  <div className="text-center">
                    <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-2">
                      {currentVideo.snippet.title}
                    </h3>
                    <p className="text-gray-600 dark:text-gray-400">
                      {currentVideo.snippet.channelTitle}
                    </p>
                    {!playerReady && (
                      <p className="text-sm text-primary-500 mt-2">Loading player...</p>
                    )}
                  </div>
                </div>
                
                {/* Playlist */}
                <div className="space-y-4">
                  <h4 className="text-lg font-semibold text-gray-900 dark:text-white">
                    Up Next ({playlist.length} songs)
                  </h4>
                  <div className="space-y-2 max-h-64 overflow-y-auto">
                    {playlist.map((video, index) => (
                      <div
                        key={video.id.videoId}
                        className={`
                          flex items-center space-x-3 p-2 rounded-lg cursor-pointer transition-colors
                          ${index === currentIndex 
                            ? 'bg-primary-100 dark:bg-primary-900/30' 
                            : 'hover:bg-gray-100 dark:hover:bg-gray-800'
                          }
                        `}
                      >
                        <img
                          src={video.snippet.thumbnails.default.url}
                          alt={video.snippet.title}
                          className="w-12 h-12 rounded object-cover"
                        />
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-medium text-gray-900 dark:text-white truncate">
                            {video.snippet.title}
                          </p>
                          <p className="text-xs text-gray-600 dark:text-gray-400 truncate">
                            {video.snippet.channelTitle}
                          </p>
                        </div>
                        {index === currentIndex && (
                          <div className="flex items-center space-x-1">
                            {isPlaying ? (
                              <div className="flex space-x-1">
                                <div className="w-1 h-4 bg-primary-500 rounded animate-pulse" />
                                <div className="w-1 h-4 bg-primary-500 rounded animate-pulse" style={{ animationDelay: '0.2s' }} />
                                <div className="w-1 h-4 bg-primary-500 rounded animate-pulse" style={{ animationDelay: '0.4s' }} />
                              </div>
                            ) : (
                              <div className="w-4 h-4 bg-primary-500 rounded-full" />
                            )}
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}
        
        {/* Compact Player */}
        <div className="px-4 py-3">
          <div className="flex items-center space-x-4">
            {/* Song Info - Clickable to expand/minimize */}
            <div 
              className="flex items-center space-x-3 flex-1 min-w-0 cursor-pointer group"
              onClick={handleSongInfoClick}
            >
              <div className="relative">
                <img
                  src={currentVideo.snippet.thumbnails.default.url}
                  alt={currentVideo.snippet.title}
                  className="w-12 h-12 rounded object-cover transition-transform group-hover:scale-105"
                />
                {isPlaying && (
                  <div className="absolute inset-0 bg-black/20 rounded flex items-center justify-center">
                    <div className="flex space-x-0.5">
                      <div className="w-0.5 h-3 bg-white rounded animate-pulse" />
                      <div className="w-0.5 h-3 bg-white rounded animate-pulse" style={{ animationDelay: '0.2s' }} />
                      <div className="w-0.5 h-3 bg-white rounded animate-pulse" style={{ animationDelay: '0.4s' }} />
                    </div>
                  </div>
                )}
              </div>
              <div className="min-w-0 flex-1">
                <p className="text-sm font-medium text-gray-900 dark:text-white truncate group-hover:text-primary-600 dark:group-hover:text-primary-400 transition-colors">
                  {currentVideo.snippet.title}
                </p>
                <p className="text-xs text-gray-600 dark:text-gray-400 truncate">
                  {currentVideo.snippet.channelTitle}
                </p>
              </div>
              <div className="opacity-0 group-hover:opacity-100 transition-opacity">
                {isExpanded ? (
                  <ChevronDown className="h-4 w-4 text-gray-400" />
                ) : (
                  <ChevronUp className="h-4 w-4 text-gray-400" />
                )}
              </div>
            </div>
            
            {/* Controls */}
            <div className="flex items-center space-x-2">
              <button
                onClick={() => setIsShuffle(!isShuffle)}
                className={`p-2 rounded-full transition-colors ${
                  isShuffle 
                    ? 'bg-primary-500 text-white' 
                    : 'text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-800'
                }`}
                title={isShuffle ? 'Disable shuffle' : 'Enable shuffle'}
              >
                <Shuffle className="h-4 w-4" />
              </button>
              
              <button
                onClick={onPrevious}
                disabled={!playerReady}
                className="p-2 text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-full transition-colors disabled:opacity-50"
                title="Previous song"
              >
                <SkipBack className="h-5 w-5" />
              </button>
              
              <button
                onClick={handlePlayPause}
                disabled={!playerReady}
                className="p-3 bg-primary-500 hover:bg-primary-600 text-white rounded-full transition-colors shadow-lg disabled:opacity-50 disabled:cursor-not-allowed"
                title={isPlaying ? 'Pause' : 'Play'}
              >
                {isPlaying ? (
                  <Pause className="h-5 w-5" fill="currentColor" />
                ) : (
                  <Play className="h-5 w-5 ml-0.5" fill="currentColor" />
                )}
              </button>
              
              <button
                onClick={onNext}
                disabled={!playerReady}
                className="p-2 text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-full transition-colors disabled:opacity-50"
                title="Next song"
              >
                <SkipForward className="h-5 w-5" />
              </button>
              
              <button
                onClick={() => setIsRepeat(!isRepeat)}
                className={`p-2 rounded-full transition-colors ${
                  isRepeat 
                    ? 'bg-primary-500 text-white' 
                    : 'text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-800'
                }`}
                title={isRepeat ? 'Disable repeat' : 'Enable repeat'}
              >
                <Repeat className="h-4 w-4" />
              </button>
            </div>
            
            {/* Progress Bar */}
            <div className="hidden md:flex items-center space-x-2 flex-1 max-w-md">
              <span className="text-xs text-gray-600 dark:text-gray-400 w-10">
                {formatTime(currentTime)}
              </span>
              <input
                type="range"
                min="0"
                max={duration || 100}
                value={currentTime}
                onChange={handleSeek}
                disabled={!playerReady}
                className="flex-1 h-1 bg-gray-200 dark:bg-gray-700 rounded-lg appearance-none cursor-pointer slider disabled:opacity-50"
                title="Seek"
              />
              <span className="text-xs text-gray-600 dark:text-gray-400 w-10">
                {formatTime(duration)}
              </span>
            </div>
            
            {/* Volume & Actions */}
            <div className="flex items-center space-x-2">
              <button
                onClick={() => onToggleFavorite(currentVideo)}
                className={`p-2 rounded-full transition-colors ${
                  isFavorite 
                    ? 'text-error-500' 
                    : 'text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-800'
                }`}
                title={isFavorite ? 'Remove from favorites' : 'Add to favorites'}
              >
                <Heart className="h-4 w-4" fill={isFavorite ? 'currentColor' : 'none'} />
              </button>
              
              <div className="hidden lg:flex items-center space-x-2">
                <button
                  onClick={toggleMute}
                  disabled={!playerReady}
                  className="p-2 text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-full transition-colors disabled:opacity-50"
                  title={isMuted ? 'Unmute' : 'Mute'}
                >
                  {isMuted ? <VolumeX className="h-4 w-4" /> : <Volume2 className="h-4 w-4" />}
                </button>
                <input
                  type="range"
                  min="0"
                  max="1"
                  step="0.1"
                  value={isMuted ? 0 : volume}
                  onChange={handleVolumeChange}
                  disabled={!playerReady}
                  className="w-20 h-1 bg-gray-200 dark:bg-gray-700 rounded-lg appearance-none cursor-pointer slider disabled:opacity-50"
                  title="Volume"
                />
              </div>
              
              <button
                onClick={onToggleExpanded}
                className="p-2 text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-full transition-colors"
                title={isExpanded ? 'Minimize player' : 'Expand player'}
              >
                {isExpanded ? <Minimize2 className="h-4 w-4" /> : <Maximize2 className="h-4 w-4" />}
              </button>
            </div>
          </div>
          
          {/* Mobile Progress Bar */}
          <div className="md:hidden mt-2">
            <div className="flex items-center space-x-2">
              <span className="text-xs text-gray-600 dark:text-gray-400">
                {formatTime(currentTime)}
              </span>
              <input
                type="range"
                min="0"
                max={duration || 100}
                value={currentTime}
                onChange={handleSeek}
                disabled={!playerReady}
                className="flex-1 h-1 bg-gray-200 dark:bg-gray-700 rounded-lg appearance-none cursor-pointer slider disabled:opacity-50"
              />
              <span className="text-xs text-gray-600 dark:text-gray-400">
                {formatTime(duration)}
              </span>
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default MusicPlayer;