import React, { useState, useCallback, useRef, useEffect } from 'react';
import { Search, Mic, X } from 'lucide-react';

interface SearchBarProps {
  onSearch: (query: string) => void;
  loading?: boolean;
}

const SearchBar: React.FC<SearchBarProps> = ({ onSearch, loading = false }) => {
  const [query, setQuery] = useState('');
  const [isFocused, setIsFocused] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  const handleSubmit = useCallback((e: React.FormEvent) => {
    e.preventDefault();
    if (query.trim()) {
      onSearch(query.trim());
    }
  }, [query, onSearch]);

  const handleClear = () => {
    setQuery('');
    inputRef.current?.focus();
  };

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === '/' && !isFocused) {
        e.preventDefault();
        inputRef.current?.focus();
      }
    };

    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [isFocused]);

  return (
    <div className="w-full max-w-2xl mx-auto">
      <form onSubmit={handleSubmit} className="relative">
        <div className={`
          relative flex items-center bg-white dark:bg-gray-800 rounded-full shadow-lg 
          border-2 transition-all duration-300 overflow-hidden
          ${isFocused 
            ? 'border-primary-500 shadow-primary-500/20 shadow-xl scale-105' 
            : 'border-gray-200 dark:border-gray-700 hover:border-gray-300 dark:hover:border-gray-600'
          }
        `}>
          <div className="pl-6 pr-3">
            <Search className={`h-5 w-5 transition-colors ${
              isFocused ? 'text-primary-500' : 'text-gray-400'
            }`} />
          </div>
          
          <input
            ref={inputRef}
            type="text"
            placeholder="Search for songs, artists, or albums..."
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            onFocus={() => setIsFocused(true)}
            onBlur={() => setIsFocused(false)}
            className="flex-1 py-4 px-2 bg-transparent text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400 focus:outline-none"
            disabled={loading}
          />
          
          {query && (
            <button
              type="button"
              onClick={handleClear}
              className="p-2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 transition-colors"
            >
              <X className="h-4 w-4" />
            </button>
          )}
          
          <div className="flex items-center space-x-2 pr-2">
            <button
              type="button"
              className="p-2 text-gray-400 hover:text-primary-500 transition-colors rounded-full hover:bg-gray-100 dark:hover:bg-gray-700"
              title="Voice Search (Coming Soon)"
            >
              <Mic className="h-4 w-4" />
            </button>
            
            <button
              type="submit"
              disabled={!query.trim() || loading}
              className={`
                px-6 py-2 rounded-full font-medium transition-all duration-200
                ${query.trim() && !loading
                  ? 'bg-primary-600 hover:bg-primary-700 text-white shadow-lg hover:shadow-xl active:scale-95' 
                  : 'bg-gray-100 dark:bg-gray-700 text-gray-400 cursor-not-allowed'
                }
              `}
            >
              {loading ? (
                <div className="animate-spin rounded-full h-4 w-4 border-2 border-white border-t-transparent" />
              ) : (
                'Search'
              )}
            </button>
          </div>
        </div>
        
        {!isFocused && (
          <div className="absolute -bottom-6 left-1/2 transform -translate-x-1/2 text-xs text-gray-400 dark:text-gray-500">
            Press <kbd className="px-2 py-1 bg-gray-100 dark:bg-gray-800 rounded text-xs">/</kbd> to focus search
          </div>
        )}
      </form>
    </div>
  );
};

export default SearchBar;