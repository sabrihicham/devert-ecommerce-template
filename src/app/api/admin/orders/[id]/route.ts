import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";

import { verifyAdmin } from "@/utils/admin";
import { getOrderById, countPriorOrderIssues } from "@/services/orders.service";

const idSchema = z.coerce.number().int().positive();

interface RouteContext {
  params: Promise<{ id: string }>;
}

export async function GET(request: NextRequest, { params }: RouteContext) {
  const admin = await verifyAdmin(request);
  if (!admin) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { id } = await params;
  const parsedId = idSchema.safeParse(id);
  if (!parsedId.success) {
    return NextResponse.json({ error: "Invalid order id" }, { status: 400 });
  }

  const order = await getOrderById(parsedId.data);
  if (!order) {
    return NextResponse.json({ error: "Order not found" }, { status: 404 });
  }

  const priorIssues = await countPriorOrderIssues(
    order.customerInfo?.phone ?? null,
    order.id,
  );

  return NextResponse.json({ order, priorIssues });
}
