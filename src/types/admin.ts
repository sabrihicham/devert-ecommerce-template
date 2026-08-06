import type { Product, ProductVariant, ProductWithVariants, Banner, Collection, SupplementForm, QuantityUnit } from "@/lib/db/drizzle/schema";
export type BasicInfoData = Pick<Product, "name" | "description" | "brand" | "ingredients" | "usage" | "warnings" | "tags" | "price" | "compareAtPrice" | "category" | "isFeatured">;
export type VariantFormData = Pick<ProductVariant, "flavor" | "form" | "quantity" | "quantityUnit" | "servings" | "sku" | "price" | "compareAtPrice" | "stock" | "images" | "isActive"> & { id?: number };
export interface VariantSubmitData extends Omit<VariantFormData, "images"> { id?: number; imageCount: number; existingImages: string[]; removedImages: string[]; }
export interface ProductFormData { id?: number; basicInfo: BasicInfoData; mainImageUrl?: string; variants: VariantFormData[]; }
export interface ProductApiResponse { success: boolean; message: string; errors?: Record<string, string[]>; data?: ProductWithVariants; }
export type VariantApiData = VariantSubmitData;
export interface BannerApiResponse { success: boolean; message: string; errors?: Record<string, string[]>; data?: Banner; }
export interface CollectionApiResponse { success: boolean; message: string; errors?: Record<string, string[]>; data?: Collection; }
export type { SupplementForm, QuantityUnit };
