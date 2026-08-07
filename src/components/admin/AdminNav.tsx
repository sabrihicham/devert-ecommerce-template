"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { LayoutDashboard, Package, ShoppingBag, Settings, Image, Layers } from "lucide-react";
import { cn } from "@/lib/utils";
import { useAdminLocale } from "./AdminPreferences";

const NAV_ITEMS = [
  { href: "/admin", label: "dashboard", icon: LayoutDashboard },
  { href: "/admin/products", label: "products", icon: Package },
  { href: "/admin/collections", label: "collections", icon: Layers },
  { href: "/admin/banners", label: "banners", icon: Image },
  { href: "/admin/orders", label: "orders", icon: ShoppingBag },
  { href: "/admin/settings", label: "settings", icon: Settings },
] as const;

function isActive(pathname: string, href: string) {
  if (href === "/admin") return pathname === "/admin";
  return pathname === href || pathname.startsWith(`${href}/`);
}

export function AdminNav({ onNavigate }: { onNavigate?: () => void }) {
  const pathname = usePathname();
  const { t } = useAdminLocale();

  return (
    <nav aria-label={t.admin} className="flex flex-col gap-1 px-3">
      {NAV_ITEMS.map(({ href, label, icon: Icon }) => {
        const active = isActive(pathname, href);
        return (
          <Link
            key={href}
            href={href}
            onClick={onNavigate}
            aria-current={active ? "page" : undefined}
            className={cn(
              "group relative flex items-center gap-3 rounded-xl px-3 py-3 text-sm font-medium transition-colors",
              active
                ? "bg-primary text-primary-foreground shadow-sm"
                : "text-muted-foreground hover:bg-muted hover:text-foreground",
            )}
          >
            {active && <span aria-hidden="true" className="absolute inset-y-2 start-0 w-1 rounded-full bg-primary-foreground/80" />}
            <Icon
              size={18}
              className={cn(active ? "text-primary-foreground" : "text-muted-foreground")}
            />
            {t[label]}
          </Link>
        );
      })}
    </nav>
  );
}
