"use client";

import { useState } from "react";
import Image from "next/image";
import { toast } from "sonner";
import {
  FiPlus,
  FiEdit2,
  FiTrash2,
  FiImage,
  FiArrowUp,
  FiArrowDown,
} from "react-icons/fi";

import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { BannerForm } from "./BannerForm";
import { useBannerMutation } from "@/hooks/admin/banners/useBannerMutation";
import type { Banner } from "@/lib/db/drizzle/schema";

export function BannersList({ banners }: { banners: Banner[] }) {
  const [items, setItems] = useState(
    [...banners].sort((a, b) => a.sortOrder - b.sortOrder),
  );
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingBanner, setEditingBanner] = useState<Banner | undefined>();
  const [deletingId, setDeletingId] = useState<number | null>(null);
  const [reorderingId, setReorderingId] = useState<number | null>(null);

  const { deleteBannerAsync, reorderAsync } = useBannerMutation();

  function openCreate() {
    setEditingBanner(undefined);
    setDialogOpen(true);
  }

  function openEdit(banner: Banner) {
    setEditingBanner(banner);
    setDialogOpen(true);
  }

  function handleFormSuccess() {
    setDialogOpen(false);
    window.location.reload();
  }

  async function handleDelete(banner: Banner) {
    if (!window.confirm(`Delete "${banner.title || "this banner"}"? This cannot be undone.`)) {
      return;
    }

    setDeletingId(banner.id);
    const ok = await deleteBannerAsync(banner.id);
    setDeletingId(null);

    if (ok) {
      setItems((prev) => prev.filter((b) => b.id !== banner.id));
      toast.success("Banner deleted");
    } else {
      toast.error("Failed to delete banner");
    }
  }

  async function handleMove(index: number, direction: -1 | 1) {
    const targetIndex = index + direction;
    if (targetIndex < 0 || targetIndex >= items.length) return;

    const reordered = [...items];
    const [moved] = reordered.splice(index, 1);
    reordered.splice(targetIndex, 0, moved);

    setItems(reordered);
    setReorderingId(moved.id);

    const ok = await reorderAsync(reordered.map((b) => b.id));
    setReorderingId(null);

    if (!ok) {
      toast.error("Failed to save order");
      setItems(items);
    }
  }

  return (
    <div className="flex flex-col gap-6">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex flex-col gap-1">
          <h1 className="text-2xl font-semibold tracking-tight text-white">
            Homepage Banners
          </h1>
          <p className="text-sm text-color-secondary">
            {items.length} banner{items.length === 1 ? "" : "s"} in the hero slider
          </p>
        </div>

        <Button onClick={openCreate} className="gap-2">
          <FiPlus size={16} />
          New banner
        </Button>
      </div>

      {items.length === 0 ? (
        <div className="flex flex-col items-center justify-center gap-3 rounded-lg border border-dashed border-border-primary py-16 text-center">
          <FiImage size={28} className="text-color-secondary" />
          <p className="text-sm text-color-secondary">
            No banners yet. Create your first one to power the homepage slider.
          </p>
        </div>
      ) : (
        <div className="flex flex-col gap-3">
          {items.map((banner, index) => (
            <div
              key={banner.id}
              className="flex flex-col gap-4 rounded-lg border border-border-primary bg-background-secondary p-4 sm:flex-row sm:items-center"
            >
              <div className="relative h-24 w-full shrink-0 overflow-hidden rounded-md sm:w-40">
                <Image
                  src={banner.imageUrl}
                  alt={banner.title || "Banner"}
                  fill
                  className="object-cover"
                />
              </div>

              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2">
                  <p className="truncate font-medium text-white">
                    {banner.title || "Untitled banner"}
                  </p>
                  <span
                    className={
                      banner.isActive
                        ? "rounded-full bg-violet-600/15 px-2 py-0.5 text-xs font-medium text-violet-400"
                        : "rounded-full bg-background-tertiary px-2 py-0.5 text-xs font-medium text-color-tertiary"
                    }
                  >
                    {banner.isActive ? "Active" : "Inactive"}
                  </span>
                </div>
                {banner.subtitle && (
                  <p className="mt-1 truncate text-sm text-color-secondary">
                    {banner.subtitle}
                  </p>
                )}
                {banner.linkUrl && (
                  <p className="mt-1 truncate text-xs text-color-tertiary">
                    {banner.linkUrl}
                  </p>
                )}
              </div>

              <div className="flex items-center gap-1.5 self-end sm:self-center">
                <Button
                  variant="outline"
                  size="icon"
                  disabled={index === 0 || reorderingId !== null}
                  onClick={() => handleMove(index, -1)}
                  aria-label="Move up"
                >
                  <FiArrowUp size={16} />
                </Button>
                <Button
                  variant="outline"
                  size="icon"
                  disabled={index === items.length - 1 || reorderingId !== null}
                  onClick={() => handleMove(index, 1)}
                  aria-label="Move down"
                >
                  <FiArrowDown size={16} />
                </Button>
                <Button
                  variant="outline"
                  size="icon"
                  onClick={() => openEdit(banner)}
                  aria-label="Edit banner"
                >
                  <FiEdit2 size={16} />
                </Button>
                <Button
                  variant="destructive"
                  size="icon"
                  disabled={deletingId === banner.id}
                  onClick={() => handleDelete(banner)}
                  aria-label="Delete banner"
                >
                  <FiTrash2 size={16} />
                </Button>
              </div>
            </div>
          ))}
        </div>
      )}

      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="max-h-[90vh] max-w-lg overflow-y-auto">
          <DialogHeader>
            <DialogTitle>
              {editingBanner ? "Edit banner" : "New banner"}
            </DialogTitle>
          </DialogHeader>
          <BannerForm
            banner={editingBanner}
            onSuccess={handleFormSuccess}
            onCancel={() => setDialogOpen(false)}
          />
        </DialogContent>
      </Dialog>
    </div>
  );
}
