import { Suspense } from "react";
import {
  getAllProducts,
  getFeaturedProducts,
  getNewArrivals,
  getActiveBanners,
} from "./actions";
import {
  ProductsSkeleton,
  GridProducts,
  ProductItem,
  ProductCarousel,
} from "@/components/products";
import { StoreBanner, HeroSlider, AnimatedSection } from "@/components/layout";
import { getStoreSettings } from "@/services/settings.service";

const Home = async () => {
  return (
    <section className="pt-14">
      <Suspense fallback={null}>
        <TopBanner />
      </Suspense>

      <Suspense fallback={null}>
        <Hero />
      </Suspense>

      <div className="flex flex-col gap-16 px-4 py-12 sm:gap-24 sm:px-6 sm:py-16 lg:px-8">
        <AnimatedSection>
          <Suspense fallback={<CarouselSkeleton />}>
            <Featured />
          </Suspense>
        </AnimatedSection>

        <AnimatedSection>
          <Suspense fallback={<CarouselSkeleton />}>
            <NewArrivals />
          </Suspense>
        </AnimatedSection>

        <AnimatedSection>
          <div className="flex flex-col gap-6 sm:gap-9">
            <h2 className="text-xl font-bold tracking-tight sm:text-2xl">
              Shop All
            </h2>
            <Suspense fallback={<ProductsSkeleton items={18} />}>
              <AllProducts />
            </Suspense>
          </div>
        </AnimatedSection>
      </div>
    </section>
  );
};

const TopBanner = async () => {
  const settings = await getStoreSettings();
  const showBanner = Boolean(settings?.bannerActive && settings?.bannerText);

  if (!showBanner) return null;

  return <StoreBanner text={settings!.bannerText!} />;
};

const Hero = async () => {
  const banners = await getActiveBanners();
  return <HeroSlider banners={banners} />;
};

const Featured = async () => {
  const products = await getFeaturedProducts();
  return (
    <ProductCarousel
      title="Featured Products"
      subtitle="Hand-picked pieces we think you'll love"
      products={products}
    />
  );
};

const NewArrivals = async () => {
  const products = await getNewArrivals();
  return (
    <ProductCarousel
      title="New Arrivals"
      subtitle="Fresh drops, straight off the rack"
      products={products}
    />
  );
};

const CarouselSkeleton = () => (
  <div className="flex gap-3.5 overflow-hidden">
    {Array.from({ length: 5 }, (_, index) => (
      <div
        key={index}
        className="w-[65%] shrink-0 xs:w-[45%] sm:w-1/3 lg:w-1/4 xl:w-1/5"
      >
        <ProductsSkeleton items={1} />
      </div>
    ))}
  </div>
);

const AllProducts = async () => {
  const products = await getAllProducts();

  if (products.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[50vh]">
        <h2 className="text-xl font-bold">No products available</h2>
        <p className="mt-2 text-gray-600">
          Check back later to see our products
        </p>
      </div>
    );
  }

  return (
    <GridProducts>
      {products.map((product) => (
        <ProductItem key={product.id} product={product} />
      ))}
    </GridProducts>
  );
};

export default Home;

