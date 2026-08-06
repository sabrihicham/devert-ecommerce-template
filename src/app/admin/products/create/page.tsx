import { Suspense } from "react";
import { CreateProductForm } from "@/components/admin";
import { getCollections } from "@/app/actions";
import { Skeleton } from "@/components/ui/skeleton";

async function DynamicCreateProductContent() {
  const collections = await getCollections();
  const categories = collections.map((c) => ({
    value: c.slug,
    label: c.name,
  }));

  return <CreateProductForm categories={categories} />;
}

function CreateProductSkeleton() {
  return (
    <div className="space-y-6 p-6">
      <Skeleton className="h-8 w-48" />
      <div className="space-y-4">
        <Skeleton className="h-10 w-full" />
        <Skeleton className="h-10 w-full" />
        <Skeleton className="h-32 w-full" />
        <Skeleton className="h-10 w-32" />
      </div>
    </div>
  );
}

export default function CreateProductPage() {
  return (
    <Suspense fallback={<CreateProductSkeleton />}>
      <DynamicCreateProductContent />
    </Suspense>
  );
}
