// src/context/ThemeContext.jsx
import { createContext, useContext, useEffect, useState, useCallback } from 'react';

const ThemeContext = createContext(null);
const STORAGE_KEY = 'theme-preference'; // 'light' | 'dark' | 'system'

const getSystemPrefersDark = () =>
  window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches;

const resolveIsDark = (pref) => (pref === 'system' ? getSystemPrefersDark() : pref === 'dark');

export const ThemeProvider = ({ children }) => {
  const [preference, setPreference] = useState(
    () => localStorage.getItem(STORAGE_KEY) || 'system'
  );
  const [isDark, setIsDark] = useState(() => resolveIsDark(preference));

  useEffect(() => {
    document.documentElement.classList.toggle('dark', isDark);
  }, [isDark]);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, preference);
    setIsDark(resolveIsDark(preference));

    if (preference !== 'system') return undefined;
    const mq = window.matchMedia('(prefers-color-scheme: dark)');
    const handler = () => setIsDark(getSystemPrefersDark());
    mq.addEventListener('change', handler);
    return () => mq.removeEventListener('change', handler);
  }, [preference]);

  const setTheme = useCallback((pref) => setPreference(pref), []);

  return (
    <ThemeContext.Provider value={{ preference, isDark, setTheme }}>
      {children}
    </ThemeContext.Provider>
  );
};

export const useTheme = () => {
  const ctx = useContext(ThemeContext);
  if (!ctx) throw new Error('useTheme must be used within a ThemeProvider');
  return ctx;
};
