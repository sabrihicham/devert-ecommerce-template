"use client";

import Link from "next/link";
import {
  ArrowUpRight,
  Boxes,
  CircleDollarSign,
  Clock3,
  PackagePlus,
  ShoppingBag,
} from "lucide-react";
import { format } from "date-fns";
import { useAdminLocale } from "./AdminPreferences";
import {
  ORDER_STATUS_LABELS,
  ORDER_STATUS_STYLES,
  ORDER_STATUS_VALUES,
} from "@/constants/orderStatus";
import { formatPriceFromCents } from "@/utils/formatters";
import type { AdminDashboardSummary } from "@/lib/db/drizzle/repositories/orders.repository";

export function AdminDashboard({
  summary,
  productCount,
}: {
  summary: AdminDashboardSummary | null;
  productCount: number;
}) {
  const { t } = useAdminLocale();
  const total = summary?.totalOrders ?? 0;
  const metrics = [
    { label: t.totalOrders, value: total.toLocaleString(), icon: ShoppingBag },
    { label: t.pendingOrders, value: (summary?.pendingOrders ?? 0).toLocaleString(), icon: Clock3 },
    { label: t.deliveredRevenue, value: formatPriceFromCents(summary?.deliveredRevenueCents ?? 0), icon: CircleDollarSign },
    { label: t.catalogProducts, value: productCount.toLocaleString(), icon: Boxes },
  ];

  return (
    <div className="space-y-8">
      <section className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <p className="text-sm font-semibold text-primary">{t.welcome}</p>
          <h1 className="mt-1 text-3xl font-bold tracking-tight text-foreground">{t.dashboard}</h1>
          <p className="mt-2 text-sm text-muted-foreground">{t.overview}</p>
        </div>
        <Link href="/admin/products/create" className="admin-primary-button">
          <PackagePlus className="h-4 w-4" />
          {t.newProduct}
        </Link>
      </section>

      <section className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        {metrics.map(({ label, value, icon: Icon }) => (
          <div key={label} className="admin-card p-5">
            <div className="flex items-start justify-between">
              <p className="text-sm font-medium text-muted-foreground">{label}</p>
              <span className="rounded-xl bg-primary p-2 text-primary-foreground shadow-sm">
                <Icon className="h-4 w-4" />
              </span>
            </div>
            <p className="mt-5 text-2xl font-bold tracking-tight text-foreground">{value}</p>
          </div>
        ))}
      </section>

      <section className="grid gap-6 xl:grid-cols-[1.15fr_.85fr]">
        <div className="admin-card p-5 sm:p-6">
          <div className="mb-6 flex items-center justify-between">
            <div>
              <h2 className="font-semibold text-foreground">{t.orderPipeline}</h2>
              <p className="mt-1 text-sm text-muted-foreground">{total} {t.totalOrders.toLowerCase()}</p>
            </div>
            <Link href="/admin/orders" className="admin-link">{t.viewAll}<ArrowUpRight className="h-4 w-4" /></Link>
          </div>
          <div className="space-y-4">
            {ORDER_STATUS_VALUES.map((status) => {
              const count = summary?.statusCounts[status] ?? 0;
              const percentage = total ? Math.round((count / total) * 100) : 0;
              return <div key={status}>
                <div className="mb-2 flex items-center justify-between gap-4">
                  <span className={`rounded-full px-2.5 py-1 text-xs font-semibold ${ORDER_STATUS_STYLES[status]}`}>{ORDER_STATUS_LABELS[status]}</span>
                  <span className="text-sm font-medium text-foreground">{count} <span className="text-muted-foreground">({percentage}%)</span></span>
                </div>
                <div className="h-2 overflow-hidden rounded-full bg-muted"><div className="h-full rounded-full bg-primary" style={{ width: `${percentage}%` }} /></div>
              </div>;
            })}
          </div>
        </div>

        <div className="admin-card p-5 sm:p-6">
          <div className="mb-5 flex items-center justify-between"><h2 className="font-semibold text-foreground">{t.recentOrders}</h2><Link href="/admin/orders" className="admin-link">{t.viewAll}<ArrowUpRight className="h-4 w-4" /></Link></div>
          {summary?.recentOrders.length ? <div className="divide-y divide-border">
            {summary.recentOrders.map((order) => <Link className="flex items-center justify-between gap-3 py-3 first:pt-0 last:pb-0" key={order.id} href={`/admin/orders/${order.id}`}>
              <div className="min-w-0"><p className="font-medium text-foreground">#{order.orderNumber}</p><p className="truncate text-xs text-muted-foreground">{order.customerInfo?.name ?? "—"} · {format(new Date(order.createdAt), "MMM d")}</p></div>
              <div className="text-right"><p className="text-sm font-semibold text-foreground">{formatPriceFromCents(order.customerInfo?.totalPrice ?? 0)}</p><span className={`mt-1 inline-flex rounded-full px-2 py-0.5 text-[10px] font-semibold ${ORDER_STATUS_STYLES[order.status]}`}>{ORDER_STATUS_LABELS[order.status]}</span></div>
            </Link>)}
          </div> : <div className="flex min-h-48 flex-col items-center justify-center text-center"><ShoppingBag className="h-8 w-8 text-muted-foreground/40" /><p className="mt-3 text-sm text-muted-foreground">{t.noOrders}</p></div>}
        </div>
      </section>

      <section className="grid gap-4 sm:grid-cols-3">
        {[["/admin/products/create", t.newProduct, PackagePlus], ["/admin/orders", t.manageOrders, ShoppingBag], ["/admin/settings", t.storeSettings, Boxes]].map(([href, label, Icon]) => {
          const ActionIcon = Icon as typeof PackagePlus;
          return <Link key={href as string} href={href as string} className="admin-card flex items-center gap-4 p-5 transition hover:-translate-y-0.5 hover:border-primary/60"><span className="rounded-xl bg-primary/10 p-3 text-primary"><ActionIcon className="h-5 w-5" /></span><span className="font-semibold text-foreground">{label as string}</span><ArrowUpRight className="ml-auto h-4 w-4 text-muted-foreground" /></Link>;
        })}
      </section>
    </div>
  );
}
