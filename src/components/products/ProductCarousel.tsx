"use client";

import { useState } from "react";
import { LuChevronLeft, LuChevronRight } from "react-icons/lu";

import {
  Carousel,
  CarouselContent,
  CarouselItem,
  type CarouselApi,
} from "@/components/ui/carousel";
import { Button } from "@/components/ui/button";
import { ProductItem } from "./ProductItem";
import type { ProductWithVariants } from "@/lib/db/drizzle/schema";

interface ProductCarouselProps {
  title: string;
  subtitle?: string;
  products: ProductWithVariants[];
}

export function ProductCarousel({
  title,
  subtitle,
  products,
}: ProductCarouselProps) {
  const [api, setApi] = useState<CarouselApi>();

  if (products.length === 0) return null;

  return (
    <section className="w-full">
      <div className="mb-5 flex items-end justify-between gap-4 sm:mb-7">
        <div>
          <h2 className="text-xl font-bold tracking-tight sm:text-2xl">
            {title}
          </h2>
          {subtitle && (
            <p className="mt-1 text-sm text-color-secondary">{subtitle}</p>
          )}
        </div>

        <div className="hidden gap-2 sm:flex">
          <Button
            variant="outline"
            size="icon"
            className="h-9 w-9 rounded-full"
            onClick={() => api?.scrollPrev()}
            aria-label="Previous"
          >
            <LuChevronLeft size={18} />
          </Button>
          <Button
            variant="outline"
            size="icon"
            className="h-9 w-9 rounded-full"
            onClick={() => api?.scrollNext()}
            aria-label="Next"
          >
            <LuChevronRight size={18} />
          </Button>
        </div>
      </div>

      <Carousel
        opts={{ align: "start", dragFree: true }}
        setApi={setApi}
        className="w-full"
      >
        <CarouselContent>
          {products.map((product) => (
            <CarouselItem
              key={product.id}
              className="basis-[65%] xs:basis-[45%] sm:basis-1/3 lg:basis-1/4 xl:basis-1/5"
            >
              <ProductItem product={product} />
            </CarouselItem>
          ))}
        </CarouselContent>
      </Carousel>
    </section>
  );
}
