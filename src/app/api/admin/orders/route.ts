import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";

import { verifyAdmin } from "@/utils/admin";
import { getAdminOrders } from "@/services/orders.service";
import { OrderStatusZod } from "@/lib/db/drizzle/schema";

const querySchema = z.object({
  status: OrderStatusZod.optional(),
  wilaya: z.string().trim().min(1).optional(),
  page: z.coerce.number().int().positive().optional(),
  pageSize: z.coerce.number().int().positive().max(100).optional(),
});

export async function GET(request: NextRequest) {
  const admin = await verifyAdmin(request);
  if (!admin) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const parsed = querySchema.safeParse(
    Object.fromEntries(request.nextUrl.searchParams),
  );

  if (!parsed.success) {
    return NextResponse.json(
      { error: "Invalid query", errors: parsed.error.flatten().fieldErrors },
      { status: 400 },
    );
  }

  const result = await getAdminOrders(parsed.data);
  return NextResponse.json(result);
}
