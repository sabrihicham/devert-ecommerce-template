import { z } from "zod";
import { sql } from "drizzle-orm";
import { createInsertSchema, createSelectSchema } from "drizzle-zod";
import {
  pgTable,
  bigserial,
  varchar,
  text,
  decimal,
  boolean,
  timestamp,
  bigint,
  integer,
  unique,
  index,
  check,
  pgEnum,
  pgPolicy,
} from "drizzle-orm/pg-core";
import { anonRole } from "drizzle-orm/supabase";
import { collections } from "./collections";

// Enums
export const sizesEnum = pgEnum("sizes", ["XS", "S", "M", "L", "XL", "XXL"]);
export const productStatusEnum = pgEnum("product_status", ["draft", "published", "archived"]);
export const ProductStatusZod = z.enum(["draft", "published", "archived"]);

export const ProductCategoryZod = z
  .string()
  .trim()
  .min(1, "Category is required");
export const ProductSizeZod = z.enum(["XS", "S", "M", "L", "XL", "XXL"]);

// Tables
export const productsItems = pgTable(
  "products_items",
  {
    id: bigserial("id", { mode: "number" }).primaryKey(),
    name: varchar("name", { length: 255 }).notNull(),
    description: text("description").notNull(),
    price: decimal("price", { precision: 10, scale: 2 }).notNull(),
    compareAtPrice: decimal("compare_at_price", { precision: 10, scale: 2 }),
    category: varchar("category", { length: 100 })
      .notNull()
      .references(() => collections.slug, {
        onDelete: "restrict",
        onUpdate: "cascade",
      }),
    img: varchar("img", { length: 500 }).notNull(),
    isFeatured: boolean("is_featured").notNull().default(false),
    isBestSeller: boolean("is_best_seller").notNull().default(false),
    isNewArrival: boolean("is_new_arrival").notNull().default(false),
    stock: integer("stock").notNull().default(0),
    status: productStatusEnum("status").notNull().default("published"),
    publishedAt: timestamp("published_at", { withTimezone: true }),
    createdAt: timestamp("created_at", { withTimezone: true }).defaultNow(),
    updatedAt: timestamp("updated_at", { withTimezone: true }).defaultNow(),
  },
  (table) => [
    index("idx_products_category").on(table.category),
    index("idx_products_name").on(table.name),
    index("idx_products_created_at").on(table.createdAt),
    index("idx_products_updated_at").on(table.updatedAt),
    index("idx_products_is_featured").on(table.isFeatured),
    index("idx_products_storefront").on(table.status, table.isFeatured, table.createdAt),
    index("idx_products_best_sellers").on(table.status, table.isBestSeller, table.createdAt),
    check("price_positive", sql`price > 0`),
    check("stock_nonnegative", sql`stock >= 0`),
    check("compare_at_price_valid", sql`compare_at_price is null or compare_at_price >= price`),
    pgPolicy("Backend can manage products", {
      as: "permissive",
      for: "all",
      to: "public",
      using: sql`current_setting('request.jwt.claim.role', true) is null`,
      withCheck: sql`current_setting('request.jwt.claim.role', true) is null`,
    }),
    pgPolicy("Anyone can view products", {
      as: "permissive",
      for: "select",
      to: anonRole,
      using: sql`true`,
    }),
  ]
).enableRLS();

export const productsVariants = pgTable(
  "products_variants",
  {
    id: bigserial("id", { mode: "number" }).primaryKey(),
    productId: bigint("product_id", { mode: "number" })
      .notNull()
      .references(() => productsItems.id, { onDelete: "cascade" }),
    color: varchar("color", { length: 100 }).notNull(),
    sizes: sizesEnum("sizes").array().notNull(),
    images: text("images").array().notNull(),
    createdAt: timestamp("created_at", { withTimezone: true }).defaultNow(),
    updatedAt: timestamp("updated_at", { withTimezone: true }).defaultNow(),
  },
  (table) => [
    unique("product_color_unique").on(table.productId, table.color),
    index("idx_variants_product_id").on(table.productId),
    index("idx_variants_color").on(table.color),
    index("idx_variants_created_at").on(table.createdAt),
    index("idx_variants_updated_at").on(table.updatedAt),
    pgPolicy("Backend can manage variants", {
      as: "permissive",
      for: "all",
      to: "public",
      using: sql`current_setting('request.jwt.claim.role', true) is null`,
      withCheck: sql`current_setting('request.jwt.claim.role', true) is null`,
    }),
    pgPolicy("Anyone can view variants", {
      as: "permissive",
      for: "select",
      to: anonRole,
      using: sql`true`,
    }),
  ]
).enableRLS();

// Zod Schemas
export const selectProductSchema = createSelectSchema(productsItems, {
  price: z.coerce.number(),
  compareAtPrice: z.coerce.number().nullable().optional(),
  stock: z.coerce.number().int().optional(),
  isBestSeller: z.boolean().optional(),
  isNewArrival: z.boolean().optional(),
  status: ProductStatusZod.optional(),
  createdAt: z.coerce.string(),
  updatedAt: z.coerce.string(),
  publishedAt: z.coerce.string().nullable().optional(),
});

export const insertProductSchema = createInsertSchema(productsItems, {
  name: z.string().min(1, "Name is required"),
  description: z.string().min(1, "Description is required"),
  price: z.coerce.number().positive("Price must be greater than 0"),
  compareAtPrice: z.coerce.number().positive().nullable().optional(),
  stock: z.coerce.number().int().nonnegative().optional(),
  status: ProductStatusZod.optional(),
  isBestSeller: z.coerce.boolean().optional(),
  isNewArrival: z.coerce.boolean().optional(),
  img: z.string().url("Must be a valid URL"),
  isFeatured: z.coerce.boolean().default(false),
}).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

export const updateProductSchema = selectProductSchema
  .omit({ createdAt: true })
  .partial()
  .required({ id: true });

export const selectVariantSchema = createSelectSchema(productsVariants, {
  createdAt: z.coerce.string(),
  updatedAt: z.coerce.string(),
});

export const insertVariantSchema = createInsertSchema(productsVariants, {
  color: z.string().min(1, "Color is required"),
}).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

export const productWithVariantsSchema = selectProductSchema.extend({
  variants: z.array(selectVariantSchema),
});

export const variantWithProductSchema = selectVariantSchema.extend({
  product: selectProductSchema,
});

export const createProductWithVariantsSchema = insertProductSchema.extend({
  variants: z.array(insertVariantSchema.omit({ productId: true })),
});

// Types
export type Product = z.infer<typeof selectProductSchema>;
export type InsertProduct = z.infer<typeof insertProductSchema>;
export type UpdateProduct = z.infer<typeof updateProductSchema>;
export type ProductVariant = z.infer<typeof selectVariantSchema>;
export type InsertProductVariant = z.infer<typeof insertVariantSchema>;
export type ProductWithVariants = z.infer<typeof productWithVariantsSchema>;
export type VariantWithProduct = z.infer<typeof variantWithProductSchema>;
export type CreateProductWithVariants = z.infer<
  typeof createProductWithVariantsSchema
>;
export type ProductCategory = z.infer<typeof ProductCategoryZod>;
export type ProductSize = z.infer<typeof ProductSizeZod>;
