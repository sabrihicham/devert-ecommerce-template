import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import type { Product, ProductVariant } from "@/lib/db/drizzle/schema";
import { getDictionary, type Locale } from "@/lib/i18n";

const formLabels = {
  ar: { powder: "مسحوق", capsules: "كبسولات", tablets: "أقراص", liquid: "سائل", gummies: "علكة", bars: "بار", other: "أخرى" },
  fr: { powder: "Poudre", capsules: "Gélules", tablets: "Comprimés", liquid: "Liquide", gummies: "Gommes", bars: "Barre", other: "Autre" },
} as const;

const unitLabels = {
  ar: { g: "جم", kg: "كجم", ml: "مل", capsule: "كبسولة", tablet: "قرص", serving: "حصة", piece: "قطعة" },
  fr: { g: "g", kg: "kg", ml: "ml", capsule: "gélule", tablet: "comprimé", serving: "portion", piece: "pièce" },
} as const;

export function ProductInfo({
  product,
  selectedVariant,
  locale = "ar",
}: {
  product: Product;
  selectedVariant?: ProductVariant;
  locale?: Locale;
}) {
  const t = getDictionary(locale);
  const ar = locale === "ar";
  const emptyIngredients = ar ? "لم تتم إضافة المكونات بعد." : "Les ingrédients n’ont pas encore été ajoutés.";
  const emptyUsage = ar ? "اتبع الإرشادات الموجودة على عبوة المنتج." : "Suivez les instructions sur l’emballage.";
  const emptyWarnings = ar ? "استشر مختصًا قبل الاستخدام عند الحاجة." : "Demandez conseil à un professionnel si nécessaire.";

  return (
    <div className="space-y-4" dir={ar ? "rtl" : "ltr"}>
      {selectedVariant && (
        <Card className="overflow-hidden border-border/80 bg-card/70 shadow-sm">
          <CardHeader className="border-b border-border/70 px-4 py-3 sm:px-5">
            <div className="flex items-center justify-between gap-3">
              <CardTitle className="text-sm font-bold">{t.product.flavor}</CardTitle>
              <Badge variant={selectedVariant.stock > 0 ? "secondary" : "destructive"}>
                {selectedVariant.stock > 0 ? `${t.product.stock}: ${selectedVariant.stock}` : t.product.outOfStock}
              </Badge>
            </div>
          </CardHeader>
          <CardContent className="grid grid-cols-2 gap-3 p-4 sm:grid-cols-4 sm:px-5">
            <Detail label={t.product.flavor} value={selectedVariant.flavor} />
            <Detail label={t.product.form} value={formLabels[locale][selectedVariant.form]} />
            <Detail label={t.product.quantity} value={`${selectedVariant.quantity} ${unitLabels[locale][selectedVariant.quantityUnit]}`} />
            {selectedVariant.servings ? <Detail label={t.product.servings} value={`${selectedVariant.servings}`} /> : null}
            <Detail label={t.product.sku} value={selectedVariant.sku} className="col-span-2 sm:col-span-1" />
          </CardContent>
        </Card>
      )}

      <Card className="border-border/80 bg-card/40 shadow-sm">
        <CardContent className="p-0">
          <Accordion type="single" collapsible className="w-full px-4 sm:px-5">
            <AccordionItem value="ingredients"><AccordionTrigger>{t.product.ingredients}</AccordionTrigger><AccordionContent><p className="whitespace-pre-line leading-7 text-muted-foreground">{product.ingredients || emptyIngredients}</p></AccordionContent></AccordionItem>
            <AccordionItem value="usage"><AccordionTrigger>{t.product.usage}</AccordionTrigger><AccordionContent><p className="whitespace-pre-line leading-7 text-muted-foreground">{product.usage || emptyUsage}</p></AccordionContent></AccordionItem>
            <AccordionItem value="warnings"><AccordionTrigger>{t.product.warnings}</AccordionTrigger><AccordionContent><p className="whitespace-pre-line leading-7 text-muted-foreground">{product.warnings || emptyWarnings}</p></AccordionContent></AccordionItem>
          </Accordion>
        </CardContent>
      </Card>
    </div>
  );
}

function Detail({ label, value, className = "" }: { label: string; value: string; className?: string }) {
  return <div className={`min-w-0 rounded-xl bg-muted/45 p-3 ${className}`}><p className="mb-1 text-[11px] text-muted-foreground">{label}</p><p className="truncate text-sm font-semibold text-foreground" title={value}>{value}</p></div>;
}
