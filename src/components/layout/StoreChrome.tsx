import { AppChrome } from "@/components/layout/AppChrome";
import { BrandThemeApplier } from "@/components/layout/BrandThemeApplier";
import { getCollections } from "@/app/actions";
import { getStoreSettings } from "@/services/settings.service";
import type { Locale } from "@/lib/i18n";
import { getServerLocale } from "@/lib/i18n/server";
import { LocaleProvider } from "@/providers/LocaleProvider";

/** Dynamic store data is intentionally isolated behind the RootLayout Suspense boundary. */
export async function StoreChrome({ children, locale }: { children: React.ReactNode; locale: Locale }) {
  const [categories, settings] = await Promise.all([
    getCollections(locale),
    getStoreSettings(locale),
  ]);

  return (
    <>
      <BrandThemeApplier brandTheme={settings?.brandTheme ?? "performance"} />
      <AppChrome categories={categories} storeName={settings?.storeName ?? "فورمـا"} logoUrl={settings?.logoUrl ?? null} locale={locale}>{children}</AppChrome>
    </>
  );
}

export async function LocalizedStoreChrome({ children }: { children: React.ReactNode }) {
  const locale = await getServerLocale();
  return <LocaleProvider initialLocale={locale}><StoreChrome locale={locale}>{children}</StoreChrome></LocaleProvider>;
}
