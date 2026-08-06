import { Suspense } from "react";
import { notFound } from "next/navigation";

import {
  getCategoryProducts,
  getCollections,
  getCollectionBySlug,
} from "@/app/actions";
import {
  ProductsSkeleton,
  ProductCatalog,
  getCatalogSort,
  sortProducts,
} from "@/components/products";
import type { ProductCategory } from "@/lib/db/drizzle/schema";

interface Props {
  params: Promise<{
    category: string;
  }>;
  searchParams: Promise<{ sort?: string }>;
}

export async function generateStaticParams() {
  const collections = await getCollections();
  return collections.map((collection) => ({ category: collection.slug }));
}

export async function generateMetadata({ params }: Props) {
  const { category } = await params;
  const collection = await getCollectionBySlug(category);

  if (!collection) {
    return {
      title: "Category | Ecommerce Template",
      description: "Browse the catalog by category.",
    };
  }

  return {
    title: `${collection.name} | Ecommerce Template`,
    description: `${collection.name} category at Ecommerce Template by Marcos Camara`,
  };
}

async function DynamicCategoryContent({
  params,
  sort,
}: {
  params: Promise<{ category: string }>;
  sort: ReturnType<typeof getCatalogSort>;
}) {
  const { category } = await params;
  const collection = await getCollectionBySlug(category);

  if (!collection) {
    notFound();
  }

  return <CategoryProducts category={collection.slug} title={collection.name} sort={sort} />;
}

const CategoryPage = async ({ params, searchParams }: Props) => {
  const sort = getCatalogSort((await searchParams).sort);
  return (
    <section className="pt-14">
      <Suspense fallback={<ProductsSkeleton items={6} />}>
        <DynamicCategoryContent params={params} sort={sort} />
      </Suspense>
    </section>
  );
};

const CategoryProducts = async ({
  category,
  title,
  sort,
}: {
  category: ProductCategory;
  title: string;
  sort: ReturnType<typeof getCatalogSort>;
}) => {
  const products = await getCategoryProducts(category);
  return <ProductCatalog title={title} eyebrow="Collection" products={sortProducts(products, sort)} sort={sort} />;
};

export default CategoryPage;
