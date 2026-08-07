import { notFound, redirect } from "next/navigation";

import { getProduct } from "@/app/actions";
import type { ProductVariant } from "@/lib/db/drizzle/schema";
import type { Locale } from "@/lib/i18n";

import { AddToCart, MobileAddToCart } from "../cart/AddToCart";

import { EditProductButton } from "./EditProductButton";
import { ProductImages } from "./ProductImages";
import { ProductInfo } from "./ProductInfo";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { getDictionary } from "@/lib/i18n";

interface SingleProductProps {
  id: number;
  category: string;
  selectedVariantId?: string;
  locale?: Locale;
}

export const SingleProduct = async ({
  id,
  category,
  selectedVariantId,
  locale = "ar",
}: SingleProductProps) => {
  const product = await getProduct(id, locale);

  if (!product) {
    notFound();
  }

  if (product.category !== category) {
    const variantQuery = selectedVariantId
      ? `?variant=${encodeURIComponent(selectedVariantId)}`
      : "";

    redirect(`/${product.category}/${id}${variantQuery}`);
  }

  if (product.variants.length === 0) {
    notFound();
  }

  const selectedVariant = product.variants.find(
    (variant) => String(variant.id) === selectedVariantId || variant.flavor === selectedVariantId,
  );

  if (!selectedVariant) {
    redirect(
      `/${product.category}/${id}?variant=${product.variants[0].id}`,
    );
  }

  const t = getDictionary(locale);
  const isArabic = locale === "ar";
  const discount = selectedVariant.compareAtPrice && selectedVariant.compareAtPrice > selectedVariant.price
    ? Math.round((1 - selectedVariant.price / selectedVariant.compareAtPrice) * 100)
    : null;

  return (
    <>
      <div className="mx-auto max-w-7xl px-3 pb-28 pt-2 sm:px-5 lg:px-8 lg:pb-10 lg:pt-5">
        <div className="grid gap-5 lg:grid-cols-[minmax(0,1.2fr)_minmax(360px,0.8fr)] lg:items-start xl:gap-8">
          <div className="min-w-0 overflow-hidden rounded-2xl border border-border/80 bg-card/30 shadow-sm">
            <ProductImages name={product.name} selectedVariant={selectedVariant} />
          </div>

          <div className="hidden min-w-0 lg:block">
            <div className="sticky top-24 space-y-5">
              <PurchaseSummary product={product} selectedVariant={selectedVariant} locale={locale} discount={discount} t={t} isArabic={isArabic} />
              <ProductInfo product={product} selectedVariant={selectedVariant} locale={locale} />
            </div>
          </div>
        </div>

        <div className="mt-5 space-y-5 lg:hidden">
          <PurchaseSummary product={product} selectedVariant={selectedVariant} locale={locale} discount={discount} t={t} isArabic={isArabic} compact />
          <ProductInfo product={product} selectedVariant={selectedVariant} locale={locale} />
        </div>

        <div className="mt-8 hidden lg:block">
          <p className="mb-3 text-sm font-semibold text-muted-foreground">{isArabic ? "الوسوم" : "Tags"}</p>
          <div className="flex flex-wrap gap-2">{product.tags.map((tag) => <Badge key={tag} variant="outline">{tag}</Badge>)}</div>
        </div>
        <div className="mt-5 flex flex-wrap gap-2 lg:hidden">
          {product.tags.map((tag) => <Badge key={tag} variant="outline">{tag}</Badge>)}
        </div>
      </div>

      <div className="safe-area-bottom fixed inset-x-0 bottom-0 z-50 border-t border-border/80 bg-background/95 shadow-[0_-8px_30px_rgba(0,0,0,0.12)] backdrop-blur lg:hidden">
        <div className="mx-auto max-w-7xl px-3 py-2.5 sm:px-5">
          <div className="mb-2 flex items-center justify-between gap-3">
            <p className="min-w-0 truncate text-xs font-semibold text-foreground">{product.name}</p>
            <p className="shrink-0 text-sm font-black text-primary">{selectedVariant.price.toLocaleString("ar-DZ")} {isArabic ? "دج" : "DZD"}</p>
          </div>
          <MobileAddToCart product={product} selectedVariant={selectedVariant} />
        </div>
      </div>
    </>
  );
};

function PurchaseSummary({ product, selectedVariant, locale, discount, t, isArabic, compact = false }: { product: Awaited<ReturnType<typeof getProduct>> extends infer P ? Exclude<P, null> : never; selectedVariant: ProductVariant; locale: Locale; discount: number | null; t: ReturnType<typeof getDictionary>; isArabic: boolean; compact?: boolean }) {
  return <Card className="overflow-hidden border-border/80 shadow-sm"><CardContent className={compact ? "p-4" : "p-5"}>
    <div className="mb-3 flex items-start justify-between gap-3"><div className="min-w-0"><p className="mb-1 text-xs font-medium text-primary">{product.brand}</p><h1 className="text-xl font-bold leading-tight tracking-tight sm:text-2xl">{product.name}</h1></div><EditProductButton productId={product.id} /></div>
    <div className="mb-4 flex flex-wrap items-center gap-2"><span className="text-2xl font-black text-primary">{selectedVariant.price.toLocaleString("ar-DZ")} <span className="text-sm font-semibold">{isArabic ? "دج" : "DZD"}</span></span>{selectedVariant.compareAtPrice && selectedVariant.compareAtPrice > selectedVariant.price ? <><span className="text-sm text-muted-foreground line-through">{selectedVariant.compareAtPrice.toLocaleString("ar-DZ")} {isArabic ? "دج" : "DZD"}</span>{discount ? <Badge variant="destructive">-{discount}%</Badge> : null}</> : null}</div>
    <p className="mb-5 whitespace-pre-line text-sm leading-7 text-muted-foreground">{product.description}</p>
    {!compact && <AddToCart product={product} selectedVariant={selectedVariant} />}
  </CardContent></Card>;
}
