/** COMPONENTS */
import { ProductImage } from "./ProductImage";
import Link from "next/link";
/** FUNCTIONALITY */
import dynamic from "next/dynamic";
import { ArrowLeft, PackageX } from "lucide-react";
/** TYPES */
import type { ProductWithVariants } from "@/lib/db/drizzle/schema";

const WishlistButton = dynamic(() => import("../wishlist/WishlistButton"));

interface ProductItemProps {
  product: ProductWithVariants;
}

export const ProductItem = ({ product }: ProductItemProps) => {
  const { name, id, img, price, compareAtPrice, category, variants, isNewArrival } = product;

  const productLink = `/${category}/${id}?variant=${encodeURIComponent(variants[0]?.flavor ?? "")}`;
  const availableStock = variants.reduce((total, variant) => total + (variant.isActive ? variant.stock : 0), 0);

  return (
    <article className="group relative flex min-w-0 flex-col overflow-hidden rounded-2xl border border-border bg-card transition duration-300 hover:-translate-y-1 hover:shadow-md focus-within:ring-2 focus-within:ring-ring">
      <Link
        href={productLink}
        className="relative block overflow-hidden focus-visible:outline-none"
        aria-label={`View ${name}`}
      >
        <ProductImage
          image={img}
          name={name}
          width={280}
          height={425}
          sizes="(max-width: 639px) 50vw, (max-width: 1023px) 33vw, (max-width: 1279px) 25vw, 20vw"
          className="transition-transform duration-700 ease-out group-hover:scale-[1.045]"
        />
        {isNewArrival && <span className="absolute start-2 top-2 rounded-full bg-primary px-2 py-1 text-[11px] font-bold text-primary-foreground">جديد</span>}
        {compareAtPrice && compareAtPrice > price && <span className="absolute start-2 top-2 rounded-full bg-destructive px-2 py-1 text-[11px] font-bold text-destructive-foreground">-{Math.round((1 - price / compareAtPrice) * 100)}%</span>}
      </Link>
      <div className="absolute end-2.5 top-2.5 z-10 rounded-full border border-border bg-card/90 p-0.5 shadow-sm backdrop-blur-sm">
        <WishlistButton productId={id} />
      </div>
      <div className="flex flex-1 flex-col gap-3 p-3.5 sm:p-4">
        <div className="flex items-start justify-between gap-3">
          <Link href={productLink} className="min-w-0 flex-1">
            <h2 className="line-clamp-2 text-sm font-semibold tracking-tight transition-colors duration-300 group-hover:text-primary">
              {name}
            </h2>
          </Link>
          <div className="shrink-0 text-end text-sm font-bold tabular-nums"><span>{new Intl.NumberFormat("ar-DZ", { style: "currency", currency: "DZD", maximumFractionDigits: 0 }).format(price)}</span>{compareAtPrice && compareAtPrice > price && <del className="mt-1 block text-xs font-normal text-muted-foreground">{new Intl.NumberFormat("ar-DZ", { style: "currency", currency: "DZD", maximumFractionDigits: 0 }).format(compareAtPrice)}</del>}</div>
        </div>
        <div className="flex min-h-5 items-center justify-between gap-1.5" aria-label={`${variants.length} available colors`}>
          {variants.slice(0, 4).map((variant) => (
            <span
              key={variant.id}
              title={`${variant.flavor} ${variant.quantity}${variant.quantityUnit}`}
              className="h-2 w-2 rounded-full border border-white/30 bg-color-secondary"
              style={{ backgroundColor: safeColor(variant.flavor) }}
            />
          ))}
          {variants.length > 4 && (
            <span className="text-[11px] text-muted-foreground">+{variants.length - 4}</span>
          )}
          {availableStock <= 0 ? <span className="inline-flex items-center gap-1 text-xs text-destructive"><PackageX className="size-3"/>نفد</span> : <Link href={productLink} className="ms-auto inline-flex items-center text-xs font-semibold text-primary">عرض <ArrowLeft className="ms-1 size-3"/></Link>}
        </div>
      </div>
    </article>
  );
};

function safeColor(color: string) {
  const normalized = color.trim().toLowerCase();
  const knownColors: Record<string, string> = {
    black: "#151515",
    white: "#f4f4f0",
    grey: "#8d8d8d",
    gray: "#8d8d8d",
    beige: "#c8b89d",
    brown: "#7a523b",
    blue: "#3d6d9c",
    navy: "#1e2d45",
    green: "#4f7455",
    red: "#a74444",
    yellow: "#cba53d",
    pink: "#d18d9b",
  };

  return knownColors[normalized] ?? "#767676";
}
