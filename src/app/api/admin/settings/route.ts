import { NextRequest, NextResponse } from "next/server";
import { revalidatePath } from "next/cache";

import { verifyAdmin } from "@/utils/admin";
import { getStoreSettings, updateStoreSettings } from "@/services/settings.service";
import { updateStoreSettingsSchema } from "@/lib/db/drizzle/schema";
import { createServiceClient } from "@/lib/db/supabase/server";

/**
 * FormData values are always strings (apart from uploaded files), while the
 * settings schema intentionally stores these fields as integers. Keep an
 * invalid value as-is so Zod can return the normal field validation error.
 */
function parseNullableInteger(value: FormDataEntryValue | null) {
  if (value === null || value === "") return null;
  if (value instanceof File) return value;

  const numberValue = Number(value);
  return Number.isFinite(numberValue) ? numberValue : value;
}

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

  const formData = await request.formData();
  const image = formData.get("logo");
  let logoUrl = formData.get("logoUrl") || null;
  if (image instanceof File && image.size) {
    const extension = image.name.split(".").pop() || "png";
    const path = `branding/logo-${Date.now()}.${extension}`;
    const client = createServiceClient();
    const { error } = await client.storage.from("product-images").upload(path, image, { cacheControl: "3600", upsert: false });
    if (error) return NextResponse.json({ error: "Unable to upload logo" }, { status: 500 });
    logoUrl = client.storage.from("product-images").getPublicUrl(path).data.publicUrl;
  }
  const body = {
    ...Object.fromEntries(formData.entries()),
    logoUrl,
    bannerActive: formData.get("bannerActive") === "true",
    minOrderAmountCents: parseNullableInteger(formData.get("minOrderAmountCents")),
    maxPendingOrdersPerPhone: parseNullableInteger(formData.get("maxPendingOrdersPerPhone")),
  };
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

  revalidatePath("/", "layout");
  revalidatePath("/admin/settings");

  return NextResponse.json({ success: true, settings: updated });
}
