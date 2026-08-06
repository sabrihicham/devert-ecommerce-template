import type { Order, OrderLineItem, DomainAddress } from "@/types/domain";
import type {
  OrderItem,
  CustomerInfo,
  OrderProduct,
} from "@/lib/db/drizzle/schema";

export function transformOrderToViewModel(
  order: OrderItem,
  products: OrderProduct[],
  customerInfo: CustomerInfo,
): Order {
  return {
    id: order.id,
    userId: order.userId ?? undefined,
    orderNumber: order.orderNumber,
    items: products.map((p) => ({
      productId: 0,
      variantId: p.variantId,
      quantity: p.quantity,
      variantSnapshot: p.variantSnapshot,
      price: 0,
      flavor: p.variantSnapshot.flavor,
    })),
    customer: {
      name: customerInfo.name,
      email: customerInfo.email,
      phone: customerInfo.phone ?? undefined,
      address: {
        line1: customerInfo.address.line1,
        line2: customerInfo.address.line2,
        city: customerInfo.address.city,
        wilaya: customerInfo.address.wilaya,
        country: customerInfo.address.country,
      } as DomainAddress,
    },
    total: customerInfo.totalPrice,
    status: "delivered",
    deliveryDate: order.deliveryDate,
    createdAt: order.createdAt,
  };
}

export function calculateOrderTotal(items: OrderLineItem[]): number {
  return items.reduce((total, item) => total + item.price * item.quantity, 0);
}

export function isOrderDelivered(deliveryDate: string): boolean {
  return new Date(deliveryDate) <= new Date();
}
