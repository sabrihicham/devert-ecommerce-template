"use client";

import Link from "next/link";
import { ArrowLeft, Dumbbell, Sparkles } from "lucide-react";

import {
  NavigationMenu,
  NavigationMenuContent,
  NavigationMenuItem,
  NavigationMenuLink,
  NavigationMenuList,
  NavigationMenuTrigger,
} from "@/components/ui/navigation-menu";
import type { Collection } from "@/lib/db/drizzle/schema";

const fallbackAccents = [
  "from-emerald-500/20 to-lime-400/5",
  "from-sky-500/20 to-cyan-400/5",
  "from-orange-500/20 to-amber-400/5",
  "from-violet-500/20 to-fuchsia-400/5",
];

export function LinksDesktop({ categories }: { categories: Collection[] }) {
  const visibleCategories = categories.filter((category) => category.isVisible);
  const featuredCategory =
    visibleCategories.find((category) => category.isFeatured) ?? visibleCategories[0];
  const menuCategories = visibleCategories.filter(
    (category) => category.id !== featuredCategory?.id,
  );

  return (
    <NavigationMenu dir="rtl">
      <NavigationMenuList>
        <NavigationMenuItem>
          <NavigationMenuTrigger className="h-10 gap-2 rounded-xl bg-background/55 px-3 text-sm font-semibold text-muted-foreground backdrop-blur-md hover:bg-muted/80 hover:text-foreground data-[state=open]:bg-muted/90 data-[state=open]:text-foreground">
            <Dumbbell className="size-4 text-primary" aria-hidden="true" />
            المجموعات
          </NavigationMenuTrigger>

          <NavigationMenuContent>
            <div className="w-[min(92vw,720px)] border border-border/70 bg-popover/95 p-3 text-popover-foreground shadow-2xl shadow-primary/10 backdrop-blur-xl sm:p-4">
              <div className="grid gap-3 md:grid-cols-[220px_1fr]">
                <NavigationMenuLink asChild>
                  <Link
                    href={featuredCategory ? `/${featuredCategory.slug}` : "/"}
                    className="group relative flex min-h-[210px] overflow-hidden rounded-2xl bg-gradient-to-br from-primary/95 via-primary/90 to-primary/75 p-5 text-primary-foreground outline-none transition hover:shadow-lg hover:shadow-primary/20 focus-visible:ring-2 focus-visible:ring-ring"
                    style={
                      featuredCategory?.imageUrl
                        ? {
                            backgroundImage: `linear-gradient(180deg, hsl(var(--primary) / 0.08) 10%, hsl(var(--primary) / 0.97) 100%), url(${featuredCategory.imageUrl})`,
                            backgroundPosition: "center",
                            backgroundSize: "cover",
                          }
                        : undefined
                    }
                  >
                    <span className="absolute right-4 top-4 inline-flex items-center gap-1 rounded-full bg-primary-foreground/15 px-2.5 py-1 text-[10px] font-bold tracking-wide backdrop-blur-sm">
                      <Sparkles className="size-3" /> مختارة لك
                    </span>
                    <span className="relative mt-auto">
                      <span className="block text-lg font-bold">
                        {featuredCategory?.name ?? "اكتشف مجموعاتنا"}
                      </span>
                      <span className="mt-1 block text-xs leading-5 text-primary-foreground/80">
                        كل ما تحتاجه لروتين أقوى ونتائج أفضل.
                      </span>
                      <span className="mt-4 inline-flex items-center gap-1 text-xs font-bold">
                        استكشف الآن <ArrowLeft className="size-3.5 transition-transform group-hover:-translate-x-1" />
                      </span>
                    </span>
                  </Link>
                </NavigationMenuLink>

                <div className="grid gap-1 sm:grid-cols-2">
                  {menuCategories.map((category, index) => (
                    <NavigationMenuLink key={category.id} asChild>
                      <Link
                        href={`/${category.slug}`}
                        className="group relative flex min-h-[92px] items-end overflow-hidden rounded-xl border border-border/50 bg-muted/65 p-3 outline-none transition hover:border-primary/35 hover:bg-muted/90 focus-visible:ring-2 focus-visible:ring-ring"
                        style={
                          category.imageUrl
                            ? {
                                backgroundImage: `linear-gradient(180deg, hsl(var(--muted) / 0.08) 0%, hsl(var(--muted) / 0.94) 100%), url(${category.imageUrl})`,
                                backgroundPosition: "center",
                                backgroundSize: "cover",
                              }
                            : undefined
                        }
                      >
                        {!category.imageUrl && (
                          <span className={`absolute inset-0 bg-gradient-to-br ${fallbackAccents[index % fallbackAccents.length]}`} />
                        )}
                        <span className="relative flex w-full items-center justify-between gap-2">
                          <span>
                            <span className="block text-sm font-bold leading-5">{category.name}</span>
                            <span className="mt-0.5 block line-clamp-1 text-[11px] text-muted-foreground">
                              {category.description || "اكتشف التشكيلة"}
                            </span>
                          </span>
                          <ArrowLeft className="size-4 shrink-0 text-primary transition-transform group-hover:-translate-x-1" />
                        </span>
                      </Link>
                    </NavigationMenuLink>
                  ))}
                </div>
              </div>

              <Link
                href="/"
                className="mt-3 flex items-center justify-between rounded-xl border border-dashed border-border px-3 py-2.5 text-xs font-semibold text-muted-foreground transition hover:border-primary/50 hover:text-foreground"
              >
                <span>تصفح جميع المنتجات والمجموعات</span>
                <ArrowLeft className="size-4 text-primary" />
              </Link>
            </div>
          </NavigationMenuContent>
        </NavigationMenuItem>
      </NavigationMenuList>
    </NavigationMenu>
  );
}
