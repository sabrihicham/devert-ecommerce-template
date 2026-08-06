import { NextResponse } from "next/server";
import { randomUUID } from "crypto";
import { z } from "zod";

import { getUser } from "@/lib/auth/server";
import { getCartWithDetails, clearCart } from "@/services/cart.service";
import { createCompleteOrder } from "@/services/orders.service";
import { sendEmail } from "@/lib/email";
import { CreateOrderSchema } from "@/schemas/checkout";

const DELIVERY_DAYS = 7;

export async function POST(request: Request) {
  try {
    const user = await getUser();
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const parsed = CreateOrderSchema.safeParse(await request.json());
    if (!parsed.success) {
      return NextResponse.json(
        { error: "Invalid checkout data", details: parsed.error.flatten() },
        { status: 400 },
      );
    }

    const { cartItemIds, name, email, phone, line1, line2, city, wilaya } =
      parsed.data;

    const cartItems = await getCartWithDetails(user.id);
    const selectedItems = cartItems.filter((item) =>
      cartItemIds.includes(item.id),
    );

    if (selectedItems.length !== cartItemIds.length) {
      return NextResponse.json(
        { error: "Some cart items could not be found" },
        { status: 400 },
      );
    }

    if (selectedItems.length === 0) {
      return NextResponse.json({ error: "Cart is empty" }, { status: 400 });
    }

    const totalPrice = Math.round(
      selectedItems.reduce(
        (sum, item) => sum + item.product.price * item.quantity,
        0,
      ) * 100,
    );

    const deliveryDate = new Date(
      Date.now() + DELIVERY_DAYS * 24 * 60 * 60 * 1000,
    );

    const order = await createCompleteOrder(
      { userId: user.id, deliveryDate },
      {
        name,
        email,
        phone,
        address: { line1, line2, city, wilaya, country: "Algeria" },
        orderRef: randomUUID(),
        totalPrice,
      },
      selectedItems.map((item) => ({
        variantId: item.variantId,
        quantity: item.quantity,
        size: item.size,
      })),
    );

    if (!order) {
      return NextResponse.json(
        { error: "Error creating order" },
        { status: 500 },
      );
    }

    await clearCart(user.id);
    await sendEmail(order).catch((error) => {
      console.error("Error sending order confirmation email:", error);
    });

    return NextResponse.json({
      success: true,
      orderId: order.id,
      orderNumber: order.orderNumber,
    });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: "Invalid checkout data", details: error.flatten() },
        { status: 400 },
      );
    }

    console.error("Error creating order:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 },
    );
  }
}
