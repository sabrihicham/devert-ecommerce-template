"use client";

/** FUNCTIONALITY */
import { useWishlist } from "@/hooks/wishlist";
/** COMPONENTS */
import Link from "next/link";
import { Skeleton } from "@/components/ui/skeleton";
/** ICONS */
import { Heart } from "lucide-react";
import { useTranslations } from "@/providers/LocaleProvider";

export const WishlistLink = () => {
  const { items: wishlistProducts, isFetching } = useWishlist();
  const t = useTranslations();

  if (isFetching) {
    return <Skeleton className="size-10 rounded-md" />;
  }

  return (
    <Link
      href="/wishlist"
      aria-label={t.nav.wishlist}
      className="relative rounded-lg p-2.5 text-muted-foreground transition hover:bg-muted hover:text-foreground"
    >
      <Heart size={18} />
      <span className="absolute -end-1 -top-1 flex size-5 items-center justify-center rounded-full bg-primary text-xs font-bold text-primary-foreground">
        {wishlistProducts.length || 0}
      </span>
    </Link>
  );
};
