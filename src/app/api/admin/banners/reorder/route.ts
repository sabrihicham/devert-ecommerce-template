import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";

import { bannersRepository } from "@/lib/db/drizzle/repositories";
import { verifyAdmin } from "@/utils/admin";
import { safeRevalidateBanners } from "../shared";

const reorderSchema = z.object({
  ids: z.array(z.number().int().positive()).min(1, "No banners to reorder"),
});

export async function PATCH(request: NextRequest) {
  try {
    const admin = await verifyAdmin(request);
    if (!admin) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await request.json().catch(() => null);
    const { ids } = reorderSchema.parse(body);

    const success = await bannersRepository.reorder(ids);
    if (!success) {
      return NextResponse.json(
        { error: "Error reordering banners" },
        { status: 500 },
      );
    }

    await safeRevalidateBanners();

    return NextResponse.json({ success: true, message: "Banners reordered" });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: "Invalid reorder payload", errors: error.flatten().fieldErrors },
        { status: 400 },
      );
    }

    console.error("Error reordering banners:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 },
    );
  }
}
