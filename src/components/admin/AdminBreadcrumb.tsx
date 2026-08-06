"use client";

import { ChevronRight } from "lucide-react";
import { usePathname } from "next/navigation";
import { useAdminLocale } from "./AdminPreferences";

const labels: Record<string, keyof ReturnType<typeof useAdminLocale>["t"]> = { products: "products", collections: "collections", banners: "banners", orders: "orders", settings: "settings" };

export function AdminBreadcrumb() {
  const pathname = usePathname();
  const { t } = useAdminLocale();
  const section = pathname.split("/")[2];
  return <div className="hidden items-center gap-2 text-sm text-muted-foreground sm:flex"><span className="font-medium text-foreground">{t.dashboard}</span>{section && <><ChevronRight className="h-4 w-4 text-muted-foreground rtl:rotate-180" /><span>{t[labels[section] ?? "dashboard"]}</span></>}</div>;
}
