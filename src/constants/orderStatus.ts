import type { OrderStatus } from "@/lib/db/drizzle/schema";

export const ORDER_STATUS_VALUES: OrderStatus[] = [
  "pending",
  "confirmed",
  "no_answer",
  "out_for_delivery",
  "delivered",
  "cancelled",
  "returned",
];

export const ORDER_STATUS_LABELS: Record<OrderStatus, string> = {
  pending: "Pending",
  confirmed: "Confirmed",
  no_answer: "No answer",
  out_for_delivery: "Out for delivery",
  delivered: "Delivered",
  cancelled: "Cancelled",
  returned: "Returned",
};

export const ORDER_STATUS_STYLES: Record<OrderStatus, string> = {
  pending: "bg-amber-500/15 text-amber-400",
  confirmed: "bg-blue-500/15 text-blue-400",
  no_answer: "bg-orange-500/15 text-orange-400",
  out_for_delivery: "bg-violet-500/15 text-violet-400",
  delivered: "bg-green-500/15 text-green-400",
  cancelled: "bg-red-500/15 text-red-400",
  returned: "bg-pink-500/15 text-pink-400",
};
