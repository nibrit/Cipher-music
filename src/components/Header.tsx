import React, { useState } from 'react';
import { Music, Sun, Moon, Heart, LogIn, User, LogOut, Cloud, CloudOff } from 'lucide-react';
import { useTheme } from '../hooks/useTheme';
import { useAuth } from '../hooks/useAuth';
import { useFavorites } from '../hooks/useFavorites';

interface HeaderProps {
  onShowFavorites: () => void;
  onShowAuth: () => void;
  favoritesCount: number;
}

const Header: React.FC<HeaderProps> = ({ onShowFavorites, onShowAuth, favoritesCount }) => {
  const { isDark, toggleTheme } = useTheme();
  const { user, signOut, isAuthenticated } = useAuth();
  const { syncing } = useFavorites();
  const [showUserMenu, setShowUserMenu] = useState(false);

  const handleSignOut = async () => {
    await signOut();
    setShowUserMenu(false);
  };

  return (
    <header className="sticky top-0 z-50 bg-white/80 dark:bg-gray-900/80 backdrop-blur-md border-b border-gray-200 dark:border-gray-800">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          <div className="flex items-center space-x-3">
            <div className="relative">
              <Music className="h-8 w-8 text-primary-600 dark:text-primary-400" />
              <div className="absolute -top-1 -right-1 w-3 h-3 bg-accent-500 rounded-full animate-pulse" />
            </div>
            <div>
              <h1 className="text-xl font-bold text-gray-900 dark:text-white">
                Cipher Music
              </h1>
              <p className="text-xs text-gray-500 dark:text-gray-400">
                Listen to Music for Free
              </p>
            </div>
          </div>
          
          <div className="flex items-center space-x-4">
            {/* Cloud Sync Status */}
            {isAuthenticated && (
              <div className="flex items-center space-x-1 text-xs text-gray-500 dark:text-gray-400">
                {syncing ? (
                  <>
                    <Cloud className="h-4 w-4 animate-pulse text-primary-500" />
                    <span>Syncing...</span>
                  </>
                ) : (
                  <>
                    <Cloud className="h-4 w-4 text-success-500" />
                    <span className="hidden sm:block">Synced</span>
                  </>
                )}
              </div>
            )}
            
            {/* Favorites Button */}
            <button
              onClick={onShowFavorites}
              className="relative p-2 rounded-full bg-gray-100 dark:bg-gray-800 hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors"
              title="View Favorites"
            >
              <Heart className="h-5 w-5 text-gray-600 dark:text-gray-300" />
              {favoritesCount > 0 && (
                <div className="absolute -top-1 -right-1 bg-error-500 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center">
                  {favoritesCount > 9 ? '9+' : favoritesCount}
                </div>
              )}
            </button>
            
            {/* Theme Toggle */}
            <button
              onClick={toggleTheme}
              className="p-2 rounded-full bg-gray-100 dark:bg-gray-800 hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors"
              title={isDark ? 'Switch to Light Mode' : 'Switch to Dark Mode'}
            >
              {isDark ? (
                <Sun className="h-5 w-5 text-yellow-500" />
              ) : (
                <Moon className="h-5 w-5 text-gray-600" />
              )}
            </button>
            
            {/* User Authentication */}
            {isAuthenticated && user ? (
              <div className="relative">
                <button
                  onClick={() => setShowUserMenu(!showUserMenu)}
                  className="flex items-center space-x-2 p-2 rounded-full bg-gray-100 dark:bg-gray-800 hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors"
                >
                  {user.photoURL ? (
                    <img
                      src={user.photoURL}
                      alt={user.displayName || 'User'}
                      className="w-6 h-6 rounded-full"
                    />
                  ) : (
                    <User className="h-5 w-5 text-gray-600 dark:text-gray-300" />
                  )}
                  <span className="hidden sm:block text-sm font-medium text-gray-700 dark:text-gray-300">
                    {user.displayName?.split(' ')[0] || 'User'}
                  </span>
                </button>
                
                {/* User Menu Dropdown */}
                {showUserMenu && (
                  <div className="absolute right-0 mt-2 w-48 bg-white dark:bg-gray-800 rounded-lg shadow-lg border border-gray-200 dark:border-gray-700 py-2">
                    <div className="px-4 py-2 border-b border-gray-200 dark:border-gray-700">
                      <p className="text-sm font-medium text-gray-900 dark:text-white">
                        {user.displayName}
                      </p>
                      <p className="text-xs text-gray-500 dark:text-gray-400 truncate">
                        {user.email}
                      </p>
                      <div className="flex items-center space-x-1 mt-1">
                        <Cloud className="h-3 w-3 text-success-500" />
                        <span className="text-xs text-success-600 dark:text-success-400">
                          Cloud Storage Active
                        </span>
                      </div>
                    </div>
                    <button
                      onClick={handleSignOut}
                      className="w-full flex items-center space-x-2 px-4 py-2 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
                    >
                      <LogOut className="h-4 w-4" />
                      <span>Sign Out</span>
                    </button>
                  </div>
                )}
              </div>
            ) : (
              <button
                onClick={onShowAuth}
                className="flex items-center space-x-2 px-4 py-2 bg-primary-600 hover:bg-primary-700 text-white rounded-full font-medium transition-colors"
              >
                <LogIn className="h-4 w-4" />
                <span className="hidden sm:block">Sign In</span>
              </button>
            )}
          </div>
        </div>
      </div>
    </header>
  );
};

export default Header;