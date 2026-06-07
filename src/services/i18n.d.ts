import type { ReactNode } from 'react';

export type AppLanguage = 'zh-TW' | 'en';

export const defaultLanguage: AppLanguage;
export const supportedLanguages: AppLanguage[];

export function I18nProvider({ children }: { children: ReactNode }): JSX.Element;

export function useI18n(): {
  language: AppLanguage;
  setLanguage: (language: AppLanguage) => void;
  t: (key: string, params?: Record<string, string | number>) => any;
};
