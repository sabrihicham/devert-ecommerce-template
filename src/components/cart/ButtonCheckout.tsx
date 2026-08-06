"use client";

import Link from "next/link";

import { Button } from "@/components/ui/button";
import type { CartItem } from "@/lib/db/drizzle/schema";

interface ButtonCheckoutProps {
  cartItemIds: CartItem["id"][];
}

export const ButtonCheckout = ({ cartItemIds }: ButtonCheckoutProps) => {
  const isDisabled = cartItemIds.length === 0;

  return (
    <Button
      asChild
      disabled={isDisabled}
      className="w-full rounded-none bg-background-secondary p-2.5 h-full transition-all hover:bg-background-tertiary"
    >
      <Link href={isDisabled ? "#" : "/checkout"} aria-disabled={isDisabled}>
        Continue
      </Link>
    </Button>
  );
};

