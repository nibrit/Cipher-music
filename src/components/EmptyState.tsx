import React from 'react';
import { Search, Music } from 'lucide-react';

interface EmptyStateProps {
  type?: 'search' | 'favorites' | 'error';
  message?: string;
  onAction?: () => void;
  actionLabel?: string;
}

const EmptyState: React.FC<EmptyStateProps> = ({ 
  type = 'search', 
  message, 
  onAction, 
  actionLabel 
}) => {
  const getIcon = () => {
    switch (type) {
      case 'search':
        return <Search className="h-16 w-16 text-gray-300 dark:text-gray-600" />;
      case 'favorites':
        return <Music className="h-16 w-16 text-gray-300 dark:text-gray-600" />;
      case 'error':
        return <div className="text-4xl">😕</div>;
      default:
        return <Search className="h-16 w-16 text-gray-300 dark:text-gray-600" />;
    }
  };

  const getDefaultMessage = () => {
    switch (type) {
      case 'search':
        return 'Start by searching for your favorite songs or explore our music categories';
      case 'favorites':
        return 'You haven\'t added any favorites yet. Start exploring music to build your collection!';
      case 'error':
        return 'Something went wrong. Please try again.';
      default:
        return 'No results found';
    }
  };

  return (
    <div className="flex flex-col items-center justify-center py-16 px-4 text-center">
      <div className="mb-6">
        {getIcon()}
      </div>
      
      <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">
        {type === 'search' && 'Discover Amazing Music'}
        {type === 'favorites' && 'No Favorites Yet'}
        {type === 'error' && 'Oops!'}
      </h3>
      
      <p className="text-gray-600 dark:text-gray-400 mb-6 max-w-md">
        {message || getDefaultMessage()}
      </p>
      
      {onAction && actionLabel && (
        <button
          onClick={onAction}
          className="px-6 py-3 bg-primary-600 hover:bg-primary-700 text-white rounded-full font-medium transition-colors"
        >
          {actionLabel}
        </button>
      )}
    </div>
  );
};

export default EmptyState;