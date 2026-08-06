import { z } from "zod";
import { sql } from "drizzle-orm";
import { createInsertSchema, createSelectSchema } from "drizzle-zod";
import {
  pgTable,
  bigserial,
  varchar,
  timestamp,
  pgPolicy,
} from "drizzle-orm/pg-core";
import { anonRole } from "drizzle-orm/supabase";

export const collections = pgTable(
  "collections",
  {
    id: bigserial("id", { mode: "number" }).primaryKey(),
    name: varchar("name", { length: 100 }).notNull(),
    slug: varchar("slug", { length: 100 }).notNull().unique(),
    createdAt: timestamp("created_at", { withTimezone: true })
      .notNull()
      .defaultNow(),
    updatedAt: timestamp("updated_at", { withTimezone: true })
      .notNull()
      .defaultNow(),
  },
  (table) => [
    pgPolicy("Backend can manage collections", {
      as: "permissive",
      for: "all",
      to: "public",
      using: sql`current_setting('request.jwt.claim.role', true) is null`,
      withCheck: sql`current_setting('request.jwt.claim.role', true) is null`,
    }),
    pgPolicy("Anyone can view collections", {
      as: "permissive",
      for: "select",
      to: anonRole,
      using: sql`true`,
    }),
  ],
).enableRLS();

// Zod schemas
export const selectCollectionSchema = createSelectSchema(collections, {
  createdAt: z.coerce.string(),
  updatedAt: z.coerce.string(),
});

const slugRegex = /^[a-z0-9]+(?:-[a-z0-9]+)*$/;

export const insertCollectionSchema = createInsertSchema(collections, {
  name: z.string().trim().min(1, "Name is required").max(100),
  slug: z
    .string()
    .trim()
    .toLowerCase()
    .min(1, "Slug is required")
    .max(100)
    .regex(slugRegex, "Use lowercase letters, numbers, and hyphens only"),
}).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

export const updateCollectionSchema = insertCollectionSchema.partial();

// Types
export type Collection = z.infer<typeof selectCollectionSchema>;
export type InsertCollection = z.infer<typeof insertCollectionSchema>;
export type UpdateCollection = z.infer<typeof updateCollectionSchema>;
