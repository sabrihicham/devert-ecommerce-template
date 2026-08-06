import { Suspense } from "react";
import { getAllBanners } from "@/services/banners.service";
import { BannersList } from "@/components/admin/BannersList";

export async function generateMetadata() {
  return {
    title: "Banners | Admin",
  };
}

async function BannersContent() {
  const banners = await getAllBanners();
  return <BannersList banners={banners} />;
}

function BannersSkeleton() {
  return (
    <div className="flex flex-col gap-3 animate-pulse">
      <div className="h-24 rounded-md bg-white/5" />
      <div className="h-24 rounded-md bg-white/5" />
      <div className="h-24 rounded-md bg-white/5" />
    </div>
  );
}

export default function AdminBannersPage() {
  return (
    <Suspense fallback={<BannersSkeleton />}>
      <BannersContent />
    </Suspense>
  );
}
