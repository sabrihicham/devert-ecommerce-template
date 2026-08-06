import { createServiceClient } from "@/lib/db/supabase/server";

const BUCKET = "product-images";
const PREFIX = "categories";

export async function uploadCategoryImage(file: File) {
  const extension = file.name.split(".").pop() || "webp";
  const path = `${PREFIX}/${Date.now()}-${crypto.randomUUID()}.${extension}`;
  const client = createServiceClient();
  const { error } = await client.storage.from(BUCKET).upload(path, file, { cacheControl: "3600", upsert: false });
  if (error) return null;
  return client.storage.from(BUCKET).getPublicUrl(path).data.publicUrl;
}

export async function deleteCategoryImage(url: string | null | undefined) {
  if (!url) return;
  const marker = `/storage/v1/object/public/${BUCKET}/`;
  const path = url.split(marker)[1];
  if (path?.startsWith(`${PREFIX}/`)) await createServiceClient().storage.from(BUCKET).remove([path]);
}

export function collectionFields(formData: FormData) {
  return {
    name: String(formData.get("name") || "").trim(), slug: String(formData.get("slug") || "").trim(),
    description: String(formData.get("description") || "").trim() || null,
  };
}
