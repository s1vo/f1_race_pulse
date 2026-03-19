import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { t as translate } from '../utils/i18n';

const AppContext = createContext();

export function AppProvider({ children }) {
  const [language, setLanguage] = useState(() =>
    localStorage.getItem('rp_lang') || 'EN'
  );
  const [timezone, setTimezone] = useState(() => {
    const saved = localStorage.getItem('rp_tz');
    if (saved) return saved;
    // Auto-detect timezone
    try {
      return Intl.DateTimeFormat().resolvedOptions().timeZone;
    } catch {
      return 'UTC';
    }
  });
  const [timezoneAutoDetected, setTimezoneAutoDetected] = useState(
    () => !localStorage.getItem('rp_tz')
  );
  const [favorites, setFavorites] = useState(() => {
    try {
      return JSON.parse(localStorage.getItem('rp_favs') || '[]');
    } catch { return []; }
  });

  useEffect(() => { localStorage.setItem('rp_lang', language); }, [language]);
  useEffect(() => {
    localStorage.setItem('rp_tz', timezone);
    setTimezoneAutoDetected(false);
  }, [timezone]);
  useEffect(() => { localStorage.setItem('rp_favs', JSON.stringify(favorites)); }, [favorites]);

  const toggleFavorite = (driverNumber) => {
    setFavorites(prev =>
      prev.includes(driverNumber)
        ? prev.filter(n => n !== driverNumber)
        : [...prev, driverNumber]
    );
  };

  const t = useCallback((key) => translate(key, language), [language]);

  return (
    <AppContext.Provider value={{
      language, setLanguage,
      timezone, setTimezone,
      timezoneAutoDetected,
      favorites, toggleFavorite,
      t,
    }}>
      {children}
    </AppContext.Provider>
  );
}

export function useAppContext() {
  return useContext(AppContext);
}
