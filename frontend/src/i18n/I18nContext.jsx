import { createContext, useContext, useState, useEffect, useCallback } from 'react';
import enTranslations from './en.json';
import arTranslations from './ar.json';

// ── Translation map (cached at module level) ────────────────────
const translationCache = {
  en: enTranslations,
  ar: arTranslations,
};

const SUPPORTED_LANGS = ['en', 'ar'];
const STORAGE_KEY = 'fursa_lang';

/**
 * Detect the user's preferred language from browser settings.
 * Falls back to 'en' if the browser language isn't supported.
 */
function detectBrowserLang() {
  const browserLang = navigator.language?.split('-')[0] || 'en';
  return SUPPORTED_LANGS.includes(browserLang) ? browserLang : 'en';
}

// ── Context ─────────────────────────────────────────────────────
const I18nContext = createContext(null);

/**
 * I18nProvider – Wraps the app and provides translation utilities.
 * - Auto-detects browser language on first visit
 * - Persists language choice in localStorage
 * - Applies dir (ltr/rtl) and lang attribute to <html>
 */
export function I18nProvider({ children }) {
  const [lang, setLangState] = useState(() => {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (stored && SUPPORTED_LANGS.includes(stored)) return stored;
    return detectBrowserLang();
  });

  // Direction derived from language
  const dir = lang === 'ar' ? 'rtl' : 'ltr';

  // Apply html attributes whenever language changes
  useEffect(() => {
    document.documentElement.lang = lang;
    document.documentElement.dir = dir;
    localStorage.setItem(STORAGE_KEY, lang);
  }, [lang, dir]);

  // Setter that validates the language
  const setLang = useCallback((newLang) => {
    if (SUPPORTED_LANGS.includes(newLang)) {
      setLangState(newLang);
    }
  }, []);

  /**
   * t(key) – Translate a dot-notation key, e.g. "nav.home".
   * Returns the key itself if not found (aids debugging).
   */
  const t = useCallback((key) => {
    const translations = translationCache[lang] || translationCache.en;
    const parts = key.split('.');
    let result = translations;
    for (const part of parts) {
      if (result && typeof result === 'object' && part in result) {
        result = result[part];
      } else {
        // Fallback to English, then to key itself
        let fallback = translationCache.en;
        for (const p of parts) {
          if (fallback && typeof fallback === 'object' && p in fallback) {
            fallback = fallback[p];
          } else {
            return key; // not found anywhere
          }
        }
        return typeof fallback === 'string' ? fallback : key;
      }
    }
    return typeof result === 'string' ? result : key;
  }, [lang]);

  return (
    <I18nContext.Provider value={{ t, lang, setLang, dir }}>
      {children}
    </I18nContext.Provider>
  );
}

/**
 * useI18n() – Hook to access translation function and language state.
 * Returns: { t, lang, setLang, dir }
 */
export function useI18n() {
  const ctx = useContext(I18nContext);
  if (!ctx) throw new Error('useI18n must be used within an I18nProvider');
  return ctx;
}
