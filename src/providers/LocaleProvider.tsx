"use client";

import { createContext, useContext, useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { defaultLocale, getDictionary, localeDirection, type Locale } from "@/lib/i18n";

type LocaleContextValue = {
  locale: Locale;
  direction: "rtl" | "ltr";
  t: ReturnType<typeof getDictionary>;
  setLocale: (locale: Locale) => void;
};

const LocaleContext = createContext<LocaleContextValue | null>(null);

export function LocaleProvider({ initialLocale, children }: { initialLocale: Locale; children: React.ReactNode }) {
  const router = useRouter();
  const [locale, setLocaleState] = useState<Locale>(initialLocale);

  useEffect(() => {
    window.localStorage.setItem("store-locale", locale);
  }, [locale]);

  useEffect(() => {
    document.documentElement.lang = locale;
    document.documentElement.dir = localeDirection[locale];
  }, [locale]);

  const setLocale = (next: Locale) => {
    if (next === locale) return;
    setLocaleState(next);
    document.cookie = `store-locale=${next}; path=/; max-age=31536000; samesite=lax`;
    window.localStorage.setItem("store-locale", next);
    document.documentElement.lang = next;
    document.documentElement.dir = localeDirection[next];
    router.refresh();
  };

  const value = { locale, direction: localeDirection[locale], t: getDictionary(locale), setLocale };
  return <LocaleContext.Provider value={value}>{children}</LocaleContext.Provider>;
}

export function useLocale() {
  const context = useContext(LocaleContext);
  if (!context) throw new Error("useLocale must be used inside LocaleProvider");
  return context;
}

export function useTranslations() {
  return useLocale().t;
}

export { defaultLocale };
