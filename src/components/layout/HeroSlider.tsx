"use client";

import { useRef } from "react";
import Image from "next/image";
import Link from "next/link";
import Autoplay from "embla-carousel-autoplay";

import {
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselDots,
} from "@/components/ui/carousel";
import type { Banner } from "@/lib/db/drizzle/schema";

interface HeroSliderProps {
  banners: Banner[];
}

export function HeroSlider({ banners }: HeroSliderProps) {
  const autoplay = useRef(
    Autoplay({ delay: 5000, stopOnMouseEnter: true, stopOnInteraction: false }),
  );

  if (banners.length === 0) return null;

  return (
    <div className="relative w-full overflow-hidden">
      <Carousel
        opts={{ loop: banners.length > 1 }}
        plugins={banners.length > 1 ? [autoplay.current] : []}
        className="w-full"
      >
        <CarouselContent className="-ml-0">
          {banners.map((banner, index) => (
            <CarouselItem key={banner.id} className="pl-0">
              <Slide banner={banner} priority={index === 0} />
            </CarouselItem>
          ))}
        </CarouselContent>

        {banners.length > 1 && (
          <div className="absolute inset-x-0 bottom-4 z-10 sm:bottom-6">
            <CarouselDots />
          </div>
        )}
      </Carousel>
    </div>
  );
}

function Slide({ banner, priority }: { banner: Banner; priority: boolean }) {
  const content = (
    <div className="relative h-[52vh] w-full min-h-[320px] sm:h-[65vh] lg:h-[80vh]">
      <Image
        src={banner.imageUrl}
        alt={banner.title || "Homepage banner"}
        fill
        priority={priority}
        className="object-cover"
        sizes="100vw"
      />
      <div className="absolute inset-0 bg-gradient-to-t from-black/85 via-black/25 to-transparent" />

      {(banner.title || banner.subtitle) && (
        <div className="absolute inset-x-0 bottom-0 flex flex-col gap-3 p-6 sm:p-12 lg:p-16">
          {banner.title && (
            <h1 className="max-w-xl text-3xl font-bold tracking-tight text-white animate-slideInUp sm:text-4xl lg:text-5xl">
              {banner.title}
            </h1>
          )}
          {banner.subtitle && (
            <p className="max-w-lg text-sm text-color-tertiary animate-fadeIn sm:text-base">
              {banner.subtitle}
            </p>
          )}
          {banner.linkUrl && (
            <span className="mt-2 inline-flex w-fit items-center rounded-full bg-white px-5 py-2.5 text-sm font-semibold text-black transition-transform group-hover:scale-105">
              Shop now
            </span>
          )}
        </div>
      )}
    </div>
  );

  return banner.linkUrl ? (
    <Link href={banner.linkUrl} className="group block">
      {content}
    </Link>
  ) : (
    content
  );
}
