export const locales = ["ar", "fr"] as const;
export type Locale = (typeof locales)[number];

export const defaultLocale: Locale = "ar";

export const localeDirection: Record<Locale, "rtl" | "ltr"> = {
  ar: "rtl",
  fr: "ltr",
};

export const localeNames: Record<Locale, string> = {
  ar: "العربية",
  fr: "Français",
};

export function isLocale(value: string | undefined | null): value is Locale {
  return value === "ar" || value === "fr";
}

export function getLocalizedText({
  locale,
  ar,
  fr,
  fallback = ar,
}: {
  locale: Locale;
  ar: string | null | undefined;
  fr: string | null | undefined;
  fallback?: string | null | undefined;
}): string {
  const value = locale === "fr" ? fr : ar;
  return value?.trim() || fallback?.trim() || "";
}

export function getLocalizedArray({
  locale,
  ar,
  fr,
}: {
  locale: Locale;
  ar: string[] | null | undefined;
  fr: string[] | null | undefined;
}): string[] {
  return (locale === "fr" ? fr : ar) ?? ar ?? [];
}
