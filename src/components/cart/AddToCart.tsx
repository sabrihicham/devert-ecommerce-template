"use client";

import { useRef } from "react";
import { useRouter } from "next/navigation";

import { useThrottleFn } from "ahooks";

import { useCartMutation } from "@/hooks/cart";
import {
  type ProductVariant,
  type ProductWithVariants,
} from "@/lib/db/drizzle/schema";

import { Button } from "@/components/ui/button";

import { Colors } from "./Colors";
import { Sizes, type SizesRef } from "./Sizes";

interface BaseAddToCartProps {
  product: ProductWithVariants;
  selectedVariant?: ProductVariant;
}

function useAddToCartAction(selectedVariant?: ProductVariant) {
  const router = useRouter();
  const { add: addToCart } = useCartMutation();
  const sizesRef = useRef<SizesRef>(null!);

  const { run: throttledAddToCart } = useThrottleFn(
    () => {
      if (!selectedVariant) return;

      addToCart({
        size: sizesRef.current.selectedSize,
        variantId: selectedVariant.id,
      });
    },
    { wait: 300 },
  );

  return {
    sizesRef,
    throttledAddToCart,
    isDisabled: !selectedVariant,
    buyNow: () => {
      if (!selectedVariant) return;
      const size = sizesRef.current.selectedSize;
      router.push(`/checkout/direct?variant=${selectedVariant.id}&size=${encodeURIComponent(size)}`);
    },
  };
}

export function AddToCart({
  product,
  selectedVariant,
}: BaseAddToCartProps) {
  const { sizesRef, throttledAddToCart, isDisabled, buyNow } =
    useAddToCartAction(selectedVariant);

  return (
    <>
      <div className="p-5">
        <Sizes ref={sizesRef} productSizes={selectedVariant?.sizes ?? []} />
        <Colors
          variants={product.variants}
          selectedVariantColor={selectedVariant?.color}
        />
      </div>

      <div className="grid grid-cols-2 border-t border-solid border-border-primary">
        <Button
          type="submit"
          variant="default"
          disabled={isDisabled}
          onClick={() => throttledAddToCart()}
          className="rounded-none border-r border-border-primary bg-background-secondary p-2 text-13 transition duration-150 ease hover:bg-background-tertiary"
        >
          Add to cart
        </Button>
        <Button
          type="button"
          disabled={isDisabled}
          onClick={buyNow}
          className="rounded-none bg-white p-2 text-13 text-black hover:bg-neutral-200"
        >
          Buy now
        </Button>
      </div>
    </>
  );
}

export function MobileAddToCart({
  product,
  selectedVariant,
}: BaseAddToCartProps) {
  const { sizesRef, throttledAddToCart, isDisabled, buyNow } =
    useAddToCartAction(selectedVariant);

  return (
    <div className="flex flex-col gap-4">
      <div className="flex flex-col gap-3.5">
        <Sizes
          ref={sizesRef}
          productSizes={selectedVariant?.sizes ?? []}
          compact
        />
        <Colors
          variants={product.variants}
          selectedVariantColor={selectedVariant?.color}
          compact
        />
      </div>

      <div className="grid grid-cols-2 gap-2.5">
        <Button type="button" variant="outline" disabled={isDisabled} onClick={() => throttledAddToCart()} className="h-11 border-border-secondary bg-background-secondary text-sm">Add to cart</Button>
        <Button type="button" disabled={isDisabled} onClick={buyNow} className="h-11 bg-white text-sm text-black hover:bg-neutral-200">Buy now</Button>
      </div>
    </div>
  );
}
