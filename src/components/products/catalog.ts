import type { ProductWithVariants } from "@/lib/db/drizzle/schema";

export const CATALOG_SORTS = [
  "newest",
  "price-asc",
  "price-desc",
  "name-asc",
] as const;

export type CatalogSort = (typeof CATALOG_SORTS)[number];

export function getCatalogSort(value: string | undefined): CatalogSort {
  return CATALOG_SORTS.includes(value as CatalogSort)
    ? (value as CatalogSort)
    : "newest";
}

export function sortProducts(
  products: ProductWithVariants[],
  sort: CatalogSort,
): ProductWithVariants[] {
  const sorted = [...products];

  switch (sort) {
    case "price-asc":
      return sorted.sort((a, b) => a.price - b.price);
    case "price-desc":
      return sorted.sort((a, b) => b.price - a.price);
    case "name-asc":
      return sorted.sort((a, b) => a.name.localeCompare(b.name));
    default:
      return sorted.sort(
        (a, b) =>
          new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime(),
      );
  }
}
