import React, { createContext, useContext, useEffect, useState } from 'react';

export type Theme = 'sakura' | 'midnight' | 'lavender' | 'ocean' | 'forest' | 'minimal' | 'classic' | 'galaxy' | 'panda-paradise';

interface ThemeContextType {
  theme: Theme;
  setTheme: (theme: Theme) => void;
  introSeen: boolean;
  setIntroSeen: (seen: boolean) => void;
}

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

export function ThemeProvider({ children }: { children: React.ReactNode }) {
  const [theme, setTheme] = useState<Theme>(() => {
    return (localStorage.getItem('forever_us_theme') as Theme) || 'sakura';
  });
  
  const [introSeen, setIntroSeen] = useState<boolean>(() => {
    return localStorage.getItem('forever_us_intro_seen') === 'true';
  });

  useEffect(() => {
    document.documentElement.dataset.theme = theme;
    localStorage.setItem('forever_us_theme', theme);
  }, [theme]);

  useEffect(() => {
    localStorage.setItem('forever_us_intro_seen', String(introSeen));
  }, [introSeen]);

  return (
    <ThemeContext.Provider value={{ theme, setTheme, introSeen, setIntroSeen }}>
      {children}
    </ThemeContext.Provider>
  );
}

export function useTheme() {
  const context = useContext(ThemeContext);
  if (context === undefined) {
    throw new Error('useTheme must be used within a ThemeProvider');
  }
  return context;
}
