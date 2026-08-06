import { Suspense } from "react";
import { getActiveBanners, getBestSellers, getCollections, getFeaturedProducts, getNewArrivals } from "./actions";
import { CategoryGrid, HomeHero, HomeProducts, PromoGrid } from "@/components/home/HomeSections";

export default function Home() {
  return <div className="storefront-page"><Suspense fallback={null}><HomeData /></Suspense></div>;
}

async function HomeData() {
  const [banners, collections, featured, recent, best] = await Promise.all([
    getActiveBanners(), getCollections(), getFeaturedProducts(), getNewArrivals(), getBestSellers(),
  ]);
  return <><HomeHero banners={banners}/><CategoryGrid categories={collections}/><HomeProducts featured={featured} recent={recent} best={best}/><PromoGrid banners={banners}/></>;
}
