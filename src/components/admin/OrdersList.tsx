"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { format } from "date-fns";
import { FiPhone, FiPackage, FiChevronLeft, FiChevronRight } from "react-icons/fi";

import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { OrderStatusBadge } from "./OrderStatusBadge";
import {
  ORDER_STATUS_LABELS,
  ORDER_STATUS_VALUES,
} from "@/constants/orderStatus";
import { ALGERIAN_WILAYAS, getWilayaName } from "@/constants/wilayas";
import { formatPriceFromCents } from "@/utils/formatters";
import type { OrderWithDetails, OrderStatus } from "@/lib/db/drizzle/schema";

interface OrdersListProps {
  orders: OrderWithDetails[];
  total: number;
  page: number;
  pageSize: number;
  filters: { status: OrderStatus | "all"; wilaya: string };
}

export function OrdersList({
  orders,
  total,
  page,
  pageSize,
  filters,
}: OrdersListProps) {
  const router = useRouter();
  const totalPages = Math.max(1, Math.ceil(total / pageSize));

  function updateQuery(next: {
    status?: string;
    wilaya?: string;
    page?: number;
  }) {
    const status = next.status ?? filters.status;
    const wilaya = next.wilaya ?? filters.wilaya;
    const nextPage = next.page ?? (next.status || next.wilaya ? 1 : page);

    const params = new URLSearchParams();
    if (status !== "all") params.set("status", status);
    if (wilaya !== "all") params.set("wilaya", wilaya);
    if (nextPage > 1) params.set("page", String(nextPage));

    const query = params.toString();
    router.push(`/admin/orders${query ? `?${query}` : ""}`);
  }

  return (
    <div className="flex flex-col gap-6">
      <div className="flex flex-col gap-1">
        <h1 className="text-2xl font-semibold tracking-tight text-white">
          Orders
        </h1>
        <p className="text-sm text-color-secondary">
          {total} order{total === 1 ? "" : "s"} total
        </p>
      </div>

      <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
        <Select
          value={filters.status}
          onValueChange={(value) => updateQuery({ status: value })}
        >
          <SelectTrigger className="sm:w-52">
            <SelectValue placeholder="Status" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All statuses</SelectItem>
            {ORDER_STATUS_VALUES.map((status) => (
              <SelectItem key={status} value={status}>
                {ORDER_STATUS_LABELS[status]}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>

        <Select
          value={filters.wilaya}
          onValueChange={(value) => updateQuery({ wilaya: value })}
        >
          <SelectTrigger className="sm:w-52">
            <SelectValue placeholder="Wilaya" />
          </SelectTrigger>
          <SelectContent className="max-h-72">
            <SelectItem value="all">All wilayas</SelectItem>
            {ALGERIAN_WILAYAS.map((wilaya) => (
              <SelectItem key={wilaya.code} value={wilaya.code}>
                {wilaya.name}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {orders.length === 0 ? (
        <div className="flex flex-col items-center justify-center gap-3 rounded-lg border border-dashed border-border-primary py-16 text-center">
          <FiPackage size={28} className="text-color-secondary" />
          <p className="text-sm text-color-secondary">
            No orders match these filters.
          </p>
        </div>
      ) : (
        <div className="flex flex-col gap-3">
          {orders.map((order) => {
            const itemCount = order.orderProducts.reduce(
              (sum, product) => sum + product.quantity,
              0,
            );
            const wilayaCode = order.customerInfo?.address?.wilaya;

            return (
              <Link
                key={order.id}
                href={`/admin/orders/${order.id}`}
                className="flex flex-col gap-3 rounded-lg border border-border-primary bg-background-secondary p-4 transition-colors hover:border-border-secondary sm:flex-row sm:items-center sm:justify-between"
              >
                <div className="flex flex-col gap-1 sm:w-40">
                  <div className="flex items-center gap-2">
                    <span className="text-sm font-semibold text-white">
                      #{order.orderNumber}
                    </span>
                    <OrderStatusBadge status={order.status} />
                  </div>
                  <p className="text-xs text-color-secondary">
                    {format(new Date(order.createdAt), "dd MMM yyyy 'at' HH:mm")}
                  </p>
                </div>

                <div className="flex flex-col gap-1 sm:w-44">
                  <p className="truncate text-sm text-white">
                    {order.customerInfo?.name ?? "—"}
                  </p>
                  <p className="flex items-center gap-1.5 text-xs text-color-secondary">
                    <FiPhone size={12} />
                    {order.customerInfo?.phone ?? "—"}
                  </p>
                </div>

                <div className="flex flex-col gap-1 sm:w-36">
                  <p className="text-xs text-color-secondary">
                    {wilayaCode
                      ? (getWilayaName(wilayaCode) ?? wilayaCode)
                      : "—"}
                  </p>
                  <p className="text-xs text-color-secondary">
                    {itemCount} item{itemCount === 1 ? "" : "s"}
                  </p>
                </div>

                <p className="text-sm font-semibold text-violet-400 sm:w-24 sm:text-right">
                  {formatPriceFromCents(order.customerInfo?.totalPrice ?? 0)}
                </p>
              </Link>
            );
          })}
        </div>
      )}

      {totalPages > 1 && (
        <div className="flex items-center justify-between border-t border-border-primary pt-4">
          <button
            type="button"
            disabled={page <= 1}
            onClick={() => updateQuery({ page: page - 1 })}
            className="flex items-center gap-1 rounded-md border border-border-primary px-3 py-1.5 text-sm text-color-secondary disabled:opacity-40"
          >
            <FiChevronLeft size={14} />
            Previous
          </button>
          <span className="text-sm text-color-secondary">
            Page {page} of {totalPages}
          </span>
          <button
            type="button"
            disabled={page >= totalPages}
            onClick={() => updateQuery({ page: page + 1 })}
            className="flex items-center gap-1 rounded-md border border-border-primary px-3 py-1.5 text-sm text-color-secondary disabled:opacity-40"
          >
            Next
            <FiChevronRight size={14} />
          </button>
        </div>
      )}
    </div>
  );
}
