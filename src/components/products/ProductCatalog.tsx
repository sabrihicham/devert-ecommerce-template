"use client";

import { useState } from "react";

import type { ProductWithVariants } from "@/lib/db/drizzle/schema";
import { CatalogToolbar } from "./CatalogToolbar";
import { GridProducts } from "./GridProducts";
import { ProductItem } from "./ProductItem";
import type { CatalogSort } from "./catalog";

interface ProductCatalogProps {
  title: string;
  eyebrow?: string;
  products: ProductWithVariants[];
  sort: CatalogSort;
}

export function ProductCatalog({
  title,
  eyebrow = "Curated for you",
  products,
  sort,
}: ProductCatalogProps) {
  const [density, setDensity] = useState<"comfortable" | "compact">(
    "comfortable",
  );

  return (
    <section className="space-y-6 sm:space-y-8">
      <div className="max-w-2xl space-y-2">
        <p className="text-xs font-medium uppercase tracking-[0.22em] text-color-secondary">
          {eyebrow}
        </p>
        <h1 className="text-3xl font-semibold tracking-[-0.04em] sm:text-4xl">
          {title}
        </h1>
      </div>

      <CatalogToolbar
        count={products.length}
        sort={sort}
        density={density}
        onDensityChange={setDensity}
      />

      {products.length ? (
        <GridProducts density={density}>
          {products.map((product) => (
            <ProductItem key={product.id} product={product} />
          ))}
        </GridProducts>
      ) : (
        <div className="flex min-h-72 flex-col items-center justify-center rounded-xl border border-dashed border-border-secondary/60 bg-background-secondary px-6 text-center">
          <h2 className="text-lg font-semibold">Nothing here yet</h2>
          <p className="mt-2 max-w-sm text-sm text-color-secondary">
            New pieces are on their way. Please check back soon.
          </p>
        </div>
      )}
    </section>
  );
}
