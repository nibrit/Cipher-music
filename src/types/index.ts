export interface YouTubeVideo {
  id: {
    videoId: string;
  };
  snippet: {
    title: string;
    description: string;
    thumbnails: {
      default: { url: string; width: number; height: number };
      medium: { url: string; width: number; height: number };
      high: { url: string; width: number; height: number };
    };
    channelTitle: string;
    publishedAt: string;
  };
}

export interface SearchResponse {
  items: YouTubeVideo[];
  nextPageToken?: string;
  pageInfo: {
    totalResults: number;
    resultsPerPage: number;
  };
}

export interface MusicCategory {
  id: string;
  name: string;
  query: string;
  icon: string;
}

export interface Theme {
  isDark: boolean;
}

export interface MusicPlayerState {
  currentVideo: YouTubeVideo | null;
  playlist: YouTubeVideo[];
  currentIndex: number;
  isPlaying: boolean;
  isExpanded: boolean;
  volume: number;
  currentTime: number;
  duration: number;
}