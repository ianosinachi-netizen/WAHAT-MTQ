import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { locales, LanguageCode } from '../locales';

export interface Language {
  code: string;
  name: string;
  isRTL?: boolean;
  flag?: string;
}

export const LANGUAGES: Language[] = [
  { code: 'en', name: 'English', flag: '🇺🇸' },
  { code: 'ar', name: 'العربية', isRTL: true, flag: '🇸🇦' },
  { code: 'fr', name: 'Français', flag: '🇫🇷' },
  { code: 'es', name: 'Español', flag: '🇪🇸' },
  { code: 'pt', name: 'Português', flag: '🇧🇷' },
  { code: 'pl', name: 'Polski', flag: '🇵🇱' },
];

interface LanguageContextType {
  currentLanguage: Language;
  setLanguage: (lang: Language) => void;
  t: (text: string) => string;
  isRTL: boolean;
}

const LanguageContext = createContext<LanguageContextType | undefined>(undefined);

export const LanguageProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [currentLanguage, setCurrentLanguageState] = useState<Language>(() => {
    const saved = localStorage.getItem('app_language');
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        // Only allow supported languages
        if (LANGUAGES.find(l => l.code === parsed.code)) {
          return parsed;
        }
      } catch (e) {
        return LANGUAGES[0];
      }
    }
    return LANGUAGES[0];
  });

  useEffect(() => {
    localStorage.setItem('app_language', JSON.stringify(currentLanguage));
    document.documentElement.dir = currentLanguage.isRTL ? 'rtl' : 'ltr';
    document.documentElement.lang = currentLanguage.code;
  }, [currentLanguage]);

  const setLanguage = useCallback((lang: Language) => {
    setCurrentLanguageState(lang);
  }, []);

  const t = useCallback((text: string): string => {
    if (!text) return text;

    const locale = locales[currentLanguage.code as LanguageCode];
    const enLocale = locales['en'];

    if (locale && (locale as any)[text]) {
      return (locale as any)[text];
    }
    
    // Fallback to English if key exists there
    if (enLocale && (enLocale as any)[text]) {
      return (enLocale as any)[text];
    }

    return text;
  }, [currentLanguage.code]);

  return (
    <LanguageContext.Provider value={{ 
      currentLanguage, 
      setLanguage, 
      t, 
      isRTL: !!currentLanguage.isRTL,
    }}>
      {children}
    </LanguageContext.Provider>
  );
};

export const useLanguage = () => {
  const context = useContext(LanguageContext);
  if (context === undefined) {
    throw new Error('useLanguage must be used within a LanguageProvider');
  }
  return context;
};
