"use client";

import { createContext, useContext, useEffect, useState } from "react";
import { Languages } from "lucide-react";
import { ThemeToggle as SharedThemeToggle } from "@/components/ui/theme-toggle";

type Locale = "ar" | "en";
type AdminCopy = Record<string, string>;

const translations = {
  en: {
    admin: "Storefront Admin", dashboard: "Dashboard", products: "Products", collections: "Collections", banners: "Banners", orders: "Orders", settings: "Settings",
    backToStore: "View store", signOut: "Sign out", appearance: "Appearance", language: "العربية", search: "Search", quickActions: "Quick actions",
    welcome: "Welcome back", overview: "Here is what is happening in your store today.", totalOrders: "Total orders", pendingOrders: "Pending orders", deliveredRevenue: "Delivered revenue", catalogProducts: "Catalog products",
    orderPipeline: "Order pipeline", recentOrders: "Recent orders", viewAll: "View all", noOrders: "No orders yet", newProduct: "New product", manageOrders: "Manage orders", storeSettings: "Store settings",
  },
  ar: {
    admin: "إدارة المتجر", dashboard: "لوحة التحكم", products: "المنتجات", collections: "التصنيفات", banners: "البنرات", orders: "الطلبات", settings: "الإعدادات",
    backToStore: "عرض المتجر", signOut: "تسجيل الخروج", appearance: "المظهر", language: "English", search: "بحث", quickActions: "إجراءات سريعة",
    welcome: "مرحباً بعودتك", overview: "إليك ملخص نشاط متجرك اليوم.", totalOrders: "إجمالي الطلبات", pendingOrders: "طلبات بانتظار الإجراء", deliveredRevenue: "إيراد الطلبات المسلّمة", catalogProducts: "منتجات الكتالوج",
    orderPipeline: "حالات الطلبات", recentOrders: "أحدث الطلبات", viewAll: "عرض الكل", noOrders: "لا توجد طلبات حتى الآن", newProduct: "منتج جديد", manageOrders: "إدارة الطلبات", storeSettings: "إعدادات المتجر",
  },
} as const;

const AdminLocaleContext = createContext<{ locale: Locale; t: AdminCopy; toggleLocale: () => void }>({
  locale: "en", t: translations.en, toggleLocale: () => undefined,
});

export function useAdminLocale() { return useContext(AdminLocaleContext); }

function AdminLocaleProvider({ children }: { children: React.ReactNode }) {
  const [locale, setLocale] = useState<Locale>("en");

  useEffect(() => {
    const timer = window.setTimeout(() => {
      const saved = window.localStorage.getItem("admin-locale") as Locale | null;
      setLocale(saved === "ar" || saved === "en" ? saved : navigator.language.startsWith("ar") ? "ar" : "en");
    }, 0);
    return () => window.clearTimeout(timer);
  }, []);

  const toggleLocale = () => setLocale((value) => {
    const next = value === "ar" ? "en" : "ar";
    window.localStorage.setItem("admin-locale", next);
    return next;
  });

  return <AdminLocaleContext.Provider value={{ locale, t: translations[locale], toggleLocale }}>{children}</AdminLocaleContext.Provider>;
}

export function AdminPreferences({ children }: { children: React.ReactNode }) {
  return <AdminLocaleProvider>{children}</AdminLocaleProvider>;
}

export function ThemeToggle() {
  return <SharedThemeToggle className="admin-icon-button" />;
}

export function LocaleToggle() {
  const { t, toggleLocale } = useAdminLocale();
  return <button type="button" onClick={toggleLocale} className="admin-icon-button gap-1.5 px-2.5" aria-label="Toggle language"><Languages className="h-4 w-4" /><span className="text-xs font-semibold">{t.language}</span></button>;
}
