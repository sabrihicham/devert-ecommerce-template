import Link from "next/link";
import { Suspense } from "react";
import { format } from "date-fns";
import { HiArrowLeft } from "react-icons/hi";
import { FiPhone, FiMail, FiMapPin, FiAlertTriangle } from "react-icons/fi";

import {
  getOrderById,
  countPriorOrderIssues,
} from "@/services/orders.service";
import { OrderStatusBadge, OrderStatusControl } from "@/components/admin";
import { getWilayaName } from "@/constants/wilayas";
import { formatPriceFromCents, formatPriceFromEuros } from "@/utils/formatters";

export async function generateMetadata() {
  return {
    title: "Order Details | Admin",
  };
}

interface Props {
  params: Promise<{ id: string }>;
}

const OrderDetailContent = async ({ params }: Props) => {
  const { id } = await params;
  const orderId = Number(id);

  const order = Number.isFinite(orderId) ? await getOrderById(orderId) : null;

  if (!order) {
    return (
      <div className="flex flex-col items-center justify-center gap-4 py-24 text-center">
        <h2 className="text-xl font-semibold text-white">Order not found</h2>
        <Link
          href="/admin/orders"
          className="flex items-center gap-2 rounded-lg bg-background-secondary px-4 py-2 text-sm text-white hover:bg-background-tertiary"
        >
          <HiArrowLeft className="h-4 w-4" />
          Back to orders
        </Link>
      </div>
    );
  }

  const priorIssues = await countPriorOrderIssues(
    order.customerInfo?.phone ?? null,
    order.id,
  );

  const address = order.customerInfo?.address;

  return (
    <div className="flex flex-col gap-6">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex flex-col gap-1">
          <Link
            href="/admin/orders"
            className="flex w-fit items-center gap-1.5 text-xs text-color-secondary hover:text-white"
          >
            <HiArrowLeft className="h-3.5 w-3.5" />
            Back to orders
          </Link>
          <div className="flex items-center gap-3">
            <h1 className="text-2xl font-semibold tracking-tight text-white">
              Order #{order.orderNumber}
            </h1>
            <OrderStatusBadge status={order.status} />
          </div>
          <p className="text-xs text-color-secondary">
            Placed {format(new Date(order.createdAt), "dd MMM yyyy 'at' HH:mm")}
          </p>
        </div>

        <OrderStatusControl orderId={order.id} status={order.status} />
      </div>

      {priorIssues > 0 && (
        <div className="flex items-center gap-2 rounded-lg border border-orange-500/30 bg-orange-500/10 px-4 py-3 text-sm text-orange-400">
          <FiAlertTriangle size={16} />
          This customer has {priorIssues} previous cancelled/no-answer order
          {priorIssues === 1 ? "" : "s"}.
        </div>
      )}

      <div className="grid grid-cols-1 gap-4 lg:grid-cols-3">
        <div className="flex flex-col gap-3 rounded-lg border border-border-primary bg-background-secondary p-4 lg:col-span-1">
          <h2 className="text-sm font-semibold text-white">Customer</h2>
          <p className="text-sm text-white">{order.customerInfo?.name}</p>
          <a
            href={`tel:${order.customerInfo?.phone}`}
            className="flex items-center gap-2 text-sm text-violet-400 hover:underline"
          >
            <FiPhone size={14} />
            {order.customerInfo?.phone}
          </a>
          <p className="flex items-center gap-2 text-sm text-color-secondary">
            <FiMail size={14} />
            {order.customerInfo?.email}
          </p>
          {address && (
            <div className="flex items-start gap-2 text-sm text-color-secondary">
              <FiMapPin size={14} className="mt-0.5 shrink-0" />
              <span>
                {address.line1}
                {address.line2 ? `, ${address.line2}` : ""}, {address.city},{" "}
                {getWilayaName(address.wilaya) ?? address.wilaya},{" "}
                {address.country}
              </span>
            </div>
          )}
        </div>

        <div className="flex flex-col gap-3 rounded-lg border border-border-primary bg-background-secondary p-4 lg:col-span-2">
          <h2 className="text-sm font-semibold text-white">Items</h2>
          <div className="flex flex-col divide-y divide-border-primary">
            {order.orderProducts.map((item) => (
              <div
                key={item.id}
                className="flex items-center justify-between gap-4 py-3 first:pt-0 last:pb-0"
              >
                <div className="flex flex-col">
                  <p className="text-sm text-white">
                    {item.variant.product.name}
                  </p>
                  <p className="text-xs text-color-secondary">
                    {item.variant.flavor} · {item.variant.quantity}{item.variant.quantityUnit} · Qty{" "}
                    {item.quantity}
                  </p>
                </div>
                <p className="text-sm font-medium text-violet-400">
                  {formatPriceFromEuros(item.variant.product.price)}
                </p>
              </div>
            ))}
          </div>
          <div className="flex items-center justify-between border-t border-border-primary pt-3">
            <span className="text-sm text-color-secondary">Total</span>
            <span className="text-base font-semibold text-white">
              {formatPriceFromCents(order.customerInfo?.totalPrice ?? 0)}
            </span>
          </div>
        </div>
      </div>
    </div>
  );
};

function OrderDetailSkeleton() {
  return (
    <div className="flex flex-col gap-4 animate-pulse">
      <div className="h-8 w-48 rounded-md bg-white/5" />
      <div className="h-32 rounded-md bg-white/5" />
      <div className="h-48 rounded-md bg-white/5" />
    </div>
  );
}

const AdminOrderDetailPage = ({ params }: Props) => {
  return (
    <Suspense fallback={<OrderDetailSkeleton />}>
      <OrderDetailContent params={params} />
    </Suspense>
  );
};

export default AdminOrderDetailPage;
