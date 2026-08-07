import { eq, and } from "drizzle-orm";
import { withRLS, type RLSClient } from "../connection";
import { cartItems, productsVariants, productsItems } from "../schema";
import type {
  CartItem,
  InsertCartItem,
} from "@/lib/db/drizzle/schema";

export const cartRepository = {
  async findByUserId(userId: string): Promise<CartItem[]> {
    return withRLS(userId, async (tx) => {
      const result = await tx
        .select()
        .from(cartItems)
        .where(eq(cartItems.userId, userId));

      return result.map(transformCartItem);
    });
  },

  async findByUserIdWithDetails(userId: string) {
    return withRLS(userId, async (tx) => {
      const result = await tx
        .select({
          cartItem: cartItems,
          variant: productsVariants,
          product: productsItems,
        })
        .from(cartItems)
        .innerJoin(
          productsVariants,
          eq(cartItems.variantId, productsVariants.id),
        )
        .innerJoin(
          productsItems,
          eq(productsVariants.productId, productsItems.id),
        )
        .where(eq(cartItems.userId, userId));

      return result.map((row) => ({
        ...transformCartItem(row.cartItem),
        variant: {
          id: row.variant.id,
          productId: row.variant.productId,
          flavor: row.variant.flavor,
          flavorFr: row.variant.flavorFr,
          form: row.variant.form,
          quantity: Number(row.variant.quantity),
          quantityUnit: row.variant.quantityUnit,
          servings: row.variant.servings,
          sku: row.variant.sku,
          price: Number(row.variant.price),
          compareAtPrice: row.variant.compareAtPrice === null ? null : Number(row.variant.compareAtPrice),
          stock: row.variant.stock,
          images: row.variant.images,
          isActive: row.variant.isActive,
          createdAt:
            row.variant.createdAt?.toISOString() ?? new Date().toISOString(),
          updatedAt:
            row.variant.updatedAt?.toISOString() ?? new Date().toISOString(),
        },
        product: {
          id: row.product.id,
          name: row.product.name,
          nameFr: row.product.nameFr,
          description: row.product.description,
          descriptionFr: row.product.descriptionFr,
          price: Number(row.variant.price),
          compareAtPrice: row.product.compareAtPrice === null ? null : Number(row.product.compareAtPrice),
          stock: row.product.stock,
          category: row.product.category,
          img: row.product.img,
          isFeatured: row.product.isFeatured, isBestSeller: row.product.isBestSeller, isNewArrival: row.product.isNewArrival, status: row.product.status, publishedAt: row.product.publishedAt?.toISOString() ?? null,
          brand: row.product.brand, ingredients: row.product.ingredients, ingredientsFr: row.product.ingredientsFr, usage: row.product.usage, usageFr: row.product.usageFr, warnings: row.product.warnings, warningsFr: row.product.warningsFr, tags: row.product.tags, tagsFr: row.product.tagsFr,
          createdAt:
            row.product.createdAt?.toISOString() ?? new Date().toISOString(),
          updatedAt:
            row.product.updatedAt?.toISOString() ?? new Date().toISOString(),
        },
      }));
    });
  },

  async findOne(
    userId: string,
    variantId: number,
  ): Promise<CartItem | null> {
    return withRLS(userId, async (tx) =>
      this.findOneInternal(tx, userId, variantId),
    );
  },

  async upsert(data: InsertCartItem): Promise<CartItem | null> {
    return withRLS(data.userId, async (tx) => {
      const existing = await this.findOneInternal(
        tx,
        data.userId,
        data.variantId,
      );

      const [variant] = await tx.select({ stock: productsVariants.stock, isActive: productsVariants.isActive }).from(productsVariants).where(eq(productsVariants.id, data.variantId));
      if (!variant || !variant.isActive || variant.stock < data.quantity || (existing && existing.quantity + data.quantity > variant.stock)) return null;

      if (existing) {
        return this.updateQuantityInternal(
          tx,
          existing.id,
          existing.quantity + data.quantity,
        );
      }

      const [result] = await tx
        .insert(cartItems)
        .values({
          userId: data.userId,
          variantId: data.variantId,
          quantity: data.quantity,
        })
        .returning();

      return result ? transformCartItem(result) : null;
    });
  },

  async create(data: InsertCartItem): Promise<CartItem | null> {
    return withRLS(data.userId, async (tx) => {
      const [result] = await tx
        .insert(cartItems)
        .values({
          userId: data.userId,
          variantId: data.variantId,
          quantity: data.quantity,
        })
        .returning();

      return result ? transformCartItem(result) : null;
    });
  },

  async updateQuantity(
    userId: string,
    id: number,
    quantity: number,
  ): Promise<CartItem | null> {
    return withRLS(userId, async (tx) =>
      this.updateQuantityInternal(tx, id, quantity),
    );
  },

  async delete(userId: string, id: number): Promise<boolean> {
    return withRLS(userId, async (tx) => {
      const result = await tx
        .delete(cartItems)
        .where(eq(cartItems.id, id))
        .returning({ id: cartItems.id });

      return result.length > 0;
    });
  },

  async clearByUserId(userId: string): Promise<boolean> {
    return withRLS(userId, async (tx) => {
      await tx.delete(cartItems).where(eq(cartItems.userId, userId));
      return true;
    });
  },

  // Internal methods (no RLS wrapper, for use within other methods)
  async findOneInternal(
    tx: RLSClient,
    userId: string,
    variantId: number,
  ): Promise<CartItem | null> {
    const [result] = await tx
      .select()
      .from(cartItems)
      .where(
        and(
          eq(cartItems.userId, userId),
          eq(cartItems.variantId, variantId),
        ),
      );

    return result ? transformCartItem(result) : null;
  },

  async updateQuantityInternal(
    tx: RLSClient,
    id: number,
    quantity: number,
  ): Promise<CartItem | null> {
    const [current] = await tx.select({ variantId: cartItems.variantId }).from(cartItems).where(eq(cartItems.id, id));
    if (!current) return null;
    const [variant] = await tx.select({ stock: productsVariants.stock, isActive: productsVariants.isActive }).from(productsVariants).where(eq(productsVariants.id, current.variantId));
    if (!variant || !variant.isActive || quantity > variant.stock) return null;
    const [result] = await tx
      .update(cartItems)
      .set({ quantity })
      .where(eq(cartItems.id, id))
      .returning();

    return result ? transformCartItem(result) : null;
  },
};

function transformCartItem(row: typeof cartItems.$inferSelect): CartItem {
  return {
    id: row.id,
    userId: row.userId,
    variantId: row.variantId,
    quantity: row.quantity,
    createdAt: row.createdAt?.toISOString() ?? new Date().toISOString(),
    updatedAt: row.updatedAt?.toISOString() ?? new Date().toISOString(),
  };
}
