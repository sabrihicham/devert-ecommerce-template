import { Suspense } from "react";
import { getAllCollections } from "@/services/collections.service";
import { CollectionsList } from "@/components/admin/CollectionsList";

export async function generateMetadata() {
  return {
    title: "Categories | Admin",
  };
}

async function CollectionsContent() {
  const collections = await getAllCollections();
  return <CollectionsList collections={collections} />;
}

function CollectionsSkeleton() {
  return (
    <div className="flex flex-col gap-3 animate-pulse">
      <div className="h-16 rounded-md bg-white/5" />
      <div className="h-16 rounded-md bg-white/5" />
      <div className="h-16 rounded-md bg-white/5" />
    </div>
  );
}

export default function AdminCollectionsPage() {
  return (
    <Suspense fallback={<CollectionsSkeleton />}>
      <CollectionsContent />
    </Suspense>
  );
}
