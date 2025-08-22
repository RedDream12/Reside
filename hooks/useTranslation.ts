import { useState, useEffect, useCallback } from 'react';
import { useStore } from '../store';

let translations: Record<string, string> = {};
let currentLanguage = '';

export const useTranslation = () => {
  const { language } = useStore(state => state.settings);
  const [isLoaded, setIsLoaded] = useState(false);

  useEffect(() => {
    if (currentLanguage === language && Object.keys(translations).length > 0) {
      setIsLoaded(true);
      return;
    }

    const loadTranslations = async () => {
      try {
        const response = await fetch(`/locales/${language}.json`);
        if (!response.ok) {
            // Fallback to English if the language file is not found
            const fallbackResponse = await fetch(`/locales/en.json`);
            translations = await fallbackResponse.json();
        } else {
             translations = await response.json();
        }
        currentLanguage = language;
        setIsLoaded(true);
      } catch (error) {
        console.error('Failed to load translations:', error);
        setIsLoaded(true); // Still allow app to render
      }
    };
    
    loadTranslations();
  }, [language]);

  const t = useCallback((key: string, params?: Record<string, string | number>): string => {
    let translation = translations[key] || key;

    if (params) {
      Object.keys(params).forEach(paramKey => {
        translation = translation.replace(`{{${paramKey}}}`, String(params[paramKey]));
      });
    }

    return translation;
  }, []);

  return { t, isLoaded, lang: language };
};
