"use client";

import { useRouter } from "next/navigation";
import { ProductForm } from "./ProductForm";
import { revalidateProducts } from "@/app/actions";
import type { ProductWithVariants } from "@/lib/db/drizzle/schema";
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
      nameFr: product.nameFr ?? product.name,
      description: product.description,
      descriptionFr: product.descriptionFr ?? product.description,
      brand: product.brand,
      ingredients: product.ingredients,
      ingredientsFr: product.ingredientsFr ?? product.ingredients,
      usage: product.usage,
      usageFr: product.usageFr ?? product.usage,
      warnings: product.warnings,
      warningsFr: product.warningsFr ?? product.warnings,
      tags: product.tags,
      tagsFr: product.tagsFr ?? product.tags,
      price: product.price,
      compareAtPrice: product.compareAtPrice,
      category: product.category,
      isFeatured: product.isFeatured,
    },
    mainImageUrl: product.img,
    variants: product.variants.map((variant) => ({
      id: variant.id,
      flavor: variant.flavor,
      flavorFr: variant.flavorFr ?? variant.flavor,
      form: variant.form,
      quantity: variant.quantity,
      quantityUnit: variant.quantityUnit,
      servings: variant.servings,
      sku: variant.sku,
      price: variant.price,
      compareAtPrice: variant.compareAtPrice ?? null,
      stock: variant.stock,
      isActive: variant.isActive,
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
