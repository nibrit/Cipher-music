import { useState, useEffect } from 'react';

export const useTheme = () => {
  const [isDark, setIsDark] = useState(() => {
    if (typeof window !== 'undefined') {
      const saved = localStorage.getItem('cipher-music-theme');
      if (saved) {
        try {
          const parsed = JSON.parse(saved);
          // Ensure the parsed value is a boolean
          if (typeof parsed === 'boolean') {
            return parsed;
          }
        } catch (error) {
          // If parsing fails, clear the invalid value and fall back to system preference
          localStorage.removeItem('cipher-music-theme');
        }
      }
      return window.matchMedia('(prefers-color-scheme: dark)').matches;
    }
    return false;
  });

  useEffect(() => {
    const root = window.document.documentElement;
    if (isDark) {
      root.classList.add('dark');
    } else {
      root.classList.remove('dark');
    }
    localStorage.setItem('cipher-music-theme', JSON.stringify(isDark));
  }, [isDark]);

  const toggleTheme = () => setIsDark(!isDark);

  return { isDark, toggleTheme };
};