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

export const productStatusEnum = pgEnum("product_status", ["draft", "published", "archived"]);
export const supplementFormEnum = pgEnum("supplement_form", [
  "powder", "capsules", "tablets", "liquid", "gummies", "bars", "other",
]);
export const quantityUnitEnum = pgEnum("quantity_unit", [
  "g", "kg", "ml", "capsule", "tablet", "serving", "piece",
]);

export const ProductStatusZod = z.enum(["draft", "published", "archived"]);
export const SupplementFormZod = z.enum(["powder", "capsules", "tablets", "liquid", "gummies", "bars", "other"]);
export const QuantityUnitZod = z.enum(["g", "kg", "ml", "capsule", "tablet", "serving", "piece"]);
export const ProductCategoryZod = z.string().trim().min(1, "الفئة مطلوبة");

export const productsItems = pgTable(
  "products_items",
  {
    id: bigserial("id", { mode: "number" }).primaryKey(),
    name: varchar("name", { length: 255 }).notNull(),
    nameFr: varchar("name_fr", { length: 255 }),
    description: text("description").notNull(),
    descriptionFr: text("description_fr"),
    brand: varchar("brand", { length: 150 }).notNull().default(""),
    ingredients: text("ingredients").notNull().default(""),
    ingredientsFr: text("ingredients_fr"),
    usage: text("usage").notNull().default(""),
    usageFr: text("usage_fr"),
    warnings: text("warnings").notNull().default(""),
    warningsFr: text("warnings_fr"),
    tags: text("tags").array().notNull().default(sql`ARRAY[]::text[]`),
    tagsFr: text("tags_fr").array(),
    price: decimal("price", { precision: 10, scale: 2 }).notNull(),
    compareAtPrice: decimal("compare_at_price", { precision: 10, scale: 2 }),
    category: varchar("category", { length: 100 }).notNull().references(() => collections.slug, { onDelete: "restrict", onUpdate: "cascade" }),
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
    index("idx_products_storefront").on(table.status, table.isFeatured, table.createdAt),
    check("price_positive", sql`price > 0`),
    check("stock_nonnegative", sql`stock >= 0`),
    check("compare_at_price_valid", sql`compare_at_price is null or compare_at_price >= price`),
    pgPolicy("Backend can manage products", { as: "permissive", for: "all", to: "public", using: sql`current_setting('request.jwt.claim.role', true) is null`, withCheck: sql`current_setting('request.jwt.claim.role', true) is null` }),
    pgPolicy("Anyone can view products", { as: "permissive", for: "select", to: anonRole, using: sql`true` }),
  ],
).enableRLS();

export const productsVariants = pgTable(
  "products_variants",
  {
    id: bigserial("id", { mode: "number" }).primaryKey(),
    productId: bigint("product_id", { mode: "number" }).notNull().references(() => productsItems.id, { onDelete: "cascade" }),
    flavor: varchar("flavor", { length: 100 }).notNull().default(""),
    flavorFr: varchar("flavor_fr", { length: 100 }),
    form: supplementFormEnum("form").notNull().default("other"),
    quantity: decimal("quantity", { precision: 10, scale: 2 }).notNull(),
    quantityUnit: quantityUnitEnum("quantity_unit").notNull().default("piece"),
    servings: integer("servings"),
    sku: varchar("sku", { length: 100 }).notNull(),
    price: decimal("price", { precision: 10, scale: 2 }).notNull(),
    compareAtPrice: decimal("compare_at_price", { precision: 10, scale: 2 }),
    stock: integer("stock").notNull().default(0),
    images: text("images").array().notNull(),
    isActive: boolean("is_active").notNull().default(true),
    createdAt: timestamp("created_at", { withTimezone: true }).defaultNow(),
    updatedAt: timestamp("updated_at", { withTimezone: true }).defaultNow(),
  },
  (table) => [
    unique("product_variant_sku_unique").on(table.sku),
    index("idx_variants_product_id").on(table.productId),
    index("idx_variants_sku").on(table.sku),
    index("idx_variants_active_stock").on(table.isActive, table.stock),
    check("variant_quantity_positive", sql`quantity > 0`),
    check("variant_price_positive", sql`price > 0`),
    check("variant_stock_nonnegative", sql`stock >= 0`),
    check("variant_compare_at_price_valid", sql`compare_at_price is null or compare_at_price >= price`),
    check("variant_servings_positive", sql`servings is null or servings > 0`),
    pgPolicy("Backend can manage variants", { as: "permissive", for: "all", to: "public", using: sql`current_setting('request.jwt.claim.role', true) is null`, withCheck: sql`current_setting('request.jwt.claim.role', true) is null` }),
    pgPolicy("Anyone can view variants", { as: "permissive", for: "select", to: anonRole, using: sql`true` }),
  ],
).enableRLS();

const money = z.coerce.number().positive("يجب أن يكون السعر أكبر من صفر");
const optionalMoney = z.coerce.number().positive().nullable().optional();

export const selectProductSchema = createSelectSchema(productsItems, {
  nameFr: z.string().nullable().optional(), descriptionFr: z.string().nullable().optional(), ingredientsFr: z.string().nullable().optional(), usageFr: z.string().nullable().optional(), warningsFr: z.string().nullable().optional(), tagsFr: z.array(z.string()).nullable().optional(),
  price: z.coerce.number(), compareAtPrice: z.coerce.number().nullable().optional(), stock: z.coerce.number().int(),
  tags: z.array(z.string()), status: ProductStatusZod, createdAt: z.coerce.string(), updatedAt: z.coerce.string(), publishedAt: z.coerce.string().nullable().optional(),
});
export const insertProductSchema = createInsertSchema(productsItems, {
  name: z.string().trim().min(1, "اسم المنتج مطلوب"), description: z.string().trim().min(1, "الوصف مطلوب"), brand: z.string().trim().min(1, "العلامة التجارية مطلوبة"),
  price: money, compareAtPrice: optionalMoney, stock: z.coerce.number().int().nonnegative().optional(), category: ProductCategoryZod, tags: z.array(z.string()).default([]), img: z.string().url(), isFeatured: z.coerce.boolean().default(false),
}).omit({ id: true, createdAt: true, updatedAt: true });
export const updateProductSchema = selectProductSchema.omit({ createdAt: true }).partial().required({ id: true });

export const selectVariantSchema = createSelectSchema(productsVariants, {
  flavorFr: z.string().nullable().optional(),
  quantity: z.coerce.number(), price: z.coerce.number(), compareAtPrice: z.coerce.number().nullable().optional(), stock: z.coerce.number().int(), servings: z.coerce.number().int().nullable().optional(),
  form: SupplementFormZod, quantityUnit: QuantityUnitZod, images: z.array(z.string()), createdAt: z.coerce.string(), updatedAt: z.coerce.string(),
});
export const insertVariantSchema = createInsertSchema(productsVariants, {
  flavor: z.string().trim().min(1, "النكهة مطلوبة"), form: SupplementFormZod, quantity: z.coerce.number().positive(), quantityUnit: QuantityUnitZod,
  servings: z.coerce.number().int().positive().nullable().optional(), sku: z.string().trim().min(1, "SKU مطلوب"), price: money, compareAtPrice: optionalMoney, stock: z.coerce.number().int().nonnegative(), images: z.array(z.string().url()).min(1, "يجب إضافة صورة واحدة على الأقل"), isActive: z.coerce.boolean().default(true),
}).omit({ id: true, createdAt: true, updatedAt: true });
export const productWithVariantsSchema = selectProductSchema.extend({ variants: z.array(selectVariantSchema) });
export const variantWithProductSchema = selectVariantSchema.extend({ product: selectProductSchema });
export const createProductWithVariantsSchema = insertProductSchema.extend({ variants: z.array(insertVariantSchema.omit({ productId: true })).min(1) });

export type Product = z.infer<typeof selectProductSchema>;
export type InsertProduct = z.infer<typeof insertProductSchema>;
export type UpdateProduct = z.infer<typeof updateProductSchema>;
export type ProductVariant = z.infer<typeof selectVariantSchema>;
export type InsertProductVariant = z.infer<typeof insertVariantSchema>;
export type ProductWithVariants = z.infer<typeof productWithVariantsSchema>;
export type VariantWithProduct = z.infer<typeof variantWithProductSchema>;
export type CreateProductWithVariants = z.infer<typeof createProductWithVariantsSchema>;
export type ProductCategory = z.infer<typeof ProductCategoryZod>;
export type SupplementForm = z.infer<typeof SupplementFormZod>;
export type QuantityUnit = z.infer<typeof QuantityUnitZod>;
