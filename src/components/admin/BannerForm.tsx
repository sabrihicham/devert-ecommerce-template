"use client";

import { useState, type FormEvent } from "react";
import Image from "next/image";
import { toast } from "sonner";
import { FiUpload, FiX, FiImage } from "react-icons/fi";

import { Button } from "@/components/ui/button";
import LoadingButton from "@/components/ui/loadingButton";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { cn } from "@/lib/utils";
import { useBannerMutation } from "@/hooks/admin/banners/useBannerMutation";
import type { Banner } from "@/lib/db/drizzle/schema";

interface BannerFormProps {
  banner?: Banner;
  onSuccess: () => void;
  onCancel: () => void;
}

interface FormErrors {
  [key: string]: string[] | undefined;
}

export function BannerForm({ banner, onSuccess, onCancel }: BannerFormProps) {
  const isEdit = Boolean(banner);
  const { createAsync, updateAsync, isPending, isUpdatePending } =
    useBannerMutation();

  const [title, setTitle] = useState(banner?.title || "");
  const [subtitle, setSubtitle] = useState(banner?.subtitle || "");
  const [linkUrl, setLinkUrl] = useState(banner?.linkUrl || "");
  const [isActive, setIsActive] = useState(banner?.isActive ?? true);
  const [file, setFile] = useState<File | null>(null);
  const [preview, setPreview] = useState<string | null>(
    banner?.imageUrl || null,
  );
  const [errors, setErrors] = useState<FormErrors>({});

  const submitting = isPending || isUpdatePending;

  function handleFileChange(e: React.ChangeEvent<HTMLInputElement>) {
    const selected = e.target.files?.[0];
    if (!selected) return;
    setFile(selected);
    const reader = new FileReader();
    reader.onloadend = () => setPreview(reader.result as string);
    reader.readAsDataURL(selected);
  }

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setErrors({});

    if (!isEdit && !file) {
      setErrors({ image: ["An image is required"] });
      return;
    }

    const formData = new FormData();
    formData.append("title", title);
    formData.append("subtitle", subtitle);
    formData.append("linkUrl", linkUrl);
    formData.append("isActive", String(isActive));
    if (file) formData.append("image", file);

    const result = isEdit
      ? await updateAsync({ id: banner!.id, formData })
      : await createAsync(formData);

    if (result.success) {
      toast.success(result.message);
      onSuccess();
    } else {
      setErrors(result.errors || {});
      toast.error(result.message);
    }
  }

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-5">
      {/* Image */}
      <div className="space-y-2">
        <Label className="text-sm font-medium text-color-secondary">
          Banner image <span className="text-red-400">*</span>
        </Label>
        <div
          className={cn(
            "relative rounded-xl border-2 border-dashed border-border-secondary p-4 transition-colors hover:border-color-tertiary",
            errors?.image && "border-red-500",
          )}
        >
          {preview ? (
            <div className="relative mx-auto w-full max-w-sm group">
              <Image
                src={preview}
                alt="Preview"
                width={640}
                height={280}
                className="aspect-[16/7] w-full rounded-lg object-cover shadow-md"
              />
              <div className="absolute inset-0 flex items-center justify-center rounded-lg bg-black/60 opacity-0 transition-opacity group-hover:opacity-100">
                <Button
                  type="button"
                  variant="destructive"
                  size="sm"
                  onClick={() => {
                    setFile(null);
                    setPreview(null);
                  }}
                >
                  <FiX className="mr-2 h-4 w-4" />
                  Remove
                </Button>
              </div>
            </div>
          ) : (
            <label className="flex cursor-pointer flex-col items-center justify-center gap-2 py-8 text-color-secondary">
              <FiImage size={28} />
              <span className="text-sm">Click to upload an image</span>
              <span className="inline-flex items-center gap-1 text-xs text-color-tertiary">
                <FiUpload size={12} /> Recommended 1920x800
              </span>
              <input
                type="file"
                accept="image/*"
                className="hidden"
                onChange={handleFileChange}
              />
            </label>
          )}
        </div>
        {errors?.image && (
          <p className="text-sm font-medium text-red-400">{errors.image[0]}</p>
        )}
      </div>

      {/* Title */}
      <div className="space-y-2">
        <Label htmlFor="banner-title" className="text-sm font-medium text-color-secondary">
          Title
        </Label>
        <Input
          id="banner-title"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          placeholder="New Season Arrivals"
          className={cn(errors?.title && "border-red-500 focus-visible:ring-red-500")}
        />
        {errors?.title && (
          <p className="text-sm font-medium text-red-400">{errors.title[0]}</p>
        )}
      </div>

      {/* Subtitle */}
      <div className="space-y-2">
        <Label htmlFor="banner-subtitle" className="text-sm font-medium text-color-secondary">
          Subtitle
        </Label>
        <Textarea
          id="banner-subtitle"
          value={subtitle}
          onChange={(e) => setSubtitle(e.target.value)}
          placeholder="Discover the collection"
          className={cn(
            "min-h-[80px] resize-none",
            errors?.subtitle && "border-red-500 focus-visible:ring-red-500",
          )}
        />
        {errors?.subtitle && (
          <p className="text-sm font-medium text-red-400">{errors.subtitle[0]}</p>
        )}
      </div>

      {/* Link URL */}
      <div className="space-y-2">
        <Label htmlFor="banner-link" className="text-sm font-medium text-color-secondary">
          Link URL
        </Label>
        <Input
          id="banner-link"
          value={linkUrl}
          onChange={(e) => setLinkUrl(e.target.value)}
          placeholder="/t-shirts"
          className={cn(errors?.linkUrl && "border-red-500 focus-visible:ring-red-500")}
        />
        {errors?.linkUrl && (
          <p className="text-sm font-medium text-red-400">{errors.linkUrl[0]}</p>
        )}
      </div>

      {/* Active toggle */}
      <div className="flex items-center justify-between gap-4 rounded-lg border border-border-primary bg-background-primary p-4">
        <div>
          <p className="text-sm font-medium text-white">Active</p>
          <p className="mt-0.5 text-xs text-color-tertiary">
            Inactive banners are hidden from the homepage slider.
          </p>
        </div>
        <button
          type="button"
          role="switch"
          aria-checked={isActive}
          onClick={() => setIsActive((prev) => !prev)}
          className={cn(
            "relative h-6 w-11 shrink-0 rounded-full transition-colors",
            isActive ? "bg-violet-600" : "bg-background-tertiary",
          )}
        >
          <span
            className={cn(
              "absolute top-0.5 h-5 w-5 rounded-full bg-white transition-transform",
              isActive ? "translate-x-[22px]" : "translate-x-0.5",
            )}
          />
        </button>
      </div>

      <div className="flex justify-end gap-3 pt-2">
        <Button type="button" variant="outline" onClick={onCancel} disabled={submitting}>
          Cancel
        </Button>
        <LoadingButton type="submit" loading={submitting}>
          {isEdit ? "Save changes" : "Create banner"}
        </LoadingButton>
      </div>
    </form>
  );
}
