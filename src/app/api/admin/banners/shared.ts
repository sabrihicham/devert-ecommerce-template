import { z } from "zod";

import { bannersRepository } from "@/lib/db/drizzle/repositories";
import { insertBannerSchema } from "@/lib/db/drizzle/schema";
import { createServiceClient } from "@/lib/db/supabase/server";
import { revalidateBanners } from "@/app/actions";

export const BANNER_BUCKET = "product-images";
export const BANNER_PATH = "banners";

export const bannerFieldsSchema = insertBannerSchema.omit({ imageUrl: true });

export function validationErrorResponse(error: z.ZodError) {
  return error.flatten().fieldErrors;
}

export function parseBannerFields(formData: FormData) {
  const isActiveRaw = formData.get("isActive");
  return bannerFieldsSchema.parse({
    title: formData.get("title") || null,
    titleFr: formData.get("titleFr") || null,
    subtitle: formData.get("subtitle") || null,
    subtitleFr: formData.get("subtitleFr") || null,
    linkUrl: formData.get("linkUrl") || null,
    sortOrder: formData.get("sortOrder") ?? 0,
    isActive: isActiveRaw === null ? true : isActiveRaw === "true",
    buttonLabelFr: formData.get("buttonLabelFr") || null,
  });
}

export async function uploadBannerImage(file: File): Promise<string | null> {
  const supabase = createServiceClient();

  const ext = file.name.split(".").pop();
  const name = `${Date.now()}-${Math.random().toString(36).substring(2)}.${ext}`;
  const fullPath = `${BANNER_PATH}/${name}`;

  const { error } = await supabase.storage
    .from(BANNER_BUCKET)
    .upload(fullPath, file, { cacheControl: "3600", upsert: false });

  if (error) {
    console.error("Error uploading banner image:", error);
    return null;
  }

  const {
    data: { publicUrl },
  } = supabase.storage.from(BANNER_BUCKET).getPublicUrl(fullPath);

  return publicUrl;
}

export async function deleteBannerImageByUrl(imageUrl: string) {
  const supabase = createServiceClient();
  const urlParts = imageUrl.split(`/storage/v1/object/public/${BANNER_BUCKET}/`);
  if (urlParts.length < 2) return;

  await supabase.storage.from(BANNER_BUCKET).remove([urlParts[1]]);
}

export async function safeRevalidateBanners() {
  try {
    await revalidateBanners();
  } catch (error) {
    console.error("Error revalidating banners:", error);
  }
}

export async function nextSortOrder(): Promise<number> {
  const all = await bannersRepository.findAll();
  return all.length;
}
