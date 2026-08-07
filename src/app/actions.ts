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
import { getLocalizedArray, getLocalizedText, type Locale } from "@/lib/i18n";

function localizeProduct(product: ProductWithVariants, locale: Locale): ProductWithVariants {
  return {
    ...product,
    name: getLocalizedText({ locale, ar: product.name, fr: product.nameFr }),
    description: getLocalizedText({ locale, ar: product.description, fr: product.descriptionFr }),
    ingredients: getLocalizedText({ locale, ar: product.ingredients, fr: product.ingredientsFr }),
    usage: getLocalizedText({ locale, ar: product.usage, fr: product.usageFr }),
    warnings: getLocalizedText({ locale, ar: product.warnings, fr: product.warningsFr }),
    tags: getLocalizedArray({ locale, ar: product.tags, fr: product.tagsFr }),
    variants: product.variants.map((variant) => ({
      ...variant,
      flavor: getLocalizedText({ locale, ar: variant.flavor, fr: variant.flavorFr }),
    })),
  };
}

function localizeCollection(collection: Collection, locale: Locale): Collection {
  return {
    ...collection,
    name: getLocalizedText({ locale, ar: collection.name, fr: collection.nameFr }),
    description: getLocalizedText({ locale, ar: collection.description, fr: collection.descriptionFr, fallback: collection.description }),
  };
}

function localizeBanner(banner: Banner, locale: Locale): Banner {
  return {
    ...banner,
    title: getLocalizedText({ locale, ar: banner.title, fr: banner.titleFr, fallback: banner.title }) || null,
    subtitle: getLocalizedText({ locale, ar: banner.subtitle, fr: banner.subtitleFr, fallback: banner.subtitle }) || null,
    buttonLabel: getLocalizedText({ locale, ar: banner.buttonLabel, fr: banner.buttonLabelFr, fallback: banner.buttonLabel }) || null,
  };
}

/**
 * Fetch all products with caching
 * Cache is tagged for invalidation and set to revalidate every hour
 */
export async function getAllProducts(locale: Locale = "ar"): Promise<ProductWithVariants[]> {
  "use cache";
  cacheTag("products", `products-${locale}`);
  cacheLife("hours");

  try {
    const products = await productsRepository.findAll();
    const validatedProducts = productWithVariantsSchema.array().parse(products);
    return validatedProducts.map((product) => localizeProduct(product, locale)).sort((a, b) => a.name.localeCompare(b.name, locale));
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
  locale: Locale = "ar",
): Promise<ProductWithVariants[]> {
  "use cache";
  cacheTag("products", `products-${locale}`, `category-${category}-${locale}`);
  cacheLife("hours");

  try {
    const products = await productsRepository.findByCategory(category);
    const validatedProducts = productWithVariantsSchema.array().parse(products);
    return validatedProducts.map((product) => localizeProduct(product, locale)).sort((a, b) => a.name.localeCompare(b.name, locale));
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
  locale: Locale = "ar",
): Promise<ProductWithVariants | null> {
  "use cache";
  cacheTag("products", `products-${locale}`, `product-${productId}-${locale}`);
  cacheLife("hours");

  try {
    const product = await productsRepository.findById(productId);
    if (!product) return null;
    return localizeProduct(productWithVariantsSchema.parse(product), locale);
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
  locale: Locale = "ar",
): Promise<ProductWithVariants[]> {
  try {
    const allProducts = await getAllProducts(locale);
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
  revalidateTag("products-ar", "max");
  revalidateTag("products-fr", "max");

  // If a specific product ID is provided, also invalidate that specific product
  if (productId) {
    revalidateTag(`product-${productId}-ar`, "max");
    revalidateTag(`product-${productId}-fr`, "max");
  }
}

/**
 * Fetch admin-curated "Featured" products for the homepage, with caching.
 */
export async function getFeaturedProducts(
  limit: number = 8,
  locale: Locale = "ar",
): Promise<ProductWithVariants[]> {
  "use cache";
  cacheTag("products", `products-${locale}`, `featured-products-${locale}`);
  cacheLife("hours");

  try {
    const products = await productsRepository.findFeatured(limit);
    return productWithVariantsSchema.array().parse(products).map((product) => localizeProduct(product, locale));
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
  locale: Locale = "ar",
): Promise<ProductWithVariants[]> {
  "use cache";
  cacheTag("products", `products-${locale}`, `new-arrivals-${locale}`);
  cacheLife("hours");

  try {
    const products = await productsRepository.findRecent(limit);
    return productWithVariantsSchema.array().parse(products).map((product) => localizeProduct(product, locale));
  } catch (error) {
    console.error("Error fetching new arrivals:", error);
    return [];
  }
}

export async function getBestSellers(limit: number = 8, locale: Locale = "ar"): Promise<ProductWithVariants[]> {
  "use cache";
  cacheTag("products", `products-${locale}`, `best-sellers-${locale}`);
  cacheLife("hours");
  try { return productWithVariantsSchema.array().parse(await productsRepository.findBestSellers(limit)).map((product) => localizeProduct(product, locale)); }
  catch (error) { console.error("Error fetching best sellers:", error); return []; }
}

/**
 * Fetch active homepage hero-slider banners, ordered for display, with caching.
 */
export async function getActiveBanners(locale: Locale = "ar"): Promise<Banner[]> {
  try {
    // Banners are edited frequently from the admin panel. Read the active
    // records directly so toggling a banner is reflected immediately instead
    // of waiting for a stale cached homepage response.
    const banners = await bannersRepository.findActive();
    return selectBannerSchema.array().parse(banners).map((banner) => localizeBanner(banner, locale));
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
export async function getCollections(locale: Locale = "ar"): Promise<Collection[]> {
  "use cache";
  cacheTag("collections", `collections-${locale}`);
  cacheLife("hours");

  try {
    const collections = await collectionsRepository.findAll();
    return selectCollectionSchema.array().parse(collections).map((collection) => localizeCollection(collection, locale));
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
  locale: Locale = "ar",
): Promise<Collection | null> {
  "use cache";
  cacheTag("collections", `collections-${locale}`, `collection-${slug}-${locale}`);
  cacheLife("hours");

  try {
    const collection = await collectionsRepository.findBySlug(slug);
    return collection ? localizeCollection(selectCollectionSchema.parse(collection), locale) : null;
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
