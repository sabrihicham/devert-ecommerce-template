"use client";

import { useRouter } from "next/navigation";
import { ProductForm } from "./ProductForm";
import { revalidateProducts } from "@/app/actions";
import type { ProductWithVariants, ProductSize } from "@/lib/db/drizzle/schema";
import type { ProductFormData } from "@/types/admin";
import type { CategoryOption } from "./BasicInfo";

interface EditProductFormProps {
  product: ProductWithVariants;
  categories: CategoryOption[];
}

function mapProductToFormData(product: ProductWithVariants): ProductFormData {
  return {
    id: product.id,
    basicInfo: {
      name: product.name,
      description: product.description,
      price: product.price,
      category: product.category,
      isFeatured: product.isFeatured,
    },
    mainImageUrl: product.img,
    variants: product.variants.map((variant) => ({
      id: variant.id,
      color: variant.color,
      sizes: variant.sizes as ProductSize[],
      images: variant.images,
    })),
  };
}

export function EditProductForm({ product, categories }: EditProductFormProps) {
  const router = useRouter();

  const handleSuccess = async (updatedProduct: ProductWithVariants) => {
    await revalidateProducts(updatedProduct.id);
    router.push("/");
  };

  return (
    <ProductForm
      mode="edit"
      categories={categories}
      initialData={mapProductToFormData(product)}
      onSuccess={handleSuccess}
    />
  );
}
