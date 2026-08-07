import { settingsRepository } from "@/lib/db/drizzle/repositories";
import type { StoreSettings, UpdateStoreSettingsInput } from "@/lib/db/drizzle/schema";
import { getLocalizedText, type Locale } from "@/lib/i18n";

export async function getStoreSettings(locale: Locale = "ar"): Promise<StoreSettings | null> {
  try {
    const settings = await settingsRepository.get();
    if (!settings) return null;
    return {
      ...settings,
      storeName: getLocalizedText({ locale, ar: settings.storeName, fr: settings.storeNameFr }),
      bannerText: getLocalizedText({ locale, ar: settings.bannerText, fr: settings.bannerTextFr, fallback: settings.bannerText }) || null,
    };
  } catch (error) {
    console.error("Error fetching store settings:", error);
    return null;
  }
}

export async function updateStoreSettings(
  data: UpdateStoreSettingsInput,
): Promise<StoreSettings | null> {
  try {
    return await settingsRepository.update(data);
  } catch (error) {
    console.error("Error updating store settings:", error);
    return null;
  }
}
