import { settingsRepository } from "@/lib/db/drizzle/repositories";
import type { StoreSettings, UpdateStoreSettingsInput } from "@/lib/db/drizzle/schema";

export async function getStoreSettings(): Promise<StoreSettings | null> {
  try {
    return await settingsRepository.get();
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
