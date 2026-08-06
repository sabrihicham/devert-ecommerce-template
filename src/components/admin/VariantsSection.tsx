"use client";
import { forwardRef, useImperativeHandle, useRef, useState } from "react";
import { Button } from "@/components/ui/button";
import { VariantForm, type VariantFormRef } from "./VariantForm";
import type { VariantFormData, VariantSubmitData } from "@/types/admin";
export type VariantsSectionRef = { getVariants: () => VariantSubmitData[]; getImages: () => Record<string, File[]>; reset: () => void };
const empty: VariantFormData = { flavor: "", form: "other", quantity: 1, quantityUnit: "piece", servings: null, sku: "", price: 0, compareAtPrice: null, stock: 0, images: [], isActive: true };
export const VariantsSection = forwardRef<VariantsSectionRef, { initialVariants?: VariantFormData[] }>(({ initialVariants }, ref) => {
  const [variants, setVariants] = useState((initialVariants?.length ? initialVariants : [empty]).map((data, key) => ({ key, data })));
  const refs = useRef(new Map<number, VariantFormRef>());
  useImperativeHandle(ref, () => ({ getVariants: () => variants.map((v) => refs.current.get(v.key)?.getData() ?? { ...v.data, imageCount: 0, existingImages: v.data.images, removedImages: [] }), getImages: () => Object.fromEntries(variants.map((v, i) => [ `variant_${i}`, refs.current.get(v.key)?.getImages() ?? [] ])), reset: () => refs.current.forEach((r) => r.reset()) }), [variants]);
  return <div className="space-y-4">{variants.map((v, i) => <VariantForm key={v.key} ref={(r) => { if (r) refs.current.set(v.key, r); }} index={i} initialData={v.data} canRemove={variants.length > 1} onRemove={() => setVariants((all) => all.filter((x) => x.key !== v.key))} />)}<Button type="button" variant="outline" className="w-full" onClick={() => setVariants((all) => [...all, { key: Date.now(), data: empty }])}>إضافة متغير آخر</Button></div>;
});
VariantsSection.displayName = "VariantsSection";
