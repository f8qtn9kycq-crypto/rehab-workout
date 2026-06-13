import { createContext, createElement, useContext, useMemo, useState } from 'react';
import en from '../locales/en';
import cleanupLocales from '../locales/cleanup';
import zhTW from '../locales/zh-TW';

export const defaultLanguage = 'zh-TW';
export const supportedLanguages = ['zh-TW', 'en'];

function mergeResource(base, extension) {
  if (!extension || typeof extension !== 'object') return base;

  return Object.entries(extension).reduce((resource, [key, value]) => {
    const current = resource[key];

    return {
      ...resource,
      [key]: value && typeof value === 'object' && !Array.isArray(value)
        ? mergeResource(current && typeof current === 'object' ? current : {}, value)
        : value,
    };
  }, base);
}

const resources = {
  'zh-TW': mergeResource(zhTW, cleanupLocales['zh-TW']),
  en: mergeResource(en, cleanupLocales.en),
};

const storageKey = 'rehab.language.v1';
const I18nContext = createContext(null);

function getSavedLanguage() {
  try {
    const saved = window.localStorage.getItem(storageKey);
    return supportedLanguages.includes(saved) ? saved : defaultLanguage;
  } catch {
    return defaultLanguage;
  }
}

function resolvePath(resource, key) {
  return key.split('.').reduce((value, part) => (value && value[part] !== undefined ? value[part] : undefined), resource);
}

function interpolate(value, params = {}) {
  if (typeof value !== 'string') return value;
  return value.replace(/\{(\w+)\}/g, (_, token) => String(params[token] ?? ''));
}

export function I18nProvider({ children }) {
  const [language, setLanguageState] = useState(getSavedLanguage);

  function setLanguage(nextLanguage) {
    const safeLanguage = supportedLanguages.includes(nextLanguage) ? nextLanguage : defaultLanguage;
    setLanguageState(safeLanguage);
    try {
      window.localStorage.setItem(storageKey, safeLanguage);
    } catch {
      // Local storage is optional; language still updates for the active session.
    }
  }

  const value = useMemo(() => {
    const resource = resources[language] ?? resources[defaultLanguage];
    const fallback = resources[defaultLanguage];

    function t(key, params) {
      const localized = resolvePath(resource, key);
      const fallbackValue = resolvePath(fallback, key);
      return interpolate(localized ?? fallbackValue ?? key, params);
    }

    return { language, setLanguage, t };
  }, [language]);

  return createElement(I18nContext.Provider, { value }, children);
}

export function useI18n() {
  const context = useContext(I18nContext);
  if (!context) {
    throw new Error('useI18n must be used within I18nProvider');
  }
  return context;
}
