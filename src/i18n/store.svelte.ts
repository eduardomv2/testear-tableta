import { es } from './es';
import { en } from './en';

export type Translations = typeof es;

const dictionaries: Record<string, Translations> = { es, en };

function detectLocale(): string {
  if (typeof navigator === 'undefined') return 'en';
  const lang = navigator.language.split('-')[0];
  return lang === 'es' ? 'es' : 'en';
}

let currentLocale = $state(detectLocale());

export const locale = {
  get current() {
    return currentLocale;
  },
  toggle() {
    currentLocale = currentLocale === 'es' ? 'en' : 'es';
  },
  get t(): Translations {
    return dictionaries[currentLocale];
  },
};
