"use client";

import { Languages } from "lucide-react";
import { useLocale } from "@/providers/LocaleProvider";

export function LanguageSwitcher() {
  const { locale, setLocale } = useLocale();

  function changeLocale() {
    setLocale(locale === "ar" ? "fr" : "ar");
  }

  return (
    <button
      type="button"
      onClick={changeLocale}
      title={locale === "ar" ? "Passer au français" : "التبديل إلى العربية"}
      aria-label={locale === "ar" ? "Passer au français" : "التبديل إلى العربية"}
      className="group inline-flex h-9 items-center gap-1.5 rounded-full border border-border bg-background/80 px-2.5 text-[11px] font-bold text-muted-foreground shadow-sm transition hover:border-primary/50 hover:text-primary focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary"
    >
      <Languages className="size-3.5 transition-transform group-hover:rotate-12" aria-hidden="true" />
      <span>{locale === "ar" ? "FR" : "عربي"}</span>
    </button>
  );
}
