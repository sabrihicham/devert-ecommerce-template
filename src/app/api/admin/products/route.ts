import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";

import { revalidateProducts } from "@/app/actions";
import { productsRepository } from "@/lib/db/drizzle/repositories";
import {
  type InsertProductVariant,
  ProductCategoryZod,
  SupplementFormZod,
  QuantityUnitZod,
} from "@/lib/db/drizzle/schema";
import { createServiceClient } from "@/lib/db/supabase/server";
import { verifyAdmin } from "@/utils/admin";

const BUCKET = "product-images";

type ProcessedVariant = Omit<InsertProductVariant, "productId"> & {
  id?: number;
};

type BuildVariantsTracker = {
  uploadedImageUrls: string[];
};

const productIdSchema = z.coerce.number().int().positive();

const productFormSchema = z.object({
  name: z.string().trim().min(1, "Name is required"),
  description: z.string().trim().min(1, "Description is required"),
  brand: z.string().trim().min(1, "Brand is required"),
  ingredients: z.string().default(""),
  usage: z.string().default(""),
  warnings: z.string().default(""),
  tags: z.array(z.string()).default([]),
  price: z.coerce.number().positive("Price must be greater than 0"),
  compareAtPrice: z.coerce.number().positive().nullable().optional(),
  category: ProductCategoryZod,
  isFeatured: z.boolean().default(false),
});

const variantFormSchema = z.object({
  id: z.number().int().positive().optional(),
  flavor: z.string().trim().min(1, "Flavor is required"),
  form: SupplementFormZod,
  quantity: z.coerce.number().positive(),
  quantityUnit: QuantityUnitZod,
  servings: z.coerce.number().int().positive().nullable().optional(),
  sku: z.string().trim().min(1, "SKU is required"),
  price: z.coerce.number().positive(),
  compareAtPrice: z.coerce.number().positive().nullable().optional(),
  stock: z.coerce.number().int().nonnegative(),
  isActive: z.boolean().default(true),
  imageCount: z.number().int().nonnegative().optional(),
  existingImages: z.array(z.string()).optional(),
  removedImages: z.array(z.string()).optional(),
});

type VariantFormInput = z.infer<typeof variantFormSchema>;

function validationErrorResponse(error: z.ZodError, message: string) {
  return NextResponse.json(
    {
      error: message,
      errors: error.flatten().fieldErrors,
    },
    { status: 400 },
  );
}



function parseVariantsData(rawVariants: FormDataEntryValue | null): VariantFormInput[] {
  if (typeof rawVariants !== "string") {
    throw new z.ZodError([
      {
        code: "custom",
        message: "Variants are required",
        path: ["variants"],
      },
    ]);
  }

  let parsedVariants: unknown;

  try {
    parsedVariants = JSON.parse(rawVariants);
  } catch {
    throw new z.ZodError([
      {
        code: "custom",
        message: "Invalid variants payload",
        path: ["variants"],
      },
    ]);
  }

  return z
    .array(variantFormSchema)
    .min(1, "At least one variant is required")
    .parse(parsedVariants);
}

async function assertUniqueSkus(variants: VariantFormInput[], productId?: number) {
  const seen = new Set<string>();
  for (const variant of variants) {
    if (seen.has(variant.sku)) throw new z.ZodError([{ code: "custom", message: "SKU مكرر داخل المتغيرات", path: ["variants"] }]);
    seen.add(variant.sku);
    const existing = await productsRepository.findVariantBySku(variant.sku);
    if (existing && existing.productId !== productId) throw new z.ZodError([{ code: "custom", message: `SKU مستخدم مسبقًا: ${variant.sku}`, path: ["variants"] }]);
  }
}

function normalizeColorPath(color: string) {
  return color.toLowerCase().replace(/\s+/g, "-").replace(/[^a-z0-9-]/g, "") || "variant";
}

function parseTags(raw: FormDataEntryValue | null): string[] {
  if (typeof raw !== "string" || !raw) return [];
  try { const value = JSON.parse(raw); return z.array(z.string()).parse(value); } catch { return raw.split(",").map((tag) => tag.trim()).filter(Boolean); }
}

async function uploadImage(file: File, path: string): Promise<string | null> {
  const supabase = createServiceClient();

  const ext = file.name.split(".").pop();
  const name = `${Date.now()}-${Math.random().toString(36).substring(2)}.${ext}`;
  const fullPath = `${path}/${name}`;

  const { error } = await supabase.storage
    .from(BUCKET)
    .upload(fullPath, file, { cacheControl: "3600", upsert: false });

  if (error) {
    console.error("Error uploading image:", error);
    return null;
  }

  const {
    data: { publicUrl },
  } = supabase.storage.from(BUCKET).getPublicUrl(fullPath);

  return publicUrl;
}

async function deleteImageByUrl(imageUrl: string) {
  const supabase = createServiceClient();
  const urlParts = imageUrl.split(`/storage/v1/object/public/${BUCKET}/`);
  if (urlParts.length < 2) return;

  const path = urlParts[1];
  await supabase.storage.from(BUCKET).remove([path]);
}

async function cleanupProductImages(productId: number) {
  try {
    const supabase = createServiceClient();
    const productPath = `products/${productId}`;
    const paths: string[] = [];

    const { data: rootEntries } = await supabase.storage
      .from(BUCKET)
      .list(productPath, { limit: 100 });

    for (const entry of rootEntries ?? []) {
      if (entry.name === "variants") {
        continue;
      }

      paths.push(`${productPath}/${entry.name}`);
    }

    const { data: variantFolders } = await supabase.storage
      .from(BUCKET)
      .list(`${productPath}/variants`, { limit: 100 });

    for (const folder of variantFolders ?? []) {
      const variantFolderPath = `${productPath}/variants/${folder.name}`;
      const { data: variantFiles } = await supabase.storage
        .from(BUCKET)
        .list(variantFolderPath, { limit: 100 });

      for (const file of variantFiles ?? []) {
        paths.push(`${variantFolderPath}/${file.name}`);
      }
    }

    if (paths.length > 0) {
      await supabase.storage.from(BUCKET).remove(paths);
    }
  } catch (error) {
    console.error("Error cleaning product images:", error);
  }
}

function dedupeStrings(values: Array<string | null | undefined>) {
  return Array.from(
    new Set(values.filter((value): value is string => Boolean(value))),
  );
}

async function cleanupExternalResources({
  imageUrls = [],
}: {
  imageUrls?: string[];
}) {
  const tasks: Promise<void>[] = [];

  for (const imageUrl of dedupeStrings(imageUrls)) {
    tasks.push(
      deleteImageByUrl(imageUrl).catch((error) => {
        console.error("Error deleting image during cleanup:", error);
      }),
    );
  }

  await Promise.all(tasks);
}

async function safeRevalidateProducts(productId?: number) {
  try {
    await revalidateProducts(productId);
  } catch (error) {
    console.error("Error revalidating products:", error);
  }
}

async function buildVariants({
  formData,
  variantsData,
  productId,
  tracker,
}: {
  formData: FormData;
  variantsData: VariantFormInput[];
  productId: number;
  tracker: BuildVariantsTracker;
}): Promise<ProcessedVariant[]> {
  return Promise.all(
    variantsData.map(async (variant, idx) => {
      const existingImages = variant.existingImages ?? [];
      const newImages: string[] = [];
      const colorPath = normalizeColorPath(variant.sku);

      for (let i = 0; i < (variant.imageCount ?? 0); i++) {
        const file = formData.get(`variant_${idx}_image_${i}`);
        if (file instanceof File && file.size > 0) {
          const url = await uploadImage(
            file,
            `products/${productId}/variants/${colorPath}`,
          );
          if (!url) {
            throw new Error(
              `Error uploading image ${i + 1} for variant ${variant.flavor}`,
            );
          }
          newImages.push(url);
          tracker.uploadedImageUrls.push(url);
        }
      }

      const images = variant.id ? [...existingImages, ...newImages] : newImages;

      if (images.length === 0) {
        throw new Error(`Variant ${variant.flavor} must include at least one image`);
      }

      return {
        id: variant.id,
        flavor: variant.flavor,
        form: variant.form,
        quantity: variant.quantity,
        quantityUnit: variant.quantityUnit,
        servings: variant.servings ?? null,
        sku: variant.sku,
        price: variant.price,
        compareAtPrice: variant.compareAtPrice ?? null,
        stock: variant.stock,
        isActive: variant.isActive,
        images,
      };
    }),
  );
}

export async function POST(request: NextRequest) {
  let createdProductId: number | null = null;
  const tracker: BuildVariantsTracker = {
    uploadedImageUrls: [],
  };

  try {
    const user = await verifyAdmin(request);
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const formData = await request.formData();
    const productData = productFormSchema.parse({
      name: formData.get("name"),
      description: formData.get("description"),
      brand: formData.get("brand"),
      ingredients: formData.get("ingredients") ?? "",
      usage: formData.get("usage") ?? "",
      warnings: formData.get("warnings") ?? "",
      tags: parseTags(formData.get("tags")),
      price: formData.get("price"),
      compareAtPrice: formData.get("compareAtPrice") || null,
      category: formData.get("category"),
      isFeatured: formData.get("isFeatured") === "true",
    });
    const variantsData = parseVariantsData(formData.get("variants"));
    await assertUniqueSkus(variantsData);
    const mainImageEntry = formData.get("mainImage");

    if (!(mainImageEntry instanceof File) || mainImageEntry.size === 0) {
      return NextResponse.json(
        { error: "Main image is required" },
        { status: 400 },
      );
    }

    const product = await productsRepository.create({
      ...productData,
      img: "",
    });

    if (!product) {
      return NextResponse.json(
        { error: "Error creating product" },
        { status: 500 },
      );
    }

    createdProductId = product.id;

    const mainImageUrl = await uploadImage(mainImageEntry, `products/${product.id}`);
    if (!mainImageUrl) {
      return NextResponse.json(
        { error: "Error uploading main image" },
        { status: 500 },
      );
    }

    const variants = await buildVariants({
      formData,
      variantsData,
      productId: product.id,
      tracker,
    });

    const productWithVariants = await productsRepository.updateWithVariants(
      product.id,
      {
        ...productData,
        img: mainImageUrl,
      },
      variants,
    );

    if (!productWithVariants) {
      return NextResponse.json(
        { error: "Error creating product with variants" },
        { status: 500 },
      );
    }

    createdProductId = null;
    await safeRevalidateProducts(product.id);

    return NextResponse.json({
      success: true,
      message: "Product created successfully",
      data: productWithVariants,
    });
  } catch (error) {
    if (createdProductId) {
      await cleanupProductImages(createdProductId);
      await productsRepository.delete(createdProductId);
    }

    await cleanupExternalResources({
      imageUrls: tracker.uploadedImageUrls,
    });

    if (error instanceof z.ZodError) {
      return validationErrorResponse(error, "Invalid product payload");
    }

    console.error("Error creating product:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 },
    );
  }
}

export async function PUT(request: NextRequest) {
  const tracker: BuildVariantsTracker = {
    uploadedImageUrls: [],
  };

  try {
    const user = await verifyAdmin(request);
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const formData = await request.formData();
    const id = productIdSchema.parse(formData.get("id"));
    const productData = productFormSchema.parse({
      name: formData.get("name"),
      description: formData.get("description"),
      brand: formData.get("brand"),
      ingredients: formData.get("ingredients") ?? "",
      usage: formData.get("usage") ?? "",
      warnings: formData.get("warnings") ?? "",
      tags: parseTags(formData.get("tags")),
      price: formData.get("price"),
      compareAtPrice: formData.get("compareAtPrice") || null,
      category: formData.get("category"),
      isFeatured: formData.get("isFeatured") === "true",
    });
    const variantsData = parseVariantsData(formData.get("variants"));
    await assertUniqueSkus(variantsData, id);
    const mainImageEntry = formData.get("mainImage");
    const existingMainImageEntry = formData.get("existingMainImage");
    const existingMainImage =
      typeof existingMainImageEntry === "string" && existingMainImageEntry
        ? existingMainImageEntry
        : null;

    const existingProduct = await productsRepository.findById(id);
    if (!existingProduct) {
      return NextResponse.json({ error: "Product not found" }, { status: 404 });
    }

    const nextVariantIds = new Set(
      variantsData.flatMap((variant) => (variant.id ? [variant.id] : [])),
    );
    const removedVariants = existingProduct.variants.filter(
      (variant) => !nextVariantIds.has(variant.id),
    );
    const removedImageUrls = dedupeStrings([
      ...removedVariants.flatMap((variant) => variant.images),
      ...variantsData.flatMap((variant) => variant.removedImages ?? []),
    ]);

    let mainImageUrl = existingMainImage ?? existingProduct.img;
    let previousMainImageUrl: string | null = null;

    if (mainImageEntry instanceof File && mainImageEntry.size > 0) {
      const uploadedUrl = await uploadImage(mainImageEntry, `products/${id}`);
      if (!uploadedUrl) {
        return NextResponse.json(
          { error: "Error uploading main image" },
          { status: 500 },
        );
      }

      tracker.uploadedImageUrls.push(uploadedUrl);
      previousMainImageUrl = existingProduct.img || null;
      mainImageUrl = uploadedUrl;
    }

    const variants = await buildVariants({
      formData,
      variantsData,
      productId: id,
      tracker,
    });

    const updatedProduct = await productsRepository.updateWithVariants(
      id,
      {
        ...productData,
        img: mainImageUrl,
      },
      variants,
    );

    if (!updatedProduct) {
      return NextResponse.json(
        { error: "Error updating product" },
        { status: 500 },
      );
    }

    await safeRevalidateProducts(id);
    await cleanupExternalResources({
      imageUrls: [
        ...removedImageUrls,
        ...(previousMainImageUrl ? [previousMainImageUrl] : []),
      ],
    });

    return NextResponse.json({
      success: true,
      message: "Product updated successfully",
      data: updatedProduct,
    });
  } catch (error) {
    await cleanupExternalResources({
      imageUrls: tracker.uploadedImageUrls,
    });

    if (error instanceof z.ZodError) {
      return validationErrorResponse(error, "Invalid product payload");
    }

    console.error("Error updating product:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 },
    );
  }
}

export async function DELETE(request: NextRequest) {
  try {
    const user = await verifyAdmin(request);
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const productId = productIdSchema.parse(request.nextUrl.searchParams.get("id"));
    const existingProduct = await productsRepository.findById(productId);
    if (!existingProduct) {
      return NextResponse.json({ error: "Product not found" }, { status: 404 });
    }

    const deleted = await productsRepository.delete(productId);
    if (!deleted) {
      return NextResponse.json({ error: "Product not found" }, { status: 404 });
    }

    await safeRevalidateProducts(productId);
    await cleanupProductImages(productId);

    return NextResponse.json({
      success: true,
      message: "Product deleted successfully",
    });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return validationErrorResponse(error, "Invalid product id");
    }

    console.error("Error deleting product:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 },
    );
  }
}
