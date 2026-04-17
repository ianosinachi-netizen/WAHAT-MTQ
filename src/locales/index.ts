import en from './en';
import ar from './ar';
import fr from './fr';
import es from './es';
import pt from './pt';
import pl from './pl';

export const locales = {
  en,
  ar,
  fr,
  es,
  pt,
  pl
} as const;

export type LocaleType = typeof locales;
export type LanguageCode = keyof LocaleType;
