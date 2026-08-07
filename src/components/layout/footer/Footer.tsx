import Link from "next/link";
import Image from "next/image";
import { Dumbbell, Headphones, ShieldCheck, Truck } from "lucide-react";
import type { Collection } from "@/lib/db/drizzle/schema";
import { getDictionary, type Locale } from "@/lib/i18n";

export const Footer = ({ categories, storeName, logoUrl, locale = "ar" }: { categories: Collection[]; storeName: string; logoUrl: string | null; locale?: Locale }) => {
  const t = getDictionary(locale);
  const ar = locale === "ar";
  const customerLinks = [[ar ? "التوصيل والدفع" : "Livraison et paiement", "/checkout"], [t.nav.cart, "/cart"], [t.nav.orders, "/orders"], [t.nav.wishlist, "/wishlist"]];
  return <footer className="border-t border-border bg-card"><div className="mx-auto grid max-w-7xl gap-10 px-4 py-14 sm:px-6 md:grid-cols-2 lg:grid-cols-4"><div><Link href="/" className="inline-flex items-center gap-2 text-xl font-black">{logoUrl ? <Image src={logoUrl} alt={storeName} width={140} height={48} className="h-12 w-auto object-contain"/> : <><span className="grid size-9 place-items-center rounded-xl bg-primary text-primary-foreground"><Dumbbell className="size-5"/></span>{storeName}</>}</Link><p className="mt-4 max-w-xs text-sm leading-6 text-muted-foreground">{ar ? "مكملات رياضية مختارة لتدعم أداءك، استشفاءك وروتينك اليومي." : "Des compléments sportifs sélectionnés pour accompagner vos performances et votre routine."}</p></div><FooterLinks title={ar ? "الأقسام" : "Catégories"} links={categories.filter(c => c.isVisible).slice(0,6).map(c => [c.name, `/${c.slug}`])}/><FooterLinks title={ar ? "خدمة العملاء" : "Service client"} links={customerLinks}/><div><h2 className="font-bold">{ar ? "تسوّق بثقة" : "Achetez en confiance"}</h2><ul className="mt-4 space-y-3 text-sm text-muted-foreground"><li className="flex items-center gap-2"><Truck className="size-4 text-primary"/>{ar ? "توصيل إلى جميع الولايات" : "Livraison dans toutes les wilayas"}</li><li className="flex items-center gap-2"><ShieldCheck className="size-4 text-primary"/>{ar ? "معاملات آمنة" : "Transactions sécurisées"}</li><li className="flex items-center gap-2"><Headphones className="size-4 text-primary"/>{ar ? "دعم مباشر عند الحاجة" : "Assistance disponible"}</li></ul></div></div><div className="border-t border-border py-5 text-center text-sm text-muted-foreground">© {new Date().getFullYear()} {storeName}. {ar ? "جميع الحقوق محفوظة." : "Tous droits réservés."}</div></footer>;
};

function FooterLinks({ title, links }: { title: string; links: string[][] }) { return <div><h2 className="font-bold">{title}</h2><ul className="mt-4 space-y-3">{links.map(([label, href]) => <li key={href}><Link href={href} className="text-sm text-muted-foreground transition hover:text-primary">{label}</Link></li>)}</ul></div>; }
