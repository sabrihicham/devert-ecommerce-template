import { NextResponse } from "next/server";
import { z } from "zod";

import { getUser } from "@/lib/auth/server";
import { sendEmail } from "@/lib/email";
import { createCompleteOrder } from "@/services/orders.service";
import { getVariantWithProduct } from "@/services/products.service";
import { DirectOrderSchema } from "@/schemas/direct-order";

const DELIVERY_DAYS = 7;

export async function POST(request: Request) {
  try {
    const parsed = DirectOrderSchema.safeParse(await request.json());
    if (!parsed.success) {
      return NextResponse.json(
        { error: "Invalid order data", details: parsed.error.flatten() },
        { status: 400 },
      );
    }

    const { variantId, size, orderRef, name, email, phone, line1, line2, city, wilaya } =
      parsed.data;
    const variant = await getVariantWithProduct(variantId);

    if (!variant || !variant.sizes.includes(size)) {
      return NextResponse.json(
        { error: "This product option is no longer available" },
        { status: 400 },
      );
    }

    const user = await getUser();
    const order = await createCompleteOrder(
      {
        userId: user?.id ?? null,
        deliveryDate: new Date(Date.now() + DELIVERY_DAYS * 24 * 60 * 60 * 1000),
      },
      {
        name,
        email,
        phone,
        address: { line1, line2, city, wilaya, country: "Algeria" },
        orderRef,
        totalPrice: Math.round(variant.product.price * 100),
      },
      [{ variantId: variant.id, size, quantity: 1 }],
    );

    if (!order) {
      return NextResponse.json({ error: "Unable to place order" }, { status: 500 });
    }

    await sendEmail(order).catch((error) => {
      console.error("Error sending direct-order confirmation email:", error);
    });

    return NextResponse.json({
      success: true,
      orderNumber: order.orderNumber,
      orderRef,
    });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json({ error: "Invalid order data" }, { status: 400 });
    }
    console.error("Error placing direct order:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
