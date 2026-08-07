import { z } from "zod";
import { eq, desc, sql, and } from "drizzle-orm";
import { db } from "../connection";
import { productsItems, productsVariants } from "../schema";
import type { Product, ProductWithVariants, InsertProduct, InsertProductVariant, ProductCategory, VariantWithProduct } from "@/lib/db/drizzle/schema";

const variantInput = z.object({
  id: z.number().int().positive().optional(), flavor: z.string(), form: z.string(), quantity: z.number(), quantityUnit: z.string(), servings: z.number().int().positive().nullable().optional(), sku: z.string(), price: z.number(), compareAtPrice: z.number().nullable().optional(), stock: z.number().int().nonnegative(), images: z.array(z.string()), isActive: z.boolean(),
});
type VariantWrite = Omit<InsertProductVariant, "productId"> & { id?: number };

function productValues(data: Partial<InsertProduct>) {
  return {
    ...(data.name !== undefined && { name: data.name }), ...(data.nameFr !== undefined && { nameFr: data.nameFr }), ...(data.description !== undefined && { description: data.description }), ...(data.descriptionFr !== undefined && { descriptionFr: data.descriptionFr }), ...(data.brand !== undefined && { brand: data.brand }), ...(data.ingredients !== undefined && { ingredients: data.ingredients }), ...(data.ingredientsFr !== undefined && { ingredientsFr: data.ingredientsFr }), ...(data.usage !== undefined && { usage: data.usage }), ...(data.usageFr !== undefined && { usageFr: data.usageFr }), ...(data.warnings !== undefined && { warnings: data.warnings }), ...(data.warningsFr !== undefined && { warningsFr: data.warningsFr }), ...(data.tags !== undefined && { tags: data.tags }), ...(data.tagsFr !== undefined && { tagsFr: data.tagsFr }), ...(data.price !== undefined && { price: String(data.price) }), ...(data.compareAtPrice !== undefined && { compareAtPrice: data.compareAtPrice == null ? null : String(data.compareAtPrice) }), ...(data.category !== undefined && { category: data.category }), ...(data.img !== undefined && { img: data.img }), ...(data.isFeatured !== undefined && { isFeatured: data.isFeatured }), ...(data.isBestSeller !== undefined && { isBestSeller: data.isBestSeller }), ...(data.isNewArrival !== undefined && { isNewArrival: data.isNewArrival }), ...(data.stock !== undefined && { stock: data.stock }), ...(data.status !== undefined && { status: data.status }),
  };
}

function variantValues(v: z.infer<typeof variantInput>, productId: number) {
  return { productId, flavor: v.flavor, flavorFr: (v as any).flavorFr ?? null, form: v.form as any, quantity: String(v.quantity), quantityUnit: v.quantityUnit as any, servings: v.servings ?? null, sku: v.sku, price: String(v.price), compareAtPrice: v.compareAtPrice == null ? null : String(v.compareAtPrice), stock: v.stock, images: v.images, isActive: v.isActive };
}

export const productsRepository = {
  async findAll() { const rows = await db.query.productsItems.findMany({ with: { variants: true }, orderBy: [desc(productsItems.createdAt)] }); return rows.map(transformProduct); },
  async findById(id: number) { const row = await db.query.productsItems.findFirst({ where: eq(productsItems.id, id), with: { variants: true } }); return row ? transformProduct(row) : null; },
  async findVariantWithProduct(id: number): Promise<VariantWithProduct | null> { const row = await db.query.productsVariants.findFirst({ where: eq(productsVariants.id, id), with: { product: true } }); return row ? { ...transformVariant(row), product: transformProductBase(row.product) } : null; },
  async findVariantBySku(sku: string) { return db.query.productsVariants.findFirst({ where: eq(productsVariants.sku, sku) }); },
  async findByCategory(category: ProductCategory) { const rows = await db.query.productsItems.findMany({ where: eq(productsItems.category, category), with: { variants: true }, orderBy: [desc(productsItems.createdAt)] }); return rows.map(transformProduct); },
  async create(data: InsertProduct) { const [row] = await db.insert(productsItems).values(productValues(data) as any).returning(); return row ? transformProductBase(row) : null; },
  async update(id: number, data: Partial<InsertProduct>) { const [row] = await db.update(productsItems).set(productValues(data) as any).where(eq(productsItems.id, id)).returning(); return row ? transformProductBase(row) : null; },
  async updateWithVariants(id: number, product: Partial<InsertProduct>, variants: VariantWrite[]) {
    return db.transaction(async (tx) => {
      const [updated] = await tx.update(productsItems).set(productValues(product) as any).where(eq(productsItems.id, id)).returning();
      if (!updated) return null;
      const existing = await tx.query.productsVariants.findMany({ where: eq(productsVariants.productId, id) });
      const ids = new Set(variants.flatMap((v) => v.id ? [v.id] : []));
      for (const row of existing) if (!ids.has(row.id)) await tx.delete(productsVariants).where(eq(productsVariants.id, row.id));
      for (const v of variants) {
        if (v.id && existing.some((row) => row.id === v.id)) await tx.update(productsVariants).set(variantValues(v as any, id) as any).where(eq(productsVariants.id, v.id));
        else await tx.insert(productsVariants).values(variantValues(v as any, id) as any);
      }
      const row = await tx.query.productsItems.findFirst({ where: eq(productsItems.id, id), with: { variants: true } });
      return row ? transformProduct(row) : null;
    });
  },
  async createWithVariants(product: InsertProduct, variants: VariantWrite[]) {
    const created = await this.create(product); if (!created) return null; return this.updateWithVariants(created.id, {}, variants);
  },
  async delete(id: number) { const result = await db.delete(productsItems).where(eq(productsItems.id, id)).returning({ id: productsItems.id }); return result.length > 0; },
  async search(query: string) { const rows = await db.query.productsItems.findMany({ where: sql`${productsItems.name} ILIKE ${"%" + query + "%"}`, with: { variants: true }, orderBy: [desc(productsItems.createdAt)] }); return rows.map(transformProduct); },
  async findRandom(limit = 4) { const rows = await db.query.productsItems.findMany({ with: { variants: true }, orderBy: sql`RANDOM()`, limit }); return rows.map(transformProduct); },
  async findRecent(limit = 8) { const rows = await db.query.productsItems.findMany({ where: eq(productsItems.status, "published"), with: { variants: true }, orderBy: [desc(productsItems.isNewArrival), desc(productsItems.createdAt)], limit }); return rows.map(transformProduct); },
  async findFeatured(limit = 8) { const rows = await db.query.productsItems.findMany({ where: and(eq(productsItems.isFeatured, true), eq(productsItems.status, "published")), with: { variants: true }, orderBy: [desc(productsItems.createdAt)], limit }); return rows.map(transformProduct); },
  async findBestSellers(limit = 8) { const rows = await db.query.productsItems.findMany({ where: and(eq(productsItems.isBestSeller, true), eq(productsItems.status, "published")), with: { variants: true }, orderBy: [desc(productsItems.createdAt)], limit }); return rows.map(transformProduct); },
};

function transformProductBase(row: typeof productsItems.$inferSelect): Product { return { id: row.id, name: row.name, nameFr: row.nameFr, description: row.description, descriptionFr: row.descriptionFr, brand: row.brand, ingredients: row.ingredients, ingredientsFr: row.ingredientsFr, usage: row.usage, usageFr: row.usageFr, warnings: row.warnings, warningsFr: row.warningsFr, tags: row.tags, tagsFr: row.tagsFr, price: Number(row.price), compareAtPrice: row.compareAtPrice == null ? null : Number(row.compareAtPrice), category: row.category, img: row.img, isFeatured: row.isFeatured, isBestSeller: row.isBestSeller, isNewArrival: row.isNewArrival, stock: row.stock, status: row.status, publishedAt: row.publishedAt?.toISOString() ?? null, createdAt: row.createdAt?.toISOString() ?? new Date().toISOString(), updatedAt: row.updatedAt?.toISOString() ?? new Date().toISOString() }; }
function transformVariant(row: typeof productsVariants.$inferSelect): ProductWithVariants["variants"][number] { return { id: row.id, productId: row.productId, flavor: row.flavor, flavorFr: row.flavorFr, form: row.form, quantity: Number(row.quantity), quantityUnit: row.quantityUnit, servings: row.servings, sku: row.sku, price: Number(row.price), compareAtPrice: row.compareAtPrice == null ? null : Number(row.compareAtPrice), stock: row.stock, images: row.images, isActive: row.isActive, createdAt: row.createdAt?.toISOString() ?? new Date().toISOString(), updatedAt: row.updatedAt?.toISOString() ?? new Date().toISOString() }; }
function transformProduct(row: typeof productsItems.$inferSelect & { variants: (typeof productsVariants.$inferSelect)[] }): ProductWithVariants { return { ...transformProductBase(row), variants: row.variants.map(transformVariant) }; }
