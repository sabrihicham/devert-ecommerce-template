import { getRandomProducts } from "@/app/actions";
import { GridProducts } from "../products/GridProducts";
import { ProductItem } from "../products/ProductItem";
import { ProductsSkeleton } from "../products/ProductsSkeleton";
import { Suspense } from "react";
import { getDictionary, type Locale } from "@/lib/i18n";

export const RandomProducts = async ({
  productIdToExclude,
  showTitle = true,
  locale,
}: {
  productIdToExclude: number;
  showTitle?: boolean;
  locale?: Locale;
}) => {
  const randomProducts = await getRandomProducts(productIdToExclude, locale ?? "ar");
  const title = getDictionary(locale ?? "ar").home.latest;

  return (
    <>
      {showTitle && (
        <h2 className="mt-24 mb-5 text-xl font-bold sm:text-2xl">
          {title}
        </h2>
      )}
      <GridProducts className="grid-cols-auto-fill-110">
        {randomProducts.map((p) => (
          <ProductItem key={p.id} product={p} />
        ))}
      </GridProducts>
    </>
  );
};

export const SuspenseRandomProducts = async ({
  productIdToExclude,
  showTitle = true,
  locale,
}: {
  productIdToExclude: number;
  showTitle?: boolean;
  locale?: Locale;
}) => {
  return (
    <Suspense
      fallback={
        <>
          {showTitle && (
            <h2 className="mt-24 mb-5 text-xl font-bold sm:text-2xl">
              {getDictionary(locale ?? "ar").home.latest}
            </h2>
          )}
          <ProductsSkeleton extraClassname={"colums-mobile"} items={6} />
        </>
      }
    >
      <RandomProducts
        productIdToExclude={productIdToExclude}
        showTitle={showTitle}
        locale={locale}
      />
    </Suspense>
  );
};
