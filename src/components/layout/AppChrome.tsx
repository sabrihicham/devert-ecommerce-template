"use client";

import { usePathname } from "next/navigation";
import { Navbar } from "@/components/layout/navbar";
import { Footer } from "@/components/layout/footer";
import type { Collection } from "@/lib/db/drizzle/schema";
import type { Locale } from "@/lib/i18n";

export function AppChrome({ categories, children, storeName, logoUrl, locale }: { categories: Collection[]; children: React.ReactNode; storeName: string; logoUrl: string | null; locale: Locale }) {
  const pathname = usePathname();

  if (pathname.startsWith("/admin")) return <>{children}</>;

  return (
    <>
      <Navbar storeName={storeName} logoUrl={logoUrl} />
      {children}
      <Footer categories={categories} storeName={storeName} logoUrl={logoUrl} locale={locale} />
    </>
  );
}
