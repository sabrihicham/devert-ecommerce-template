import { z } from "zod";
import { sql } from "drizzle-orm";
import { createInsertSchema, createSelectSchema } from "drizzle-zod";
import {
  pgTable,
  integer,
  text,
  boolean,
  timestamp,
  check,
  pgPolicy,
} from "drizzle-orm/pg-core";
import { WILAYA_CODES } from "@/constants/wilayas";

export const BrandThemeZod = z.enum(["performance", "endurance", "energy"]);
export type BrandTheme = z.infer<typeof BrandThemeZod>;

export const storeSettings = pgTable(
  "store_settings",
  {
    id: integer("id").primaryKey().default(1),
    storeName: text("store_name").notNull(),
    logoUrl: text("logo_url"),
    storePhone: text("store_phone").notNull(),
    whatsappNumber: text("whatsapp_number"),
    addressLine1: text("address_line1"),
    addressCity: text("address_city"),
    addressWilaya: text("address_wilaya"),
    bannerText: text("banner_text"),
    bannerActive: boolean("banner_active").notNull().default(false),
    minOrderAmountCents: integer("min_order_amount_cents"),
    maxPendingOrdersPerPhone: integer("max_pending_orders_per_phone"),
    brandTheme: text("brand_theme").$type<BrandTheme>().notNull().default("performance"),
    createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
    updatedAt: timestamp("updated_at", { withTimezone: true }).notNull().defaultNow(),
  },
  (table) => [
    check("store_settings_single_row", sql`${table.id} = 1`),
    pgPolicy("Public can read store settings", {
      as: "permissive",
      for: "select",
      to: "public",
      using: sql`true`,
    }),
    pgPolicy("Backend can manage store settings", {
      as: "permissive",
      for: "all",
      to: "public",
      using: sql`current_setting('request.jwt.claim.role', true) is null`,
      withCheck: sql`current_setting('request.jwt.claim.role', true) is null`,
    }),
  ]
).enableRLS();

// Zod Schemas
export const selectStoreSettingsSchema = createSelectSchema(storeSettings, {
  brandTheme: BrandThemeZod,
  createdAt: z.coerce.date(),
  updatedAt: z.coerce.date(),
});

export const updateStoreSettingsSchema = z
  .object({
    storeName: z.string().trim().min(1, "Store name is required"),
    logoUrl: z.string().url().nullable().optional(),
    storePhone: z
      .string()
      .trim()
      .min(9, "Enter a valid phone number")
      .max(20, "Enter a valid phone number"),
    whatsappNumber: z
      .string()
      .trim()
      .max(20, "Enter a valid WhatsApp number")
      .nullable()
      .optional(),
    addressLine1: z.string().trim().nullable().optional(),
    addressCity: z.string().trim().nullable().optional(),
    addressWilaya: z.enum(WILAYA_CODES).nullable().optional(),
    bannerText: z
      .string()
      .trim()
      .max(280, "Banner text must be 280 characters or fewer")
      .nullable()
      .optional(),
    bannerActive: z.boolean(),
    minOrderAmountCents: z
      .number()
      .int()
      .nonnegative("Minimum order amount cannot be negative")
      .nullable()
      .optional(),
    maxPendingOrdersPerPhone: z
      .number()
      .int()
      .positive("Must be a positive number")
      .nullable()
      .optional(),
    brandTheme: BrandThemeZod.optional(),
  })
  .partial();

// Types
export type StoreSettings = z.infer<typeof selectStoreSettingsSchema>;
export type UpdateStoreSettingsInput = z.infer<typeof updateStoreSettingsSchema>;
