'use client';

import React, { createContext, useContext, useState, useEffect } from 'react';
import en from '@/locales/en.json';
import uz from '@/locales/uz.json';
import ru from '@/locales/ru.json';
import axios from 'axios';

type Language = 'en' | 'uz' | 'ru';

interface LanguageContextType {
  language: Language;
  setLanguage: (lang: Language) => void;
  t: (path: string) => string;
}

const locales: Record<Language, any> = { en, uz, ru };

const LanguageContext = createContext<LanguageContextType | undefined>(undefined);

export function LanguageProvider({ children }: { children: React.ReactNode }) {
  const [language, setLanguageState] = useState<Language>('en');

  useEffect(() => {
    // Read persisted language on client side load
    const stored = localStorage.getItem('impr0ve-lang') as Language;
    if (stored && ['en', 'uz', 'ru'].includes(stored)) {
      setLanguageState(stored);
    }
  }, []);

  const setLanguage = async (lang: Language) => {
    setLanguageState(lang);
    localStorage.setItem('impr0ve-lang', lang);
    document.documentElement.lang = lang;

    // Sync preference to user backend settings
    try {
      await axios.patch('/api/settings', { locale: lang }, {
        headers: {
          Authorization: `Bearer ${localStorage.getItem('token') || ''}`
        }
      });
    } catch (e) {
      console.warn('Failed to sync locale to backend', e);
    }
  };

  const t = (path: string): string => {
    const keys = path.split('.');
    let currentTrans = locales[language];
    let currentFallback = locales['en'];

    // Nested lookup in active locale
    for (const key of keys) {
      if (currentTrans && currentTrans[key] !== undefined) {
        currentTrans = currentTrans[key];
      } else {
        currentTrans = null;
        break;
      }
    }

    if (currentTrans && typeof currentTrans === 'string') {
      return currentTrans;
    }

    // Lookup fallback in English locale
    for (const key of keys) {
      if (currentFallback && currentFallback[key] !== undefined) {
        currentFallback = currentFallback[key];
      } else {
        currentFallback = path;
        break;
      }
    }

    return typeof currentFallback === 'string' ? currentFallback : path;
  };

  return (
    <LanguageContext.Provider value={{ language, setLanguage, t }}>
      {children}
    </LanguageContext.Provider>
  );
}

export function useLanguage() {
  const context = useContext(LanguageContext);
  if (!context) {
    throw new Error('useLanguage must be used within a LanguageProvider');
  }
  return context;
}
