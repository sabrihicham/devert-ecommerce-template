"use server";

import { cacheLife, cacheTag, revalidateTag } from "next/cache";
import {
  productsRepository,
  bannersRepository,
  collectionsRepository,
} from "@/lib/db/drizzle/repositories";
import {
  type ProductCategory,
  productWithVariantsSchema,
  selectBannerSchema,
  selectCollectionSchema,
  type ProductWithVariants,
  type Banner,
  type Collection,
} from "@/lib/db/drizzle/schema";

/**
 * Fetch all products with caching
 * Cache is tagged for invalidation and set to revalidate every hour
 */
export async function getAllProducts(): Promise<ProductWithVariants[]> {
  "use cache";
  cacheTag("products");
  cacheLife("hours");

  try {
    const products = await productsRepository.findAll();
    const validatedProducts = productWithVariantsSchema.array().parse(products);
    return validatedProducts.sort((a, b) => a.name.localeCompare(b.name));
  } catch (error) {
    console.error("Error fetching products:", error);
    return [];
  }
}

/**
 * Fetch products by category with caching
 * Each category has its own cache entry (category arg becomes part of cache key)
 */
export async function getCategoryProducts(
  category: ProductCategory,
): Promise<ProductWithVariants[]> {
  "use cache";
  cacheTag("products", `category-${category}`);
  cacheLife("hours");

  try {
    const products = await productsRepository.findByCategory(category);
    const validatedProducts = productWithVariantsSchema.array().parse(products);
    return validatedProducts.sort((a, b) => a.name.localeCompare(b.name));
  } catch (error) {
    console.error("Error fetching category products:", error);
    return [];
  }
}

/**
 * Fetch a single product by ID with caching
 * Each product has its own cache entry (productId arg becomes part of cache key)
 */
export async function getProduct(
  productId: number,
): Promise<ProductWithVariants | null> {
  "use cache";
  cacheTag("products", `product-${productId}`);
  cacheLife("hours");

  try {
    const product = await productsRepository.findById(productId);
    if (!product) return null;
    return productWithVariantsSchema.parse(product);
  } catch (error) {
    console.error("Error fetching product:", error);
    return null;
  }
}

/**
 * Fetch random products excluding a specific product
 * Note: This is dynamic (random) so it stays outside cache
 * It benefits from the cached getAllProducts() call
 */
export async function getRandomProducts(
  productIdToExclude: number,
): Promise<ProductWithVariants[]> {
  try {
    const allProducts = await getAllProducts();
    const filtered = allProducts.filter((p) => p.id !== productIdToExclude);
    const shuffled = filtered.sort(() => Math.random() - 0.5);
    return productWithVariantsSchema.array().parse(shuffled.slice(0, 6));
  } catch (error) {
    console.error("Error fetching random products:", error);
    return [];
  }
}

/**
 * Invalidates all product caches immediately
 * Call this after creating, updating, or deleting products
 * Uses revalidateTag so it works from both Server Actions and Route Handlers
 */
export async function revalidateProducts(productId?: number): Promise<void> {
  // Always invalidate the general products tag
  revalidateTag("products", "max");

  // If a specific product ID is provided, also invalidate that specific product
  if (productId) {
    revalidateTag(`product-${productId}`, "max");
  }
}

/**
 * Fetch admin-curated "Featured" products for the homepage, with caching.
 */
export async function getFeaturedProducts(
  limit: number = 8,
): Promise<ProductWithVariants[]> {
  "use cache";
  cacheTag("products", "featured-products");
  cacheLife("hours");

  try {
    const products = await productsRepository.findFeatured(limit);
    return productWithVariantsSchema.array().parse(products);
  } catch (error) {
    console.error("Error fetching featured products:", error);
    return [];
  }
}

/**
 * Fetch the most recently added products for a homepage "New Arrivals" section.
 */
export async function getNewArrivals(
  limit: number = 8,
): Promise<ProductWithVariants[]> {
  "use cache";
  cacheTag("products", "new-arrivals");
  cacheLife("hours");

  try {
    const products = await productsRepository.findRecent(limit);
    return productWithVariantsSchema.array().parse(products);
  } catch (error) {
    console.error("Error fetching new arrivals:", error);
    return [];
  }
}

/**
 * Fetch active homepage hero-slider banners, ordered for display, with caching.
 */
export async function getActiveBanners(): Promise<Banner[]> {
  "use cache";
  cacheTag("banners");
  cacheLife("hours");

  try {
    const banners = await bannersRepository.findActive();
    return selectBannerSchema.array().parse(banners);
  } catch (error) {
    console.error("Error fetching homepage banners:", error);
    return [];
  }
}

/**
 * Invalidates the homepage banners cache after admin mutations.
 */
export async function revalidateBanners(): Promise<void> {
  revalidateTag("banners", "max");
}

/**
 * Fetch all product collections (categories), with caching. Used to render
 * the storefront navigation/footer and to validate `/[category]` routes.
 */
export async function getCollections(): Promise<Collection[]> {
  "use cache";
  cacheTag("collections");
  cacheLife("hours");

  try {
    const collections = await collectionsRepository.findAll();
    return selectCollectionSchema.array().parse(collections);
  } catch (error) {
    console.error("Error fetching collections:", error);
    return [];
  }
}

/**
 * Fetch a single collection by slug, with caching. Returns null when the
 * slug does not match any collection (used to 404 `/[category]` routes).
 */
export async function getCollectionBySlug(
  slug: string,
): Promise<Collection | null> {
  "use cache";
  cacheTag("collections", `collection-${slug}`);
  cacheLife("hours");

  try {
    const collection = await collectionsRepository.findBySlug(slug);
    return collection ? selectCollectionSchema.parse(collection) : null;
  } catch (error) {
    console.error("Error fetching collection:", error);
    return null;
  }
}

/**
 * Invalidates the collections cache after admin mutations.
 */
export async function revalidateCollections(): Promise<void> {
  revalidateTag("collections", "max");
}
