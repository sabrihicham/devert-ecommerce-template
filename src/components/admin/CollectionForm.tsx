"use client";

import { useState, type FormEvent } from "react";
import Image from "next/image";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import LoadingButton from "@/components/ui/loadingButton";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { cn } from "@/lib/utils";
import { useCollectionMutation } from "@/hooks/admin/collections/useCollectionMutation";
import type { Collection } from "@/lib/db/drizzle/schema";

interface CollectionFormProps {
  collection?: Collection;
  onSuccess: () => void;
  onCancel: () => void;
}

interface FormErrors {
  [key: string]: string[] | undefined;
}

function slugify(value: string) {
  return value
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

export function CollectionForm({
  collection,
  onSuccess,
  onCancel,
}: CollectionFormProps) {
  const isEdit = Boolean(collection);
  const { createAsync, updateAsync, isPending, isUpdatePending } =
    useCollectionMutation();

  const [name, setName] = useState(collection?.name || "");
  const [nameFr, setNameFr] = useState(collection?.nameFr || collection?.name || "");
  const [description, setDescription] = useState(collection?.description || "");
  const [descriptionFr, setDescriptionFr] = useState(collection?.descriptionFr || collection?.description || "");
  const [slug, setSlug] = useState(collection?.slug || "");
  const [slugTouched, setSlugTouched] = useState(isEdit);
  const [errors, setErrors] = useState<FormErrors>({});
  const [image, setImage] = useState<File | null>(null);
  const [preview, setPreview] = useState(collection?.imageUrl || null);

  const submitting = isPending || isUpdatePending;

  function handleNameChange(value: string) {
    setName(value);
    if (!slugTouched) {
      setSlug(slugify(value));
    }
  }

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setErrors({});

    const data = new FormData();
    data.set("name", name.trim()); data.set("nameFr", nameFr.trim()); data.set("description", description.trim()); data.set("descriptionFr", descriptionFr.trim()); data.set("slug", slugify(slug));
    if (image) data.set("image", image);

    const result = isEdit
      ? await updateAsync({ id: collection!.id, data })
      : await createAsync(data);

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
      <div className="space-y-2">
        <Label
          htmlFor="collection-name"
          className="text-sm font-medium text-color-secondary"
        >
          Category name <span className="text-red-400">*</span>
        </Label>
        <Input
          id="collection-name"
          value={name}
          onChange={(e) => handleNameChange(e.target.value)}
          placeholder="Hoodies"
          className={cn(
            errors?.name && "border-red-500 focus-visible:ring-red-500",
          )}
        />
        {errors?.name && (
          <p className="text-sm font-medium text-red-400">{errors.name[0]}</p>
        )}
      </div>

      <div dir="ltr" className="space-y-2 rounded-xl border border-border bg-muted/30 p-4">
        <Label htmlFor="collection-name-fr">Nom de la catégorie *</Label>
        <Input id="collection-name-fr" value={nameFr} onChange={(event) => setNameFr(event.target.value)} placeholder="Protéines" />
        <Label htmlFor="collection-description-fr">Description française</Label>
        <Input id="collection-description-fr" value={descriptionFr} onChange={(event) => setDescriptionFr(event.target.value)} placeholder="Découvrez nos protéines" />
      </div>

      <div className="space-y-2">
        <Label htmlFor="collection-description">وصف الفئة</Label>
        <Input id="collection-description" value={description} onChange={(event) => setDescription(event.target.value)} placeholder="وصف مختصر للفئة" />
      </div>

      <div className="space-y-2">
        <Label htmlFor="category-image" className="text-sm font-medium text-color-secondary">Category image</Label>
        <div className="flex items-center gap-4 rounded-xl border border-dashed border-border p-3">
          {preview ? <Image src={preview} alt="Category preview" width={96} height={64} className="h-16 w-24 rounded-lg object-cover"/> : <div className="grid h-16 w-24 place-items-center rounded-lg bg-muted text-xs text-muted-foreground">No image</div>}
          <Input id="category-image" type="file" accept="image/*" className="max-w-xs" onChange={(event) => { const file = event.target.files?.[0]; if (file) { setImage(file); setPreview(URL.createObjectURL(file)); } }} />
        </div>
        <p className="text-xs text-muted-foreground">Upload a landscape image for the storefront category card.</p>
      </div>

      <div className="space-y-2">
        <Label
          htmlFor="collection-slug"
          className="text-sm font-medium text-color-secondary"
        >
          Slug <span className="text-red-400">*</span>
        </Label>
        <Input
          id="collection-slug"
          value={slug}
          onChange={(e) => {
            setSlugTouched(true);
            setSlug(e.target.value);
          }}
          placeholder="hoodies"
          className={cn(
            "font-mono text-sm",
            errors?.slug && "border-red-500 focus-visible:ring-red-500",
          )}
        />
        <p className="text-xs text-color-tertiary">
          Used in the storefront URL: /{slugify(slug) || "slug"}
        </p>
        {errors?.slug && (
          <p className="text-sm font-medium text-red-400">{errors.slug[0]}</p>
        )}
      </div>

      <div className="flex justify-end gap-3 pt-2">
        <Button
          type="button"
          variant="outline"
          onClick={onCancel}
          disabled={submitting}
        >
          Cancel
        </Button>
        <LoadingButton type="submit" loading={submitting}>
          {isEdit ? "Save category" : "Create category"}
        </LoadingButton>
      </div>
    </form>
  );
}
