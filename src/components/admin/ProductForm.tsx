"use client";

import { useState, useRef } from "react";
import { useProductMutation } from "@/hooks/product/mutations/useProductMutation";
import { Button } from "@/components/ui/button";
import LoadingButton from "@/components/ui/loadingButton";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { FiCheck, FiX, FiPackage, FiImage, FiLayers } from "react-icons/fi";
import { BasicInfo, type BasicInfoRef, type CategoryOption } from "./BasicInfo";
import { MainImage, type MainImageRef } from "./MainImage";
import { VariantsSection, type VariantsSectionRef } from "./VariantsSection";
import type { ProductWithVariants } from "@/lib/db/drizzle/schema";
import type { ProductFormData } from "@/types/admin";

export type { ProductFormData };

interface FormState {
  success: boolean;
  message: string;
  errors?: Record<string, string[]>;
}

interface ProductFormProps {
  mode: "create" | "edit";
  initialData?: ProductFormData;
  categories: CategoryOption[];
  onSuccess?: (product: ProductWithVariants) => void;
}

export function ProductForm({
  mode,
  initialData,
  categories,
  onSuccess,
}: ProductFormProps) {
  const { createAsync, updateAsync, isPending, isUpdatePending } =
    useProductMutation();
  const [state, setState] = useState<FormState>({
    success: false,
    message: "",
    errors: undefined,
  });

  const basicInfoRef = useRef<BasicInfoRef>(null!);
  const mainImageRef = useRef<MainImageRef>(null!);
  const variantsSectionRef = useRef<VariantsSectionRef>(null!);

  const isLoading = mode === "create" ? isPending : isUpdatePending;

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    const formData = new FormData();

    if (mode === "edit" && initialData?.id) {
      formData.append("id", initialData.id.toString());
    }

    formData.append("name", basicInfoRef.current.name);
    formData.append("description", basicInfoRef.current.description);
    formData.append("brand", basicInfoRef.current.brand);
    formData.append("ingredients", basicInfoRef.current.ingredients);
    formData.append("usage", basicInfoRef.current.usage);
    formData.append("warnings", basicInfoRef.current.warnings);
    formData.append("tags", JSON.stringify(basicInfoRef.current.tags));
    formData.append("price", String(basicInfoRef.current.price));
    if (basicInfoRef.current.compareAtPrice != null) formData.append("compareAtPrice", String(basicInfoRef.current.compareAtPrice));
    formData.append("category", basicInfoRef.current.category);
    formData.append("isFeatured", String(basicInfoRef.current.isFeatured));

    // Handle main image
    if (mainImageRef.current.hasNewImage && mainImageRef.current.file) {
      formData.append("mainImage", mainImageRef.current.file);
    } else if (mainImageRef.current.existingUrl) {
      formData.append("existingMainImage", mainImageRef.current.existingUrl);
    }

    const variantsData = variantsSectionRef.current.getVariants();
    const imagesData = variantsSectionRef.current.getImages();

    variantsData.forEach((variant, index) => {
      const variantImages = imagesData[`variant_${index}`] || [];
      variantImages.forEach((image, imgIndex) => {
        formData.append(`variant_${index}_image_${imgIndex}`, image);
      });
      formData.append(
        `variant_${index}_imageCount`,
        variantImages.length.toString(),
      );
    });

    // Include variant data with existing images info for edit mode
    const variantsForSubmit = variantsData.map((v) => ({
      id: v.id,
      flavor: v.flavor,
      form: v.form,
      quantity: v.quantity,
      quantityUnit: v.quantityUnit,
      servings: v.servings,
      sku: v.sku,
      price: v.price,
      compareAtPrice: v.compareAtPrice,
      stock: v.stock,
      isActive: v.isActive,
      imageCount: v.imageCount,
      existingImages: v.existingImages,
      removedImages: v.removedImages,
    }));

    formData.append("variants", JSON.stringify(variantsForSubmit));

    try {
      const result =
        mode === "create"
          ? await createAsync(formData)
          : await updateAsync(formData);

      setState({
        success: result.success,
        message: result.message,
        errors: result.errors,
      });

      if (result.success && result.data && onSuccess) {
        onSuccess(result.data);
      }
    } catch (error) {
      setState({
        success: false,
        message: "An unexpected error occurred",
        errors: undefined,
      });
    }
  };

  const handleReset = () => {
    basicInfoRef.current.reset();
    mainImageRef.current.reset();
    variantsSectionRef.current.reset();
    setState({ success: false, message: "", errors: undefined });
  };

  const title = mode === "create" ? "Create Product" : "Edit Product";
  const subtitle =
    mode === "create"
      ? "Add a new product with variants and images to your store"
      : "Update product information, variants and images";
  const submitButtonText =
    mode === "create" ? "Create Product" : "Update Product";

  return (
    <form
      onSubmit={handleSubmit}
      className="max-w-3xl mx-auto p-6 md:p-8 space-y-6"
    >
      {/* Header */}
      <div className="space-y-2">
        <h1 className="text-3xl font-bold tracking-tight text-color-primary">
          {title}
        </h1>
        <p className="text-color-tertiary">{subtitle}</p>
      </div>

      <Separator />

      {/* Alert Message */}
      {state.message && (
        <Alert variant={state.success ? "success" : "destructive"}>
          {state.success ? (
            <FiCheck className="h-4 w-4" />
          ) : (
            <FiX className="h-4 w-4" />
          )}
          <AlertTitle>{state.success ? "Success" : "Error"}</AlertTitle>
          <AlertDescription>{state.message}</AlertDescription>
        </Alert>
      )}

      {/* Basic Information Card */}
      <Card>
        <CardHeader className="pb-4">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-lg bg-white/10">
              <FiPackage className="h-5 w-5 text-white" />
            </div>
            <div>
              <CardTitle className="text-lg">معلومات المنتج</CardTitle>
              <CardDescription>
                بيانات المكمل الأساسية
              </CardDescription>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <BasicInfo
            ref={basicInfoRef}
            errors={state.errors}
            initialData={initialData?.basicInfo}
            categories={categories}
          />
        </CardContent>
      </Card>

      {/* Main Image Card */}
      <Card>
        <CardHeader className="pb-4">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-lg bg-white/10">
              <FiImage className="h-5 w-5 text-white" />
            </div>
            <div>
              <CardTitle className="text-lg">الصورة الرئيسية</CardTitle>
              <CardDescription>
                Primary product image displayed in listings
              </CardDescription>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <MainImage
            ref={mainImageRef}
            errors={state.errors}
            initialImageUrl={initialData?.mainImageUrl}
          />
        </CardContent>
      </Card>

      {/* Variants Card */}
      <Card>
        <CardHeader className="pb-4">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-lg bg-white/10">
              <FiLayers className="h-5 w-5 text-white" />
            </div>
            <div>
              <CardTitle className="text-lg">متغيرات المنتج</CardTitle>
              <CardDescription>
                أضف النكهة والحجم والسعر والمخزون لكل خيار
              </CardDescription>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <VariantsSection
            ref={variantsSectionRef}
            initialVariants={initialData?.variants}
          />
        </CardContent>
      </Card>

      {/* Action Buttons */}
      <Card className="border-dashed">
        <CardContent className="pt-6">
          <div className="flex flex-col sm:flex-row gap-3">
            <Button
              type="reset"
              onClick={handleReset}
              variant="outline"
              className="flex-1"
              size="lg"
            >
              <FiX className="mr-2 h-4 w-4" />
              {mode === "create" ? "Clear Form" : "Reset Changes"}
            </Button>
            <LoadingButton
              loading={isLoading}
              className="flex-1 bg-white text-black hover:bg-white/90"
              size="lg"
              icon={<FiCheck className="h-4 w-4" />}
              iconPosition="left"
            >
              {submitButtonText}
            </LoadingButton>
          </div>
        </CardContent>
      </Card>
    </form>
  );
}
