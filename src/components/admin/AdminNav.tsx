"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  LuLayoutDashboard,
  LuPackage,
  LuShoppingBag,
  LuSettings,
  LuImage,
  LuLayers,
} from "react-icons/lu";
import { cn } from "@/lib/utils";

const NAV_ITEMS = [
  { href: "/admin", label: "Dashboard", icon: LuLayoutDashboard },
  { href: "/admin/products", label: "Products", icon: LuPackage },
  { href: "/admin/collections", label: "Collections", icon: LuLayers },
  { href: "/admin/banners", label: "Banners", icon: LuImage },
  { href: "/admin/orders", label: "Orders", icon: LuShoppingBag },
  { href: "/admin/settings", label: "Settings", icon: LuSettings },
] as const;

function isActive(pathname: string, href: string) {
  if (href === "/admin") return pathname === "/admin";
  return pathname === href || pathname.startsWith(`${href}/`);
}

export function AdminNav({ onNavigate }: { onNavigate?: () => void }) {
  const pathname = usePathname();

  return (
    <nav className="flex flex-col gap-1 px-3">
      {NAV_ITEMS.map(({ href, label, icon: Icon }) => {
        const active = isActive(pathname, href);
        return (
          <Link
            key={href}
            href={href}
            onClick={onNavigate}
            aria-current={active ? "page" : undefined}
            className={cn(
              "flex items-center gap-3 rounded-md px-3 py-2.5 text-sm font-medium transition-colors",
              active
                ? "bg-violet-600/15 text-violet-400"
                : "text-color-secondary hover:bg-background-tertiary hover:text-white",
            )}
          >
            <Icon
              size={18}
              className={cn(active ? "text-violet-400" : "text-color-secondary")}
            />
            {label}
          </Link>
        );
      })}
    </nav>
  );
}
