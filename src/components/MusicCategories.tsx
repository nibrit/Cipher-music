import React from 'react';
import { 
  Zap, 
  Heart, 
  Headphones, 
  Guitar, 
  Disc, 
  Radio,
  Volume2,
  Music2
} from 'lucide-react';
import { MusicCategory } from '../types';

const categories: MusicCategory[] = [
  { id: 'trending', name: 'Trending', query: 'trending music 2024', icon: 'Zap' },
  { id: 'pop', name: 'Pop', query: 'pop music hits', icon: 'Heart' },
  { id: 'rock', name: 'Rock', query: 'rock music classics', icon: 'Guitar' },
  { id: 'hiphop', name: 'Hip Hop', query: 'hip hop rap music', icon: 'Headphones' },
  { id: 'electronic', name: 'Electronic', query: 'electronic dance music', icon: 'Disc' },
  { id: 'indie', name: 'Indie', query: 'indie alternative music', icon: 'Radio' },
  { id: 'jazz', name: 'Jazz', query: 'jazz music smooth', icon: 'Volume2' },
  { id: 'classical', name: 'Classical', query: 'classical music orchestral', icon: 'Music2' },
];

const iconMap = {
  Zap, Heart, Guitar, Headphones, Disc, Radio, Volume2, Music2
};

interface MusicCategoriesProps {
  onCategorySelect: (query: string) => void;
  loading?: boolean;
}

const MusicCategories: React.FC<MusicCategoriesProps> = ({ onCategorySelect, loading }) => {
  return (
    <div className="w-full">
      <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-6 text-center">
        Explore Music
      </h2>
      
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
        {categories.map((category) => {
          const IconComponent = iconMap[category.icon as keyof typeof iconMap];
          
          return (
            <button
              key={category.id}
              onClick={() => onCategorySelect(category.query)}
              disabled={loading}
              className={`
                group relative p-6 bg-white dark:bg-gray-800 rounded-xl shadow-md 
                hover:shadow-lg transition-all duration-300 hover:-translate-y-1
                border border-gray-200 dark:border-gray-700 
                hover:border-primary-300 dark:hover:border-primary-600
                disabled:opacity-50 disabled:cursor-not-allowed
                focus:outline-none focus:ring-2 focus:ring-primary-500 focus:ring-offset-2
              `}
            >
              {/* Background Gradient */}
              <div className="absolute inset-0 bg-gradient-to-br from-primary-500/5 to-secondary-500/5 rounded-xl opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
              
              {/* Content */}
              <div className="relative flex flex-col items-center space-y-3">
                <div className="p-3 bg-primary-100 dark:bg-primary-900/30 rounded-full group-hover:bg-primary-200 dark:group-hover:bg-primary-800/50 transition-colors">
                  <IconComponent className="h-6 w-6 text-primary-600 dark:text-primary-400" />
                </div>
                <span className="font-medium text-gray-900 dark:text-white group-hover:text-primary-600 dark:group-hover:text-primary-400 transition-colors">
                  {category.name}
                </span>
              </div>
              
              {/* Loading Overlay */}
              {loading && (
                <div className="absolute inset-0 bg-white/80 dark:bg-gray-800/80 rounded-xl flex items-center justify-center">
                  <div className="animate-spin rounded-full h-6 w-6 border-2 border-primary-500 border-t-transparent" />
                </div>
              )}
            </button>
          );
        })}
      </div>
    </div>
  );
};

export default MusicCategories;