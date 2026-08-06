"use client";

import Autoplay from "embla-carousel-autoplay";
import Image from "next/image";
import Link from "next/link";
import { ArrowLeft, ChevronLeft, ChevronRight } from "lucide-react";
import { useMemo, useState } from "react";
import {
  Carousel,
  CarouselContent,
  CarouselItem,
  type CarouselApi,
} from "@/components/ui/carousel";
import type { Collection } from "@/lib/db/drizzle/schema";

export function CategorySlider({ categories }: { categories: Collection[] }) {
  const [api, setApi] = useState<CarouselApi>();
  const autoplay = useMemo(
    () =>
      Autoplay({
        delay: 4200,
        stopOnInteraction: true,
        stopOnMouseEnter: true,
      }),
    [],
  );

  return (
    <div className="relative px-0.5 sm:px-6">
      <Carousel
        opts={{ align: "start", loop: categories.length > 2, dragFree: true }}
        plugins={[autoplay]}
        setApi={setApi}
        className="w-full"
      >
        <CarouselContent className="-ml-3 sm:-ml-4">
          {categories.map((category) => (
            <CarouselItem
              key={category.id}
              className="basis-[61%] pl-3 xs:basis-[46%] sm:basis-[35%] sm:pl-4 md:basis-[28%] lg:basis-[24%]"
            >
              <Link
                href={`/${category.slug}`}
                aria-label={`استكشف قسم ${category.name}`}
                className="group relative isolate block min-h-[175px] overflow-hidden rounded-[1.25rem] border border-border/80 bg-card shadow-sm transition duration-300 hover:-translate-y-1 hover:border-primary/40 hover:shadow-md focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2 sm:min-h-[220px] sm:rounded-[1.4rem]"
              >
                <div className="absolute inset-x-1.5 top-1.5 h-[54%] overflow-hidden rounded-lg bg-secondary/60 sm:inset-x-2 sm:top-2 sm:rounded-xl">
                  {category.imageUrl ? (
                    <Image
                      src={category.imageUrl}
                      alt={category.name}
                      fill
                      sizes="(max-width: 639px) 70vw, (max-width: 1023px) 42vw, 28vw"
                      className="object-contain p-2 transition duration-500 group-hover:scale-110 sm:p-3"
                    />
                  ) : (
                    <div className="flex h-full items-center justify-center text-4xl font-black text-primary/20">
                      {category.name.slice(0, 1)}
                    </div>
                  )}
                </div>
                <div className="absolute inset-0 bg-gradient-to-t from-card via-card/90 via-[35%] to-transparent" />
                <div className="absolute inset-x-3 bottom-2.5 sm:inset-x-3.5 sm:bottom-3.5">
                  <h3 className="text-xs font-black leading-tight sm:text-base">
                    {category.name}
                  </h3>
                  {category.description && (
                    <p className="mt-0.5 line-clamp-1 text-[9px] leading-relaxed text-muted-foreground sm:text-[11px]">
                      {category.description}
                    </p>
                  )}
                  <span className="mt-1 inline-flex min-h-8 items-center gap-1 text-[10px] font-bold text-primary sm:text-[11px]">
                    استكشف القسم
                    <ArrowLeft className="size-4 transition-transform group-hover:-translate-x-1" />
                  </span>
                </div>
              </Link>
            </CarouselItem>
          ))}
        </CarouselContent>
      </Carousel>
      {api && categories.length > 2 && (
        <div className="mt-3 flex items-center justify-center gap-2">
          <button
            type="button"
            onClick={() => api.scrollPrev()}
            className="grid size-10 place-items-center rounded-full border border-border bg-background text-foreground shadow-sm transition hover:border-primary hover:text-primary focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary"
            aria-label="التصنيف السابق"
          >
            <ChevronRight className="size-4" aria-hidden="true" />
          </button>
          <span className="h-px w-8 bg-border" aria-hidden="true" />
          <button
            type="button"
            onClick={() => api.scrollNext()}
            className="grid size-10 place-items-center rounded-full border border-border bg-background text-foreground shadow-sm transition hover:border-primary hover:text-primary focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary"
            aria-label="التصنيف التالي"
          >
            <ChevronLeft className="size-4" aria-hidden="true" />
          </button>
        </div>
      )}
      {api && categories.length > 2 && (
        <p className="mt-2 text-center text-[10px] text-muted-foreground sm:hidden">
          اسحب لاكتشاف المزيد
        </p>
      )}
    </div>
  );
}
