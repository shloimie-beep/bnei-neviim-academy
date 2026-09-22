import { en } from './en.js';
import { he } from './he.js';

export const dictionaries = { en, he };

export function i18n(locale = 'en', key = '') {
  const language = locale === 'he' ? 'he' : 'en';
  return key.split('.').reduce((current, part) => current?.[part], dictionaries[language]) || key;
}

export function directionForLocale(locale = 'en') {
  return locale === 'he' ? 'rtl' : 'ltr';
}
