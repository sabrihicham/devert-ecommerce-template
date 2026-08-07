"use client";

/** FUNCTIONALITY */
import { useRouter } from "next/navigation";
import { cn } from "@/lib/utils";
import { useLocale, useTranslations } from "@/providers/LocaleProvider";
/** TYPES */
import type {
  ProductVariant,
  ProductWithVariants,
} from "@/lib/db/drizzle/schema";

interface ColorsProps {
  variants: ProductWithVariants["variants"];
  selectedVariantId?: ProductVariant["id"];
  compact?: boolean;
}

const labels = {
  ar: { powder: "مسحوق", capsules: "كبسولات", tablets: "أقراص", liquid: "سائل", gummies: "علكة", bars: "بار", other: "أخرى", g: "جم", kg: "كجم", ml: "مل", capsule: "كبسولة", tablet: "قرص", serving: "حصة", piece: "قطعة" },
  fr: { powder: "Poudre", capsules: "Gélules", tablets: "Comprimés", liquid: "Liquide", gummies: "Gommes", bars: "Barre", other: "Autre", g: "g", kg: "kg", ml: "ml", capsule: "gélule", tablet: "comprimé", serving: "portion", piece: "pièce" },
} as const;

export function Colors({
  variants,
  selectedVariantId,
  compact = false,
}: ColorsProps) {
  const router = useRouter();
  const { locale } = useLocale();
  const t = useTranslations();

  const handleColorChange = (variant: ProductVariant) => {
    router.replace(`?variant=${variant.id}`);

    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  return (
    <div className={cn("grid gap-2", compact ? "grid-cols-2 sm:flex sm:flex-wrap" : "sm:grid-cols-2") }>
      {variants.map((v) => (
        <button
          type="button"
          key={v.id}
          className={cn(
            "relative flex min-h-14 items-start justify-between gap-2 rounded-xl border px-3 py-2.5 text-start transition duration-150 ease hover:border-primary hover:bg-primary/5",
            {
              "border-primary bg-primary/10 ring-1 ring-primary": selectedVariantId === v.id,
              "border-border-primary": selectedVariantId !== v.id,
            },
          )}
          aria-pressed={selectedVariantId === v.id}
          aria-label={`${v.flavor} ${v.quantity}${v.quantityUnit}`}
          onClick={() => handleColorChange(v)}
          title={`${v.flavor} ${v.quantity}${v.quantityUnit}`}
        >
          <span className="min-w-0 flex-1 break-words"><span className="block whitespace-normal text-xs font-bold leading-5 sm:text-sm">{v.flavor}</span><span className="block whitespace-normal break-words text-[11px] leading-4 text-muted-foreground">{v.quantity} {labels[locale][v.quantityUnit]} · {labels[locale][v.form]}</span></span>
          <span className={cn("shrink-0 rounded-full px-1.5 py-0.5 text-[10px] font-semibold", v.stock > 0 && v.isActive ? "bg-emerald-500/15 text-emerald-600" : "bg-destructive/15 text-destructive")}>{v.stock > 0 && v.isActive ? (locale === "ar" ? "متوفر" : "Disponible") : t.product.outOfStock}</span>
        </button>
      ))}
    </div>
  );
}
