import Image from "next/image";
import Link from "next/link";
import { ArrowLeft, BadgeCheck, Headphones, ShieldCheck, Truck } from "lucide-react";
import { Button } from "@/components/ui/button";
import { ProductCarousel } from "@/components/products/ProductCarousel";
import { CategorySlider } from "@/components/home/CategorySlider";
import type { Banner, Collection, ProductWithVariants } from "@/lib/db/drizzle/schema";

export function HomeHero({ banners }: { banners: Banner[] }) { const banner = banners.find((item) => item.placement === "hero"); if (!banner) return <section className="mx-auto grid max-w-7xl gap-8 px-4 py-10 sm:px-6 lg:grid-cols-[1.1fr_.9fr] lg:py-16"><div className="flex flex-col justify-center gap-6"><span className="w-fit rounded-full bg-accent px-3 py-1 text-sm font-bold text-accent-foreground">تغذية أقوى لأدائك</span><h1 className="text-4xl font-black leading-tight tracking-tight sm:text-5xl">مكملات موثوقة<br/>لنتائج تراها</h1><p className="max-w-xl text-lg text-muted-foreground">اختر ما يدعم تمرينك واستشفاءك يومياً، بجودة واضحة وتجربة تسوق بسيطة.</p><div className="flex flex-wrap gap-3"><Button asChild size="lg"><Link href="#products">تسوّق المنتجات <ArrowLeft className="ms-2 size-4" /></Link></Button><Button asChild size="lg" variant="outline"><Link href="#categories">استكشف الأقسام</Link></Button></div></div><div className="relative min-h-72 overflow-hidden rounded-3xl border border-border bg-secondary p-8"><div className="absolute -end-12 -top-12 size-56 rounded-full bg-primary/15"/><div className="absolute -bottom-16 start-10 size-52 rounded-full bg-accent/30"/><div className="relative flex h-full items-end"><p className="max-w-xs text-2xl font-bold">أداء أنظف.<br/>تركيز أعلى.</p></div></div></section>; return <section className="relative overflow-hidden border-b border-border"><div className="relative mx-auto min-h-[430px] max-w-[1600px]"><Image src={banner.imageUrl} alt={banner.title || "عروض المتجر"} fill priority sizes="100vw" className="object-cover"/><div className="absolute inset-0 bg-gradient-to-l from-background/90 via-background/45 to-transparent dark:from-background/95"/><div className="relative mx-auto flex min-h-[430px] max-w-7xl items-end px-4 py-12 sm:px-6 lg:items-center"><div className="max-w-xl space-y-5"><span className="inline-flex rounded-full bg-primary px-3 py-1 text-sm font-bold text-primary-foreground">اختيار الرياضيين</span>{banner.title && <h1 className="text-4xl font-black leading-tight sm:text-6xl">{banner.title}</h1>}{banner.subtitle && <p className="text-lg text-muted-foreground">{banner.subtitle}</p>}<Button asChild size="lg"><Link href={banner.linkUrl || "#products"}>{banner.buttonLabel || "تسوّق الآن"}<ArrowLeft className="ms-2 size-4"/></Link></Button></div></div></div></section>; }
export function TrustFeatures() { const items = [[Truck,"توصيل سريع","إلى جميع الولايات"],[ShieldCheck,"دفع آمن","تجربة شراء موثوقة"],[Headphones,"دعم مباشر","نحن هنا لمساعدتك"],[BadgeCheck,"جودة مختارة","منتجات بعناية"]] as const; return <section className="border-y border-border bg-card"><div className="mx-auto grid max-w-7xl grid-cols-2 divide-x divide-x-reverse divide-border lg:grid-cols-4">{items.map(([Icon,title,text])=><div key={title} className="flex gap-3 p-5"><Icon className="size-5 shrink-0 text-primary"/><div><h2 className="font-bold">{title}</h2><p className="mt-1 text-sm text-muted-foreground">{text}</p></div></div>)}</div></section>; }
export function CategoryGrid({ categories }: { categories: Collection[] }) {
  const visible = categories
    .filter((category) => category.isVisible)
    .slice(0, 6);

  if (!visible.length) return null;

  return (
    <section
      id="categories"
      className="border-y border-border/70 bg-muted/20 px-4 py-10 sm:px-6 sm:py-12"
    >
      <div className="mx-auto max-w-7xl">
        <div className="mb-6 flex items-end justify-between gap-4 sm:mb-8">
          <div>
            <p className="mb-2 text-sm font-bold text-primary">اختيارات موثوقة</p>
            <h2 className="text-2xl font-black tracking-tight sm:text-3xl">
              تسوّق حسب النوع
            </h2>
            <p className="mt-2 max-w-xl text-sm text-muted-foreground sm:text-base">
              منتجات أصلية مختارة لتناسب كل خطوة في روتينك الرياضي.
            </p>
          </div>
          <span className="hidden rounded-full border border-border bg-background px-3 py-1.5 text-xs font-semibold text-muted-foreground sm:inline-flex">
            {visible.length} أقسام
          </span>
        </div>

        <CategorySlider categories={visible} />
      </div>
    </section>
  );
}
export function HomeProducts({ featured, recent, best }: { featured: ProductWithVariants[]; recent: ProductWithVariants[]; best: ProductWithVariants[] }) { return <section id="products" className="mx-auto max-w-7xl space-y-16 px-4 py-8 sm:px-6">{featured.length > 0 && <ProductCarousel title="منتجات مختارة لك" subtitle="خيارات مميزة من المتجر" products={featured}/>} {best.length > 0 && <ProductCarousel title="الأكثر طلباً" subtitle="اختيارات عملائنا" products={best}/>} {recent.length > 0 && <ProductCarousel title="وصل حديثاً" subtitle="اكتشف الإضافات الجديدة" products={recent}/>}</section>; }
export function PromoGrid({ banners }: { banners: Banner[] }) { const promos = banners.filter((b) => b.placement === "promo_primary" || b.placement === "promo_secondary"); if (!promos.length) return null; return <section className="mx-auto max-w-7xl px-4 py-10 sm:px-6"><div className="grid gap-4 lg:grid-cols-2">{promos.slice(0,2).map((banner)=><Link className="group relative min-h-64 overflow-hidden rounded-3xl border border-border" href={banner.linkUrl || "#products"} key={banner.id}><Image src={banner.imageUrl} alt={banner.title || "عرض"} fill sizes="(max-width:1024px) 100vw, 50vw" className="object-cover transition duration-500 group-hover:scale-105"/><div className="absolute inset-0 bg-gradient-to-l from-black/80 via-black/30 to-transparent"/><div className="relative flex h-full max-w-sm flex-col justify-end p-7 text-white"><h2 className="text-2xl font-black">{banner.title}</h2><p className="mt-2 text-sm text-white/85">{banner.subtitle}</p><span className="mt-5 font-bold">{banner.buttonLabel || "اكتشف العرض"}</span></div></Link>)}</div></section>; }
function Title({ title, text }: { title: string; text: string }) { return <div className="mb-7"><h2 className="text-3xl font-black tracking-tight">{title}</h2><p className="mt-2 text-muted-foreground">{text}</p></div>; }
