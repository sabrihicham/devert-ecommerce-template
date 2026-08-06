import { Suspense } from "react";
import { getAllProducts } from "@/services/products.service";
import { getAllCollections } from "@/services/collections.service";
import { ProductsList } from "@/components/admin/ProductsList";

async function ProductsContent() {
  const [products, collections] = await Promise.all([
    getAllProducts(),
    getAllCollections(),
  ]);
  return <ProductsList products={products} categories={collections} />;
}

function ProductsSkeleton() {
  return (
    <div className="flex flex-col gap-3 animate-pulse">
      <div className="h-16 rounded-md bg-white/5" />
      <div className="h-16 rounded-md bg-white/5" />
      <div className="h-16 rounded-md bg-white/5" />
    </div>
  );
}

export default function AdminProductsPage() {
  return (
    <Suspense fallback={<ProductsSkeleton />}>
      <ProductsContent />
    </Suspense>
  );
}
