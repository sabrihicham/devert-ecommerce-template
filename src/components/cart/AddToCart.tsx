"use client";
import { useRouter } from "next/navigation";
import { useThrottleFn } from "ahooks";
import { useCartMutation } from "@/hooks/cart";
import type { ProductVariant, ProductWithVariants } from "@/lib/db/drizzle/schema";
import { Button } from "@/components/ui/button";
import { Colors } from "./Colors";
interface Props { product: ProductWithVariants; selectedVariant?: ProductVariant }
function useAction(variant?: ProductVariant) { const router = useRouter(); const { add } = useCartMutation(); const { run } = useThrottleFn(() => { if (variant) add({ variantId: variant.id }); }, { wait: 300 }); return { run, disabled: !variant || !variant.isActive || variant.stock < 1, buyNow: () => variant && router.push(`/checkout/direct?variant=${variant.id}`) }; }
export function AddToCart({ product, selectedVariant }: Props) { const a = useAction(selectedVariant); return <><div className="p-5"><Colors variants={product.variants} selectedVariantColor={selectedVariant?.flavor} /></div><div className="grid grid-cols-2 border-t"><Button type="button" disabled={a.disabled} onClick={() => a.run()}>إضافة للسلة</Button><Button type="button" disabled={a.disabled} onClick={a.buyNow}>اشتر الآن</Button></div></>; }
export function MobileAddToCart({ product, selectedVariant }: Props) { const a = useAction(selectedVariant); return <div className="flex flex-col gap-3"><Colors variants={product.variants} selectedVariantColor={selectedVariant?.flavor} compact /><div className="grid grid-cols-2 gap-2"><Button type="button" variant="outline" disabled={a.disabled} onClick={() => a.run()}>إضافة للسلة</Button><Button type="button" disabled={a.disabled} onClick={a.buyNow}>اشتر الآن</Button></div></div>; }
