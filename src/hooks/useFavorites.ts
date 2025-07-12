import { useState, useEffect } from 'react';
import { 
  collection, 
  doc, 
  setDoc, 
  deleteDoc, 
  getDocs, 
  query, 
  orderBy,
  serverTimestamp 
} from 'firebase/firestore';
import { db } from '../config/firebase';
import { useAuth } from './useAuth';
import { YouTubeVideo } from '../types';

export const useFavorites = () => {
  const { user, isAuthenticated } = useAuth();
  const [favorites, setFavorites] = useState<YouTubeVideo[]>([]);
  const [loading, setLoading] = useState(false);
  const [syncing, setSyncing] = useState(false);

  // Load favorites when user authentication state changes
  useEffect(() => {
    if (isAuthenticated && user) {
      loadFavoritesFromCloud();
    } else {
      // Load from localStorage for non-authenticated users
      loadFavoritesFromLocal();
    }
  }, [user, isAuthenticated]);

  const loadFavoritesFromLocal = () => {
    try {
      const saved = localStorage.getItem('cipher-music-favorites');
      if (saved) {
        const localFavorites = JSON.parse(saved);
        setFavorites(localFavorites);
      }
    } catch (error) {
      console.error('Error loading favorites from localStorage:', error);
      setFavorites([]);
    }
  };

  const loadFavoritesFromCloud = async () => {
    if (!user) return;

    try {
      setLoading(true);
      console.log('Loading favorites from cloud for user:', user.uid);
      
      const favoritesRef = collection(db, 'users', user.uid, 'favorites');
      const q = query(favoritesRef, orderBy('addedAt', 'desc'));
      const snapshot = await getDocs(q);
      
      const cloudFavorites: YouTubeVideo[] = [];
      snapshot.forEach((doc) => {
        const data = doc.data();
        // Remove Firestore metadata and keep only the video data
        const { addedAt, ...videoData } = data;
        cloudFavorites.push(videoData as YouTubeVideo);
      });
      
      console.log('Loaded favorites from cloud:', cloudFavorites.length);
      setFavorites(cloudFavorites);
      
      // Also update localStorage as backup
      localStorage.setItem('cipher-music-favorites', JSON.stringify(cloudFavorites));
    } catch (error) {
      console.error('Error loading favorites from cloud:', error);
      // Fall back to localStorage if cloud fails
      loadFavoritesFromLocal();
    } finally {
      setLoading(false);
    }
  };

  const syncLocalToCloud = async () => {
    if (!user) return;

    try {
      setSyncing(true);
      console.log('Syncing local favorites to cloud...');
      
      const localFavorites = localStorage.getItem('cipher-music-favorites');
      if (localFavorites) {
        const favorites = JSON.parse(localFavorites);
        
        // Add each favorite to cloud
        for (const video of favorites) {
          await addFavoriteToCloud(video, false); // Don't update state during sync
        }
        
        // Reload from cloud to get the synced data
        await loadFavoritesFromCloud();
      }
    } catch (error) {
      console.error('Error syncing favorites to cloud:', error);
    } finally {
      setSyncing(false);
    }
  };

  const addFavoriteToCloud = async (video: YouTubeVideo, updateState = true) => {
    if (!user) return;

    try {
      const favoriteRef = doc(db, 'users', user.uid, 'favorites', video.id.videoId);
      await setDoc(favoriteRef, {
        ...video,
        addedAt: serverTimestamp()
      });
      
      console.log('Added favorite to cloud:', video.snippet.title);
    } catch (error) {
      console.error('Error adding favorite to cloud:', error);
      throw error;
    }
  };

  const removeFavoriteFromCloud = async (videoId: string) => {
    if (!user) return;

    try {
      const favoriteRef = doc(db, 'users', user.uid, 'favorites', videoId);
      await deleteDoc(favoriteRef);
      
      console.log('Removed favorite from cloud:', videoId);
    } catch (error) {
      console.error('Error removing favorite from cloud:', error);
      throw error;
    }
  };

  const addFavorite = async (video: YouTubeVideo) => {
    // Check if already exists
    const exists = favorites.find(fav => fav.id.videoId === video.id.videoId);
    if (exists) return;

    // Update local state immediately for better UX
    const newFavorites = [video, ...favorites];
    setFavorites(newFavorites);

    // Update localStorage immediately
    localStorage.setItem('cipher-music-favorites', JSON.stringify(newFavorites));

    // If user is authenticated, also save to cloud
    if (isAuthenticated && user) {
      try {
        await addFavoriteToCloud(video);
      } catch (error) {
        // If cloud save fails, revert local state
        console.error('Failed to save to cloud, reverting local state');
        setFavorites(favorites);
        localStorage.setItem('cipher-music-favorites', JSON.stringify(favorites));
      }
    }
  };

  const removeFavorite = async (videoId: string) => {
    // Update local state immediately
    const newFavorites = favorites.filter(fav => fav.id.videoId !== videoId);
    setFavorites(newFavorites);

    // Update localStorage immediately
    localStorage.setItem('cipher-music-favorites', JSON.stringify(newFavorites));

    // If user is authenticated, also remove from cloud
    if (isAuthenticated && user) {
      try {
        await removeFavoriteFromCloud(videoId);
      } catch (error) {
        // If cloud removal fails, revert local state
        console.error('Failed to remove from cloud, reverting local state');
        setFavorites(favorites);
        localStorage.setItem('cipher-music-favorites', JSON.stringify(favorites));
      }
    }
  };

  const isFavorite = (videoId: string) => {
    return favorites.some(fav => fav.id.videoId === videoId);
  };

  return { 
    favorites, 
    addFavorite, 
    removeFavorite, 
    isFavorite, 
    loading,
    syncing,
    syncLocalToCloud,
    loadFavoritesFromCloud
  };
};