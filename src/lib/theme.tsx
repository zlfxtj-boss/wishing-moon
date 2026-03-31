'use client';

import React, { createContext, useContext, useEffect, useState, useCallback } from 'react';
import type { Theme, ThemeContextType } from '@/types';

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

const STORAGE_KEY = 'wishing-moon-theme';

export function ThemeProvider({ children }: { children: React.ReactNode }) {
  const [theme, setThemeState] = useState<Theme>('cyberpunk');
  const [mounted, setMounted] = useState(false);

  // Apply theme to document via data-theme attribute (CSS vars defined in globals.css)
  const applyTheme = useCallback((newTheme: Theme) => {
    document.documentElement.setAttribute('data-theme', newTheme);
    localStorage.setItem(STORAGE_KEY, newTheme);
  }, []);

  useEffect(() => {
    // Load from localStorage on mount
    const stored = localStorage.getItem(STORAGE_KEY) as Theme | null;
    const validTheme = (stored === 'cyberpunk' || stored === 'oil-painting') 
      ? stored 
      : 'cyberpunk';
    
    setThemeState(validTheme);
    applyTheme(validTheme);
    setMounted(true);
  }, [applyTheme]);

  useEffect(() => {
    if (mounted) {
      applyTheme(theme);
    }
  }, [theme, mounted, applyTheme]);

  const setTheme = useCallback((newTheme: Theme) => {
    setThemeState(newTheme);
  }, []);

  const toggleTheme = useCallback(() => {
    setThemeState((prev) => (prev === 'cyberpunk' ? 'oil-painting' : 'cyberpunk'));
  }, []);

  // Prevent hydration mismatch by using default value until mounted
  const contextValue: ThemeContextType = {
    theme: mounted ? theme : 'cyberpunk',
    setTheme,
    toggleTheme,
  };

  return (
    <ThemeContext.Provider value={contextValue}>
      {children}
    </ThemeContext.Provider>
  );
}

export function useTheme(): ThemeContextType {
  const context = useContext(ThemeContext);
  if (!context) {
    throw new Error('useTheme must be used within a ThemeProvider');
  }
  return context;
}
