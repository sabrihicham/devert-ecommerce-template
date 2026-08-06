"use client";

/** FUNCTIONALITY */
import { useCart } from "@/hooks/cart";
/** COMPONENTS */
import Link from "next/link";
import { Skeleton } from "@/components/ui/skeleton";
/** ICONS */
import { ShoppingBag } from "lucide-react";

export const CartLink = () => {
  const { items: cartProducts, isFetching } = useCart();

  if (isFetching) {
    return <Skeleton className="size-10 rounded-md" />;
  }

  const totalItemsCart = cartProducts.reduce(
    (acc, cartItem) => acc + cartItem.quantity,
    0
  );

  return (
    <Link
      href="/cart"
      aria-label="سلة التسوق"
      className="relative rounded-lg p-2.5 text-muted-foreground transition hover:bg-muted hover:text-foreground"
    >
      <ShoppingBag size={18} />
      <span className="absolute -end-1 -top-1 flex size-5 items-center justify-center rounded-full bg-primary text-xs font-bold text-primary-foreground">
        {totalItemsCart || 0}
      </span>
    </Link>
  );
};
