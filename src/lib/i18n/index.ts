import { ar, type TranslationKeys } from "./ar";
import { fr } from "./fr";
import type { Locale } from "./config";

const dictionaries: Record<Locale, TranslationKeys> = { ar, fr };

export function getDictionary(locale: Locale): TranslationKeys {
  return dictionaries[locale];
}

export type { Locale } from "./config";
export { defaultLocale, getLocalizedArray, getLocalizedText, isLocale, localeDirection, localeNames, locales } from "./config";
