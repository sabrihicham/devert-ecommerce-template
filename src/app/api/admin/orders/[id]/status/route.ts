import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";

import { verifyAdmin } from "@/utils/admin";
import { updateOrderStatus } from "@/services/orders.service";
import { updateOrderStatusSchema } from "@/lib/db/drizzle/schema";

const idSchema = z.coerce.number().int().positive();

interface RouteContext {
  params: Promise<{ id: string }>;
}

export async function PATCH(request: NextRequest, { params }: RouteContext) {
  const admin = await verifyAdmin(request);
  if (!admin) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { id } = await params;
  const parsedId = idSchema.safeParse(id);
  if (!parsedId.success) {
    return NextResponse.json({ error: "Invalid order id" }, { status: 400 });
  }

  const body = await request.json().catch(() => null);
  const parsedBody = updateOrderStatusSchema.safeParse(body);
  if (!parsedBody.success) {
    return NextResponse.json(
      {
        error: "Invalid status",
        errors: parsedBody.error.flatten().fieldErrors,
      },
      { status: 400 },
    );
  }

  const updated = await updateOrderStatus(parsedId.data, parsedBody.data.status);
  if (!updated) {
    return NextResponse.json({ error: "Order not found" }, { status: 404 });
  }

  return NextResponse.json({ success: true, order: updated });
}
