import { Suspense } from "react";
import { notFound } from "next/navigation";

import {
  getCategoryProducts,
  getCollections,
  getCollectionBySlug,
} from "@/app/actions";
import {
  ProductsSkeleton,
  GridProducts,
  ProductItem,
} from "@/components/products";
import type { ProductCategory } from "@/lib/db/drizzle/schema";

interface Props {
  params: Promise<{
    category: string;
  }>;
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
}: {
  params: Promise<{ category: string }>;
}) {
  const { category } = await params;
  const collection = await getCollectionBySlug(category);

  if (!collection) {
    notFound();
  }

  return <CategoryProducts category={collection.slug} />;
}

const CategoryPage = async ({ params }: Props) => {
  return (
    <section className="pt-14">
      <Suspense fallback={<ProductsSkeleton items={6} />}>
        <DynamicCategoryContent params={params} />
      </Suspense>
    </section>
  );
};

const CategoryProducts = async ({
  category,
}: {
  category: ProductCategory;
}) => {
  const products = await getCategoryProducts(category);

  return (
    <GridProducts>
      {products.map((product) => (
        <ProductItem key={product.id} product={product} />
      ))}
    </GridProducts>
  );
};

export default CategoryPage;
