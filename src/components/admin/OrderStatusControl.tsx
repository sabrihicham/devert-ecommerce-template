"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";

import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  ORDER_STATUS_LABELS,
  ORDER_STATUS_VALUES,
} from "@/constants/orderStatus";
import type { OrderStatus } from "@/lib/db/drizzle/schema";

interface OrderStatusControlProps {
  orderId: number;
  status: OrderStatus;
}

export function OrderStatusControl({
  orderId,
  status,
}: OrderStatusControlProps) {
  const router = useRouter();
  const [current, setCurrent] = useState<OrderStatus>(status);
  const [isPending, startTransition] = useTransition();

  async function handleChange(next: string) {
    const previous = current;
    setCurrent(next as OrderStatus);

    try {
      const res = await fetch(`/api/admin/orders/${orderId}/status`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status: next }),
      });

      if (!res.ok) {
        throw new Error("Failed to update status");
      }

      toast.success("Order status updated");
      startTransition(() => router.refresh());
    } catch {
      setCurrent(previous);
      toast.error("Failed to update order status");
    }
  }

  return (
    <Select value={current} onValueChange={handleChange} disabled={isPending}>
      <SelectTrigger className="w-full sm:w-56">
        <SelectValue />
      </SelectTrigger>
      <SelectContent>
        {ORDER_STATUS_VALUES.map((value) => (
          <SelectItem key={value} value={value}>
            {ORDER_STATUS_LABELS[value]}
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  );
}
