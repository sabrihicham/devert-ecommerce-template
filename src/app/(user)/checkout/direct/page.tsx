import Link from "next/link";
import { notFound } from "next/navigation";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { DirectCheckoutForm } from "@/components/checkout/DirectCheckoutForm";
import { ProductImage } from "@/components/products";
import { getUser } from "@/lib/auth/server";
import { ProductSizeZod } from "@/lib/db/drizzle/schema";
import { getVariantWithProduct } from "@/services/products.service";
import { formatPriceFromEuros } from "@/utils/formatters";

type DirectCheckoutPageProps = { searchParams: Promise<{ variant?: string; size?: string }> };

export default async function DirectCheckoutPage({ searchParams }: DirectCheckoutPageProps) {
  const { variant: variantParam, size: sizeParam } = await searchParams;
  const variantId = Number(variantParam);
  const size = ProductSizeZod.safeParse(sizeParam);
  if (!Number.isInteger(variantId) || variantId <= 0 || !size.success) notFound();

  const [variant, user] = await Promise.all([getVariantWithProduct(variantId), getUser()]);
  if (!variant || !variant.sizes.includes(size.data)) notFound();

  return (
    <section className="mx-auto max-w-5xl px-4 py-10 sm:px-6 sm:py-14">
      <div className="mb-8 flex items-center justify-between gap-4"><div><p className="text-xs font-medium uppercase tracking-[0.2em] text-color-secondary">Direct order</p><h1 className="mt-2 text-3xl font-semibold tracking-tight">Checkout in one step</h1></div><Link href={`/${variant.product.category}/${variant.product.id}?variant=${encodeURIComponent(variant.color)}`} className="text-sm text-color-secondary hover:text-white">Back to product</Link></div>
      <div className="grid gap-6 lg:grid-cols-[1.25fr_0.85fr]">
        <Card className="bg-background-secondary"><CardHeader><CardTitle className="text-xl">Delivery details</CardTitle></CardHeader><CardContent><DirectCheckoutForm variantId={variant.id} size={size.data} defaultName={user?.name ?? ""} defaultEmail={user?.email ?? ""} /></CardContent></Card>
        <Card className="h-min bg-background-secondary lg:sticky lg:top-6"><CardHeader><CardTitle className="text-xl">Your direct order</CardTitle></CardHeader><CardContent className="space-y-5"><div className="flex gap-4"><div className="w-20 shrink-0 overflow-hidden rounded-lg"><ProductImage image={variant.images[0]} name={variant.product.name} width={80} height={112} sizes="80px" /></div><div className="min-w-0"><h2 className="font-medium">{variant.product.name}</h2><p className="mt-1 text-sm text-color-secondary">{variant.color} · {size.data}</p></div></div><div className="flex items-center justify-between border-t border-border-primary pt-4 text-base font-semibold"><span>Total</span><span>{formatPriceFromEuros(variant.product.price)}</span></div><p className="text-xs text-color-secondary">Pay in cash when your order is delivered.</p></CardContent></Card>
      </div>
    </section>
  );
}
