import { useState, useCallback, useEffect } from 'react';
import { YouTubeVideo } from '../types';

export const useMusicPlayer = () => {
  const [currentVideo, setCurrentVideo] = useState<YouTubeVideo | null>(null);
  const [playlist, setPlaylist] = useState<YouTubeVideo[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isPlaying, setIsPlaying] = useState(false);
  const [isExpanded, setIsExpanded] = useState(false);
  const [isRepeat, setIsRepeat] = useState(false);
  const [isShuffle, setIsShuffle] = useState(false);
  const [apiReady, setApiReady] = useState(false);

  // Load YouTube IFrame API
  useEffect(() => {
    if (!window.YT && !document.querySelector('script[src*="youtube.com/iframe_api"]')) {
      const tag = document.createElement('script');
      tag.src = 'https://www.youtube.com/iframe_api';
      tag.async = true;
      const firstScriptTag = document.getElementsByTagName('script')[0];
      firstScriptTag.parentNode?.insertBefore(tag, firstScriptTag);

      // Set up the callback for when API is ready
      window.onYouTubeIframeAPIReady = () => {
        console.log('YouTube IFrame API Ready');
        setApiReady(true);
      };
    } else if (window.YT && window.YT.Player) {
      setApiReady(true);
    }
  }, []);

  const playVideo = useCallback((video: YouTubeVideo, videoList?: YouTubeVideo[]) => {
    setCurrentVideo(video);
    
    if (videoList) {
      setPlaylist(videoList);
      const index = videoList.findIndex(v => v.id.videoId === video.id.videoId);
      setCurrentIndex(index >= 0 ? index : 0);
    } else if (playlist.length === 0) {
      setPlaylist([video]);
      setCurrentIndex(0);
    }
  }, [playlist]);

  const playNext = useCallback(() => {
    if (playlist.length === 0) return;
    
    let nextIndex;
    if (isShuffle) {
      nextIndex = Math.floor(Math.random() * playlist.length);
    } else {
      nextIndex = (currentIndex + 1) % playlist.length;
    }
    
    setCurrentIndex(nextIndex);
    setCurrentVideo(playlist[nextIndex]);
  }, [playlist, currentIndex, isShuffle]);

  const playPrevious = useCallback(() => {
    if (playlist.length === 0) return;
    
    let prevIndex;
    if (isShuffle) {
      prevIndex = Math.floor(Math.random() * playlist.length);
    } else {
      prevIndex = currentIndex === 0 ? playlist.length - 1 : currentIndex - 1;
    }
    
    setCurrentIndex(prevIndex);
    setCurrentVideo(playlist[prevIndex]);
  }, [playlist, currentIndex, isShuffle]);

  const addToPlaylist = useCallback((video: YouTubeVideo) => {
    setPlaylist(prev => {
      const exists = prev.find(v => v.id.videoId === video.id.videoId);
      if (!exists) {
        return [...prev, video];
      }
      return prev;
    });
  }, []);

  const removeFromPlaylist = useCallback((videoId: string) => {
    setPlaylist(prev => {
      const newPlaylist = prev.filter(v => v.id.videoId !== videoId);
      const removedIndex = prev.findIndex(v => v.id.videoId === videoId);
      
      if (removedIndex === currentIndex && newPlaylist.length > 0) {
        const newIndex = Math.min(currentIndex, newPlaylist.length - 1);
        setCurrentIndex(newIndex);
        setCurrentVideo(newPlaylist[newIndex]);
      } else if (removedIndex < currentIndex) {
        setCurrentIndex(prev => prev - 1);
      }
      
      return newPlaylist;
    });
  }, [currentIndex]);

  const clearPlaylist = useCallback(() => {
    setPlaylist([]);
    setCurrentVideo(null);
    setCurrentIndex(0);
    setIsPlaying(false);
  }, []);

  const toggleExpanded = useCallback(() => {
    setIsExpanded(prev => !prev);
  }, []);

  const toggleRepeat = useCallback(() => {
    setIsRepeat(prev => !prev);
  }, []);

  const toggleShuffle = useCallback(() => {
    setIsShuffle(prev => !prev);
  }, []);

  return {
    // State
    currentVideo,
    playlist,
    currentIndex,
    isPlaying,
    isExpanded,
    isRepeat,
    isShuffle,
    apiReady,
    
    // Actions
    playVideo,
    playNext,
    playPrevious,
    addToPlaylist,
    removeFromPlaylist,
    clearPlaylist,
    toggleExpanded,
    toggleRepeat,
    toggleShuffle,
    setIsPlaying,
  };
};