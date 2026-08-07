import Link from "next/link";
import { Suspense } from "react";
import { redirect } from "next/navigation";

import { getUser } from "@/lib/auth/server";
import { getCartWithDetails } from "@/services/cart.service";
import { CheckoutForm } from "@/components/checkout/CheckoutForm";
import { SVGLoadingIcon } from "@/components/ui/loader";
import { formatPriceFromEuros } from "@/utils/formatters";
import { getServerLocale } from "@/lib/i18n/server";
import { getDictionary } from "@/lib/i18n";

export async function generateMetadata() {
  return {
    title: "Checkout | Ecommerce Template",
    description: "Complete your order with cash on delivery.",
  };
}

export default function CheckoutPage() {
  return (
    <Suspense
      fallback={
        <div className="flex items-center justify-center h-[calc(100vh-91px)]">
          <SVGLoadingIcon height={30} width={30} />
        </div>
      }
    >
      <CheckoutContent />
    </Suspense>
  );
}

async function CheckoutContent() {
  const locale = await getServerLocale();
  const t = getDictionary(locale);
  const user = await getUser();

  if (!user) {
    redirect("/login?redirect=/checkout");
  }

  const items = await getCartWithDetails(user.id, locale);

  if (items.length === 0) {
    return (
      <div className="flex h-[calc(100vh-91px)] w-full flex-col items-center justify-center gap-4 px-4">
        <h1 className="text-3xl font-bold">{t.cart.empty}</h1>
        <p className="text-color-secondary">
          {locale === "ar" ? "أضف منتجات إلى السلة قبل إتمام الطلب." : "Ajoutez des produits à votre panier avant de commander."}
        </p>
        <Link
          href="/"
          className="flex h-10 items-center justify-center rounded-md border border-border-primary bg-background-secondary px-4 text-sm font-medium hover:bg-background-tertiary"
        >
          {t.common.continue}
        </Link>
      </div>
    );
  }

  const totalPrice = items.reduce(
    (sum, item) => sum + item.product.price * item.quantity,
    0,
  );

  return (
    <section className="mx-auto max-w-4xl px-6 py-12 sm:px-8">
      <h1 className="mb-8 text-2xl font-bold sm:text-3xl">{t.checkout.title}</h1>

      <div className="grid grid-cols-1 gap-8 lg:grid-cols-[1.2fr_1fr]">
        <div className="rounded-lg border border-solid border-border-primary bg-background-secondary p-5">
          <h2 className="mb-4 text-lg font-bold">{t.checkout.deliveryDetails}</h2>
          <CheckoutForm
            cartItemIds={items.map((item) => item.id)}
            defaultName={user.name ?? ""}
            defaultEmail={user.email ?? ""}
          />
        </div>

        <div className="h-min rounded-lg border border-solid border-border-primary bg-background-secondary p-5">
          <h2 className="mb-4 text-lg font-bold">{t.checkout.orderSummary}</h2>
          <ul className="space-y-3">
            {items.map((item) => (
              <li
                key={item.id}
                className="flex items-center justify-between text-sm"
              >
                <span className="text-color-secondary">
                  {item.product.name} ({item.variant.flavor} · {item.variant.quantity}{item.variant.quantityUnit}) ×{" "}
                  {item.quantity}
                </span>
                <span className="font-medium">
                  {formatPriceFromEuros(item.product.price * item.quantity)}
                </span>
              </li>
            ))}
          </ul>
          <div className="mt-4 flex items-center justify-between border-t border-border-primary pt-4 text-base font-bold">
            <span>{t.cart.total}</span>
            <span>{formatPriceFromEuros(totalPrice)}</span>
          </div>
          <p className="mt-3 text-xs text-color-tertiary">
            {locale === "ar" ? "الدفع نقدًا عند استلام الطلب." : "Payez en espèces à la livraison."}
          </p>
        </div>
      </div>
    </section>
  );
}
