import { AppChrome } from "@/components/layout/AppChrome";
import { BrandThemeApplier } from "@/components/layout/BrandThemeApplier";
import { getCollections } from "@/app/actions";
import { getStoreSettings } from "@/services/settings.service";

/** Dynamic store data is intentionally isolated behind the RootLayout Suspense boundary. */
export async function StoreChrome({ children }: { children: React.ReactNode }) {
  const [categories, settings] = await Promise.all([
    getCollections(),
    getStoreSettings(),
  ]);

  return (
    <>
      <BrandThemeApplier brandTheme={settings?.brandTheme ?? "performance"} />
      <AppChrome categories={categories} storeName={settings?.storeName ?? "فورمـا"} logoUrl={settings?.logoUrl ?? null}>{children}</AppChrome>
    </>
  );
}
