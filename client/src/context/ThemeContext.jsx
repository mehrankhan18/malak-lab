import React, { createContext, useState, useEffect, useContext } from 'react';
import { themes } from './themes';

const ThemeContext = createContext();

export function ThemeProvider({ children }) {
  const [theme, setTheme] = useState(() => {
    if (typeof window !== 'undefined') {
      const saved = localStorage.getItem('malak_theme');
      return saved && themes[saved] ? saved : 'dark';
    }
    return 'dark';
  });

  useEffect(() => {
    localStorage.setItem('malak_theme', theme);
    document.body.className = '';
    document.body.classList.add(`theme-${theme}`);
    document.body.style.backgroundColor = themes[theme].bg;
    document.body.style.color = themes[theme].text;
  }, [theme]);

  return (
    <ThemeContext.Provider value={{ theme, setTheme, themes }}>
      {children}
    </ThemeContext.Provider>
  );
}

export function useTheme() {
  return useContext(ThemeContext);
}