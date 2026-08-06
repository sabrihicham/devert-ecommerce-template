import { NextRequest, NextResponse } from "next/server";
import { revalidatePath } from "next/cache";

import { verifyAdmin } from "@/utils/admin";
import { getStoreSettings, updateStoreSettings } from "@/services/settings.service";
import { updateStoreSettingsSchema } from "@/lib/db/drizzle/schema";

export async function GET(request: NextRequest) {
  const admin = await verifyAdmin(request);
  if (!admin) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const settings = await getStoreSettings();
  if (!settings) {
    return NextResponse.json({ error: "Store settings not found" }, { status: 404 });
  }

  return NextResponse.json({ settings });
}

export async function PUT(request: NextRequest) {
  const admin = await verifyAdmin(request);
  if (!admin) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const body = await request.json().catch(() => null);
  const parsedBody = updateStoreSettingsSchema.safeParse(body);
  if (!parsedBody.success) {
    return NextResponse.json(
      {
        error: "Invalid settings",
        errors: parsedBody.error.flatten().fieldErrors,
      },
      { status: 400 },
    );
  }

  const updated = await updateStoreSettings(parsedBody.data);
  if (!updated) {
    return NextResponse.json({ error: "Store settings not found" }, { status: 404 });
  }

  revalidatePath("/");

  return NextResponse.json({ success: true, settings: updated });
}
