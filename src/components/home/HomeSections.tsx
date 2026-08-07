import Image from "next/image";
import Link from "next/link";
import { ArrowLeft, BadgeCheck, Headphones, ShieldCheck, Truck } from "lucide-react";
import { Button } from "@/components/ui/button";
import { ProductCarousel } from "@/components/products/ProductCarousel";
import type { Banner, Collection, ProductWithVariants } from "@/lib/db/drizzle/schema";
import { getDictionary, type Locale } from "@/lib/i18n";

export function HomeHero({ banners, locale = "ar" }: { banners: Banner[]; locale?: Locale }) { const t = getDictionary(locale); const banner = banners.find((item) => item.placement === "hero") ?? banners[0]; if (!banner) return <section className="mx-auto grid max-w-7xl gap-8 px-4 py-10 sm:px-6 lg:grid-cols-[1.1fr_.9fr] lg:py-16"><div className="flex flex-col justify-center gap-6"><span className="w-fit rounded-full bg-accent px-3 py-1 text-sm font-bold text-accent-foreground">{locale === "ar" ? "تغذية أقوى لأدائك" : "Une nutrition plus forte pour vos performances"}</span><h1 className="text-4xl font-black leading-tight tracking-tight sm:text-5xl">{locale === "ar" ? <>مكملات موثوقة<br/>لنتائج تراها</> : <>Des compléments fiables<br/>pour des résultats visibles</>}</h1><p className="max-w-xl text-lg text-muted-foreground">{locale === "ar" ? "اختر ما يدعم تمرينك واستشفاءك يومياً، بجودة واضحة وتجربة تسوق بسيطة." : "Choisissez ce qui accompagne votre entraînement et votre récupération au quotidien."}</p><div className="flex flex-wrap gap-3"><Button asChild size="lg"><Link href="#products">{locale === "ar" ? "تسوّق المنتجات" : "Découvrir les produits"} <ArrowLeft className="ms-2 size-4" /></Link></Button><Button asChild size="lg" variant="outline"><Link href="#categories">{locale === "ar" ? "استكشف الأقسام" : "Voir les catégories"}</Link></Button></div></div><div className="relative min-h-72 overflow-hidden rounded-3xl border border-border bg-secondary p-8"><div className="absolute -end-12 -top-12 size-56 rounded-full bg-primary/15"/><div className="absolute -bottom-16 start-10 size-52 rounded-full bg-accent/30"/><div className="relative flex h-full items-end"><p className="max-w-xs text-2xl font-bold">{locale === "ar" ? <>أداء أنظف.<br/>تركيز أعلى.</> : <>Des performances plus nettes.<br/>Une meilleure concentration.</>}</p></div></div></section>; return <section className="relative overflow-hidden border-b border-border"><div className="relative mx-auto min-h-[430px] max-w-[1600px]"><Image src={banner.imageUrl} alt={banner.title || t.common.store} fill priority sizes="100vw" className="object-cover"/><div className="absolute inset-0 bg-gradient-to-l from-background/90 via-background/45 to-transparent dark:from-background/95"/><div className="relative mx-auto flex min-h-[430px] max-w-7xl items-end px-4 py-12 sm:px-6 lg:items-center"><div className="max-w-xl space-y-5"><span className="inline-flex rounded-full bg-primary px-3 py-1 text-sm font-bold text-primary-foreground">{locale === "ar" ? "اختيار الرياضيين" : "Le choix des sportifs"}</span>{banner.title && <h1 className="text-4xl font-black leading-tight sm:text-6xl">{banner.title}</h1>}{banner.subtitle && <p className="text-lg text-muted-foreground">{banner.subtitle}</p>}<Button asChild size="lg"><Link href={banner.linkUrl || "#products"}>{banner.buttonLabel || (locale === "ar" ? "تسوّق الآن" : "Acheter maintenant")}<ArrowLeft className="ms-2 size-4"/></Link></Button></div></div></div></section>; }
export function TrustFeatures() { const items = [[Truck,"توصيل سريع","إلى جميع الولايات"],[ShieldCheck,"دفع آمن","تجربة شراء موثوقة"],[Headphones,"دعم مباشر","نحن هنا لمساعدتك"],[BadgeCheck,"جودة مختارة","منتجات بعناية"]] as const; return <section className="border-y border-border bg-card"><div className="mx-auto grid max-w-7xl grid-cols-2 divide-x divide-x-reverse divide-border lg:grid-cols-4">{items.map(([Icon,title,text])=><div key={title} className="flex gap-3 p-5"><Icon className="size-5 shrink-0 text-primary"/><div><h2 className="font-bold">{title}</h2><p className="mt-1 text-sm text-muted-foreground">{text}</p></div></div>)}</div></section>; }
export function CategoryGrid({ categories, locale = "ar" }: { categories: Collection[]; locale?: Locale }) {
  const t = getDictionary(locale);
  const visible = categories
    .filter((category) => category.isVisible && category.slug && category.name.trim())
    .slice(0, 6);

  if (!visible.length) return null;

  return (
    <section id="categories" className="border-y border-border/70 bg-muted/20 px-4 py-7 sm:px-6 sm:py-8">
      <div className="mx-auto max-w-7xl">
        <div className="mb-4 flex items-center justify-between gap-4">
          <div>
            <p className="text-xs font-bold text-primary">{t.home.categoriesEyebrow}</p>
            <h2 className="mt-1 text-lg font-black tracking-tight sm:text-xl">{t.home.categoriesTitle}</h2>
          </div>
          <span className="rounded-full border border-border bg-background px-2.5 py-1 text-[10px] font-semibold text-muted-foreground">
            {visible.length} {t.home.categoriesCount}
          </span>
        </div>

        <nav aria-label="فئات المنتجات" className="-mx-1 overflow-x-auto px-1 pb-1 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
          <ul className="flex min-w-max items-center gap-2">
            {visible.map((category, index) => (
              <li key={category.id}>
                <Link
                  href={`/${category.slug}`}
                  className="group inline-flex min-h-10 items-center gap-2 rounded-full border border-border bg-background px-4 text-xs font-bold text-muted-foreground transition hover:border-primary/50 hover:bg-primary hover:text-primary-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2 sm:px-5 sm:text-sm"
                >
                  <span className="grid size-5 place-items-center rounded-full bg-primary/10 text-[10px] text-primary transition group-hover:bg-primary-foreground/15 group-hover:text-primary-foreground">
                    {index + 1}
                  </span>
                  {category.name}
                  <ArrowLeft className="size-3.5 transition-transform group-hover:-translate-x-0.5" />
                </Link>
              </li>
            ))}
          </ul>
        </nav>
      </div>
    </section>
  );
}
export function HomeProducts({ featured, recent, best, locale = "ar" }: { featured: ProductWithVariants[]; recent: ProductWithVariants[]; best: ProductWithVariants[]; locale?: Locale }) { const t = getDictionary(locale); return <section id="products" className="mx-auto max-w-7xl space-y-16 px-4 py-8 sm:px-6">{featured.length > 0 && <ProductCarousel title={t.home.featured} subtitle={t.home.featuredSubtitle} products={featured}/>} {best.length > 0 && <ProductCarousel title={t.home.bestSellers} subtitle={t.home.bestSellersSubtitle} products={best}/>} {recent.length > 0 && <ProductCarousel title={t.home.latest} subtitle={t.home.latestSubtitle} products={recent}/>}</section>; }
export function PromoGrid({ banners }: { banners: Banner[] }) { const promos = banners.filter((b) => b.placement === "promo_primary" || b.placement === "promo_secondary"); if (!promos.length) return null; return <section className="mx-auto max-w-7xl px-4 py-10 sm:px-6"><div className="grid gap-4 lg:grid-cols-2">{promos.slice(0,2).map((banner)=><Link className="group relative min-h-64 overflow-hidden rounded-3xl border border-border" href={banner.linkUrl || "#products"} key={banner.id}><Image src={banner.imageUrl} alt={banner.title || "عرض"} fill sizes="(max-width:1024px) 100vw, 50vw" className="object-cover transition duration-500 group-hover:scale-105"/><div className="absolute inset-0 bg-gradient-to-l from-black/80 via-black/30 to-transparent"/><div className="relative flex h-full max-w-sm flex-col justify-end p-7 text-white"><h2 className="text-2xl font-black">{banner.title}</h2><p className="mt-2 text-sm text-white/85">{banner.subtitle}</p><span className="mt-5 font-bold">{banner.buttonLabel || "اكتشف العرض"}</span></div></Link>)}</div></section>; }
function Title({ title, text }: { title: string; text: string }) { return <div className="mb-7"><h2 className="text-3xl font-black tracking-tight">{title}</h2><p className="mt-2 text-muted-foreground">{text}</p></div>; }
