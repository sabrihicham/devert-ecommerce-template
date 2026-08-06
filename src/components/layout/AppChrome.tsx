"use client";

import { usePathname } from "next/navigation";
import { Navbar } from "@/components/layout/navbar";
import { Footer } from "@/components/layout/footer";
import type { Collection } from "@/lib/db/drizzle/schema";

export function AppChrome({ categories, children, storeName, logoUrl }: { categories: Collection[]; children: React.ReactNode; storeName: string; logoUrl: string | null }) {
  const pathname = usePathname();

  if (pathname.startsWith("/admin")) return <>{children}</>;

  return (
    <>
      <Navbar categories={categories} storeName={storeName} logoUrl={logoUrl} />
      {children}
      <Footer categories={categories} storeName={storeName} logoUrl={logoUrl} />
    </>
  );
}
