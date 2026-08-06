import { z } from "zod";
import { eq, desc, sql, and } from "drizzle-orm";
import { db } from "../connection";
import { productsItems, productsVariants, ProductSizeZod } from "../schema";
import type {
  Product,
  ProductWithVariants,
  InsertProduct,
  InsertProductVariant,
  ProductCategory,
  VariantWithProduct,
} from "@/lib/db/drizzle/schema";

const sizesSchema = z.array(ProductSizeZod);

function parseSizes(sizes: string[]) {
  return sizesSchema.parse(sizes);
}

export const productsRepository = {
  async findAll(): Promise<ProductWithVariants[]> {
    const result = await db.query.productsItems.findMany({
      with: { variants: true },
      orderBy: [desc(productsItems.createdAt)],
    });

    return result.map(transformProduct);
  },

  async findById(id: number): Promise<ProductWithVariants | null> {
    const result = await db.query.productsItems.findFirst({
      where: eq(productsItems.id, id),
      with: { variants: true },
    });

    return result ? transformProduct(result) : null;
  },

  async findVariantWithProduct(id: number): Promise<VariantWithProduct | null> {
    const result = await db.query.productsVariants.findFirst({
      where: eq(productsVariants.id, id),
      with: { product: true },
    });

    if (!result) return null;

    return {
      ...transformVariant(result),
      product: transformProductBase(result.product),
    };
  },

  async findByCategory(
    category: ProductCategory,
  ): Promise<ProductWithVariants[]> {
    const result = await db.query.productsItems.findMany({
      where: eq(productsItems.category, category),
      with: { variants: true },
      orderBy: [desc(productsItems.createdAt)],
    });

    return result.map(transformProduct);
  },

  async create(data: InsertProduct): Promise<Product | null> {
    const [result] = await db
      .insert(productsItems)
      .values({
        name: data.name,
        description: data.description,
          price: String(data.price),
          compareAtPrice: data.compareAtPrice == null ? null : String(data.compareAtPrice),
        category: data.category,
        img: data.img,
          isFeatured: data.isFeatured ?? false,
          isBestSeller: data.isBestSeller ?? false,
          isNewArrival: data.isNewArrival ?? false,
          stock: data.stock ?? 0,
          status: data.status ?? "published",
      })
      .returning();

    return result ? transformProductBase(result) : null;
  },

  async createWithVariants(
    product: InsertProduct,
    variants: Omit<InsertProductVariant, "productId">[],
  ): Promise<ProductWithVariants | null> {
    return await db.transaction(async (tx) => {
      const [newProduct] = await tx
        .insert(productsItems)
        .values({
          name: product.name,
          description: product.description,
          price: String(product.price),
          compareAtPrice: product.compareAtPrice == null ? null : String(product.compareAtPrice),
          category: product.category,
          img: product.img,
          isFeatured: product.isFeatured ?? false,
          isBestSeller: product.isBestSeller ?? false,
          isNewArrival: product.isNewArrival ?? false,
          stock: product.stock ?? 0,
          status: product.status ?? "published",
        })
        .returning();

      if (!newProduct) return null;

      const newVariants = await tx
        .insert(productsVariants)
        .values(
          variants.map((v) => ({
            productId: newProduct.id,
            color: v.color,
            sizes: v.sizes,
            images: v.images,
          })),
        )
        .returning();

      return {
        ...transformProductBase(newProduct),
        variants: newVariants.map(transformVariant),
      };
    });
  },

  async update(
    id: number,
    data: Partial<InsertProduct>,
  ): Promise<Product | null> {
    const updateData: Record<string, unknown> = {};

    if (data.name !== undefined) updateData.name = data.name;
    if (data.description !== undefined)
      updateData.description = data.description;
    if (data.price !== undefined) updateData.price = String(data.price);
    if (data.compareAtPrice !== undefined) updateData.compareAtPrice = data.compareAtPrice == null ? null : String(data.compareAtPrice);
    if (data.category !== undefined) updateData.category = data.category;
    if (data.img !== undefined) updateData.img = data.img;
    if (data.isFeatured !== undefined) updateData.isFeatured = data.isFeatured;
    if (data.isBestSeller !== undefined) updateData.isBestSeller = data.isBestSeller;
    if (data.isNewArrival !== undefined) updateData.isNewArrival = data.isNewArrival;
    if (data.stock !== undefined) updateData.stock = data.stock;
    if (data.status !== undefined) updateData.status = data.status;

    const [result] = await db
      .update(productsItems)
      .set(updateData)
      .where(eq(productsItems.id, id))
      .returning();

    return result ? transformProductBase(result) : null;
  },

  async updateWithVariants(
    id: number,
    product: Partial<InsertProduct>,
    variants: Array<{
      id?: number;
      color: string;
      sizes: string[];
      images: string[];
    }>,
  ): Promise<ProductWithVariants | null> {
    return await db.transaction(async (tx) => {
      // Update product
      const updateData: Record<string, unknown> = {};
      if (product.name !== undefined) updateData.name = product.name;
      if (product.description !== undefined)
        updateData.description = product.description;
      if (product.price !== undefined) updateData.price = String(product.price);
      if (product.compareAtPrice !== undefined) updateData.compareAtPrice = product.compareAtPrice == null ? null : String(product.compareAtPrice);
      if (product.category !== undefined)
        updateData.category = product.category;
      if (product.img !== undefined) updateData.img = product.img;
      if (product.isFeatured !== undefined)
        updateData.isFeatured = product.isFeatured;
      if (product.isBestSeller !== undefined) updateData.isBestSeller = product.isBestSeller;
      if (product.isNewArrival !== undefined) updateData.isNewArrival = product.isNewArrival;
      if (product.stock !== undefined) updateData.stock = product.stock;
      if (product.status !== undefined) updateData.status = product.status;

      const [updatedProduct] = await tx
        .update(productsItems)
        .set(updateData)
        .where(eq(productsItems.id, id))
        .returning();

      if (!updatedProduct) return null;

      // Get existing variant IDs
      const existingVariants = await tx.query.productsVariants.findMany({
        where: eq(productsVariants.productId, id),
      });
      const existingIds = existingVariants.map((v) => v.id);

      // Determine which variants to update, create, or delete
      const variantIdsToKeep: number[] = [];
      const variantsToUpdate: typeof variants = [];
      const variantsToCreate: typeof variants = [];

      for (const variant of variants) {
        if (variant.id && existingIds.includes(variant.id)) {
          variantIdsToKeep.push(variant.id);
          variantsToUpdate.push(variant);
        } else {
          variantsToCreate.push(variant);
        }
      }

      // Delete variants that are no longer present
      const idsToDelete = existingIds.filter(
        (id) => !variantIdsToKeep.includes(id),
      );
      if (idsToDelete.length > 0) {
        for (const variantId of idsToDelete) {
          await tx
            .delete(productsVariants)
            .where(eq(productsVariants.id, variantId));
        }
      }

      // Update existing variants
      for (const variant of variantsToUpdate) {
        if (variant.id) {
          await tx
            .update(productsVariants)
            .set({
              color: variant.color,
              sizes: parseSizes(variant.sizes),
              images: variant.images,
            })
            .where(eq(productsVariants.id, variant.id));
        }
      }

      // Create new variants
      if (variantsToCreate.length > 0) {
        await tx.insert(productsVariants).values(
          variantsToCreate.map((v) => ({
            productId: id,
            color: v.color,
            sizes: parseSizes(v.sizes),
            images: v.images,
          })),
        );
      }

      // Fetch updated product with variants
      const result = await tx.query.productsItems.findFirst({
        where: eq(productsItems.id, id),
        with: { variants: true },
      });

      return result ? transformProduct(result) : null;
    });
  },

  async delete(id: number): Promise<boolean> {
    const result = await db
      .delete(productsItems)
      .where(eq(productsItems.id, id))
      .returning({ id: productsItems.id });

    return result.length > 0;
  },

  async search(query: string): Promise<ProductWithVariants[]> {
    const result = await db.query.productsItems.findMany({
      where: sql`${productsItems.name} ILIKE ${"%" + query + "%"}`,
      with: { variants: true },
      orderBy: [desc(productsItems.createdAt)],
    });

    return result.map(transformProduct);
  },

  async findRandom(limit: number = 4): Promise<ProductWithVariants[]> {
    const result = await db.query.productsItems.findMany({
      with: { variants: true },
      orderBy: sql`RANDOM()`,
      limit,
    });

    return result.map(transformProduct);
  },

  /** Most recently created products, for a homepage "New Arrivals" section. */
  async findRecent(limit: number = 8): Promise<ProductWithVariants[]> {
    const result = await db.query.productsItems.findMany({
      where: eq(productsItems.status, "published"),
      with: { variants: true },
      orderBy: [desc(productsItems.isNewArrival), desc(productsItems.createdAt)],
      limit,
    });

    return result.map(transformProduct);
  },

  /** Admin-curated products, for a homepage "Featured Products" section. */
  async findFeatured(limit: number = 8): Promise<ProductWithVariants[]> {
    const result = await db.query.productsItems.findMany({
      where: and(eq(productsItems.isFeatured, true), eq(productsItems.status, "published")),
      with: { variants: true },
      orderBy: [desc(productsItems.createdAt)],
      limit,
    });

    return result.map(transformProduct);
  },
  async findBestSellers(limit: number = 8): Promise<ProductWithVariants[]> {
    const result = await db.query.productsItems.findMany({
      where: and(eq(productsItems.isBestSeller, true), eq(productsItems.status, "published")),
      with: { variants: true }, orderBy: [desc(productsItems.createdAt)], limit,
    });
    return result.map(transformProduct);
  },
};

function transformProductBase(row: typeof productsItems.$inferSelect): Product {
  return {
    id: row.id,
    name: row.name,
    description: row.description,
    price: Number(row.price),
    compareAtPrice: row.compareAtPrice === null ? null : Number(row.compareAtPrice),
    category: row.category,
    img: row.img,
    isFeatured: row.isFeatured,
    isBestSeller: row.isBestSeller,
    isNewArrival: row.isNewArrival,
    stock: row.stock,
    status: row.status,
    publishedAt: row.publishedAt?.toISOString() ?? null,
    createdAt: row.createdAt?.toISOString() ?? new Date().toISOString(),
    updatedAt: row.updatedAt?.toISOString() ?? new Date().toISOString(),
  };
}

function transformVariant(row: typeof productsVariants.$inferSelect) {
  return {
    id: row.id,
    productId: row.productId,
    color: row.color,
    sizes: row.sizes,
    images: row.images,
    createdAt: row.createdAt?.toISOString() ?? new Date().toISOString(),
    updatedAt: row.updatedAt?.toISOString() ?? new Date().toISOString(),
  };
}

function transformProduct(
  row: typeof productsItems.$inferSelect & {
    variants: (typeof productsVariants.$inferSelect)[];
  },
): ProductWithVariants {
  return {
    ...transformProductBase(row),
    variants: row.variants.map(transformVariant),
  };
}
