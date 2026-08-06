"use client";

import { useState, type FormEvent } from "react";
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
  const [slug, setSlug] = useState(collection?.slug || "");
  const [slugTouched, setSlugTouched] = useState(isEdit);
  const [errors, setErrors] = useState<FormErrors>({});

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

    const data = { name: name.trim(), slug: slugify(slug) };

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
          Name <span className="text-red-400">*</span>
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
          {isEdit ? "Save changes" : "Create collection"}
        </LoadingButton>
      </div>
    </form>
  );
}
