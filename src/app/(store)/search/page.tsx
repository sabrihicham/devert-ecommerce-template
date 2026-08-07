import { Suspense } from "react";

import { getAllProducts } from "@/app/actions";
import { getServerLocale } from "@/lib/i18n/server";
import { pickFirst, searchProducts } from "@/utils";
import { GridProducts, ProductItem } from "@/components/products";

interface SearchProps {
  searchParams: Promise<{ q: string | undefined }>;
}

async function SearchResults({ searchParams }: SearchProps) {
  const locale = await getServerLocale();
  const [products, params] = await Promise.all([getAllProducts(locale), searchParams]);

  const q = pickFirst(params, "q");
  const filteredProducts = searchProducts(products, q);

  return (
    <section className="pt-14">
      {filteredProducts.length > 0 ? (
        <GridProducts>
          {filteredProducts.map((product) => (
            <ProductItem key={product.id} product={product} />
          ))}
        </GridProducts>
      ) : (
        <h3 className="text-sm text-center">
          No products found for &quot;{q}&quot;
        </h3>
      )}
    </section>
  );
}

export default function Search(props: SearchProps) {
  return (
    <Suspense fallback={<section className="pt-14" />}>
      <SearchResults searchParams={props.searchParams} />
    </Suspense>
  );
}
