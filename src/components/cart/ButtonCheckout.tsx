"use client";

import Link from "next/link";

import { Button } from "@/components/ui/button";
import type { CartItem } from "@/lib/db/drizzle/schema";
import { useTranslations } from "@/providers/LocaleProvider";

interface ButtonCheckoutProps {
  cartItemIds: CartItem["id"][];
}

export const ButtonCheckout = ({ cartItemIds }: ButtonCheckoutProps) => {
  const isDisabled = cartItemIds.length === 0;
  const t = useTranslations();

  return (
    <Button
      asChild
      disabled={isDisabled}
      className="w-full rounded-none bg-background-secondary p-2.5 h-full transition-all hover:bg-background-tertiary"
    >
      <Link href={isDisabled ? "#" : "/checkout"} aria-disabled={isDisabled}>
        {t.cart.checkout}
      </Link>
    </Button>
  );
};
