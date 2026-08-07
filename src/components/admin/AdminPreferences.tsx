"use client";

import { createContext, useContext } from "react";
import { Languages } from "lucide-react";
import { ThemeToggle as SharedThemeToggle } from "@/components/ui/theme-toggle";
import { useLocale } from "@/providers/LocaleProvider";

type Locale = "ar" | "fr";
type AdminCopy = Record<string, string>;

const translations = {
  fr: {
    admin: "Administration", dashboard: "Tableau de bord", products: "Produits", collections: "Catégories", banners: "Bannières", orders: "Commandes", settings: "Paramètres",
    backToStore: "Voir la boutique", signOut: "Se déconnecter", appearance: "Apparence", language: "عربي", quickActions: "Actions rapides",
    welcome: "Bienvenue", overview: "Voici l’activité de votre boutique aujourd’hui.", totalOrders: "Total des commandes", pendingOrders: "Commandes en attente", deliveredRevenue: "Chiffre des commandes livrées", catalogProducts: "Produits du catalogue",
    orderPipeline: "Suivi des commandes", recentOrders: "Commandes récentes", viewAll: "Voir tout", noOrders: "Aucune commande", newProduct: "Nouveau produit", manageOrders: "Gérer les commandes", storeSettings: "Paramètres de la boutique",
  },
  ar: {
    admin: "إدارة المتجر", dashboard: "لوحة التحكم", products: "المنتجات", collections: "التصنيفات", banners: "البنرات", orders: "الطلبات", settings: "الإعدادات",
    backToStore: "عرض المتجر", signOut: "تسجيل الخروج", appearance: "المظهر", language: "Français", quickActions: "إجراءات سريعة",
    welcome: "مرحباً بعودتك", overview: "إليك ملخص نشاط متجرك اليوم.", totalOrders: "إجمالي الطلبات", pendingOrders: "طلبات بانتظار الإجراء", deliveredRevenue: "إيراد الطلبات المسلّمة", catalogProducts: "منتجات الكتالوج",
    orderPipeline: "حالات الطلبات", recentOrders: "أحدث الطلبات", viewAll: "عرض الكل", noOrders: "لا توجد طلبات حتى الآن", newProduct: "منتج جديد", manageOrders: "إدارة الطلبات", storeSettings: "إعدادات المتجر",
  },
} as const;

const AdminLocaleContext = createContext<{ locale: Locale; t: AdminCopy; toggleLocale: () => void }>({
  locale: "fr", t: translations.fr, toggleLocale: () => undefined,
});

export function useAdminLocale() { return useContext(AdminLocaleContext); }

export function AdminPreferences({ children }: { children: React.ReactNode }) {
  const { locale, setLocale } = useLocale();
  const toggleLocale = () => setLocale(locale === "ar" ? "fr" : "ar");
  return <AdminLocaleContext.Provider value={{ locale, t: translations[locale], toggleLocale }}>{children}</AdminLocaleContext.Provider>;
}

export function ThemeToggle() {
  return <SharedThemeToggle className="admin-icon-button" />;
}

export function LocaleToggle() {
  const { t, toggleLocale } = useAdminLocale();
  return <button type="button" onClick={toggleLocale} className="admin-icon-button gap-1.5 px-2.5" aria-label="Toggle language"><Languages className="h-4 w-4" /><span className="text-xs font-semibold">{t.language}</span></button>;
}
