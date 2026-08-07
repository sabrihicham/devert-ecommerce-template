import { Suspense } from "react";
import { getActiveBanners, getBestSellers, getCollections, getFeaturedProducts, getNewArrivals } from "./actions";
import { CategoryGrid, HomeHero, HomeProducts, PromoGrid } from "@/components/home/HomeSections";
import { getServerLocale } from "@/lib/i18n/server";

export default function Home() {
  return <div className="storefront-page"><Suspense fallback={null}><HomeData /></Suspense></div>;
}

async function HomeData() {
  const locale = await getServerLocale();
  const [banners, collections, featured, recent, best] = await Promise.all([
    getActiveBanners(locale), getCollections(locale), getFeaturedProducts(8, locale), getNewArrivals(8, locale), getBestSellers(8, locale),
  ]);
  return <><HomeHero banners={banners} locale={locale}/><CategoryGrid categories={collections} locale={locale}/><HomeProducts featured={featured} recent={recent} best={best} locale={locale}/><PromoGrid banners={banners}/></>;
}
