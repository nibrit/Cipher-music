import { SearchResponse } from '../types';

const API_KEY = 'AIzaSyDqDCVyov4UBFV-blt-ECCnhx7hEllekww';
const BASE_URL = 'https://www.googleapis.com/youtube/v3';

export const searchYouTubeVideos = async (
  query: string,
  maxResults: number = 20,
  pageToken?: string
): Promise<SearchResponse> => {
  const params = new URLSearchParams({
    part: 'snippet',
    type: 'video',
    maxResults: maxResults.toString(),
    q: `${query} music`,
    key: API_KEY,
    videoCategoryId: '10', // Music category
    videoEmbeddable: 'true', // Only get embeddable videos
    videoSyndicated: 'true', // Only get videos that can be played outside YouTube
    ...(pageToken && { pageToken }),
  });

  try {
    const response = await fetch(`${BASE_URL}/search?${params}`);
    
    if (!response.ok) {
      throw new Error(`YouTube API error: ${response.status}`);
    }
    
    const data = await response.json();
    return data;
  } catch (error) {
    console.error('Error fetching YouTube videos:', error);
    throw error;
  }
};

export const getTrendingMusic = async (): Promise<SearchResponse> => {
  return searchYouTubeVideos('trending music 2024', 12);
};

export const getMusicByGenre = async (genre: string): Promise<SearchResponse> => {
  return searchYouTubeVideos(`${genre} music`, 8);
};

export const getVideoUrl = (videoId: string, autoplay: boolean = false): string => {
  const params = new URLSearchParams({
    ...(autoplay && { autoplay: '1' }),
    rel: '0', // Don't show related videos
    modestbranding: '1', // Minimal YouTube branding
    iv_load_policy: '3', // Hide annotations
    fs: '1', // Allow fullscreen
    cc_load_policy: '0', // Hide closed captions by default
    disablekb: '0', // Enable keyboard controls
    enablejsapi: '1', // Enable JavaScript API
  });
  
  return `https://www.youtube.com/embed/${videoId}?${params}`;
};