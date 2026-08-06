import { eq } from "drizzle-orm";
import { db } from "../connection";
import { storeSettings } from "../schema";
import type { StoreSettings, UpdateStoreSettingsInput } from "@/lib/db/drizzle/schema";

const SETTINGS_ROW_ID = 1;

export const settingsRepository = {
  async get(): Promise<StoreSettings | null> {
    const [row] = await db
      .select()
      .from(storeSettings)
      .where(eq(storeSettings.id, SETTINGS_ROW_ID))
      .limit(1);
    return row ?? null;
  },

  async update(data: UpdateStoreSettingsInput): Promise<StoreSettings | null> {
    const [row] = await db
      .update(storeSettings)
      .set({ ...data, updatedAt: new Date() })
      .where(eq(storeSettings.id, SETTINGS_ROW_ID))
      .returning();
    return row ?? null;
  },
};
