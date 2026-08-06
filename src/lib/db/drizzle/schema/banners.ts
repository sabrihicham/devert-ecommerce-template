import { z } from "zod";
import { sql } from "drizzle-orm";
import { createInsertSchema, createSelectSchema } from "drizzle-zod";
import {
  pgTable,
  bigserial,
  text,
  integer,
  boolean,
  timestamp,
  index,
  pgPolicy,
} from "drizzle-orm/pg-core";
import { anonRole } from "drizzle-orm/supabase";

export const homepageBanners = pgTable(
  "homepage_banners",
  {
    id: bigserial("id", { mode: "number" }).primaryKey(),
    imageUrl: text("image_url").notNull(),
    title: text("title"),
    subtitle: text("subtitle"),
    linkUrl: text("link_url"),
    sortOrder: integer("sort_order").notNull().default(0),
    isActive: boolean("is_active").notNull().default(true),
    createdAt: timestamp("created_at", { withTimezone: true })
      .notNull()
      .defaultNow(),
    updatedAt: timestamp("updated_at", { withTimezone: true })
      .notNull()
      .defaultNow(),
  },
  (table) => [
    index("idx_homepage_banners_sort_order").on(table.sortOrder),
    index("idx_homepage_banners_is_active").on(table.isActive),
    pgPolicy("Backend can manage homepage banners", {
      as: "permissive",
      for: "all",
      to: "public",
      using: sql`current_setting('request.jwt.claim.role', true) is null`,
      withCheck: sql`current_setting('request.jwt.claim.role', true) is null`,
    }),
    pgPolicy("Anyone can view active homepage banners", {
      as: "permissive",
      for: "select",
      to: anonRole,
      using: sql`is_active = true`,
    }),
  ],
).enableRLS();

// Zod schemas
export const selectBannerSchema = createSelectSchema(homepageBanners, {
  createdAt: z.coerce.string(),
  updatedAt: z.coerce.string(),
});

export const insertBannerSchema = createInsertSchema(homepageBanners, {
  imageUrl: z.string().url("Must be a valid URL"),
  title: z.string().trim().max(120, "Title is too long").nullable().optional(),
  subtitle: z
    .string()
    .trim()
    .max(240, "Subtitle is too long")
    .nullable()
    .optional(),
  linkUrl: z.string().trim().url("Must be a valid URL").nullable().optional(),
  sortOrder: z.coerce.number().int().default(0),
  isActive: z.coerce.boolean().default(true),
}).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

export const updateBannerSchema = insertBannerSchema.partial();

// Types
export type Banner = z.infer<typeof selectBannerSchema>;
export type InsertBanner = z.infer<typeof insertBannerSchema>;
export type UpdateBanner = z.infer<typeof updateBannerSchema>;
