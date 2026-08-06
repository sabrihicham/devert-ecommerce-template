"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { toast } from "sonner";
import { FiPlus, FiEdit2, FiTrash2, FiSearch, FiLayers } from "react-icons/fi";

import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { CollectionForm } from "./CollectionForm";
import { useCollectionMutation } from "@/hooks/admin/collections/useCollectionMutation";
import type { Collection } from "@/lib/db/drizzle/schema";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from "@/components/ui/alert-dialog";

export function CollectionsList({
  collections,
}: {
  collections: Collection[];
}) {
  const [items, setItems] = useState(collections);
  const [search, setSearch] = useState("");
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingCollection, setEditingCollection] = useState<
    Collection | undefined
  >();
  const [deletingId, setDeletingId] = useState<number | null>(null);
  const [collectionToDelete, setCollectionToDelete] = useState<Collection | null>(null);

  const { deleteCollectionAsync } = useCollectionMutation();

  const filtered = useMemo(() => {
    const query = search.trim().toLowerCase();
    if (!query) return items;
    return items.filter(
      (collection) =>
        collection.name.toLowerCase().includes(query) ||
        collection.slug.toLowerCase().includes(query),
    );
  }, [items, search]);

  function openCreate() {
    setEditingCollection(undefined);
    setDialogOpen(true);
  }

  function openEdit(collection: Collection) {
    setEditingCollection(collection);
    setDialogOpen(true);
  }

  function handleFormSuccess() {
    setDialogOpen(false);
    window.location.reload();
  }

  async function handleDelete(collection: Collection) {
    setDeletingId(collection.id);
    const result = await deleteCollectionAsync(collection.id);
    setDeletingId(null);

    if (result.success) {
      setItems((prev) => prev.filter((c) => c.id !== collection.id));
      toast.success(result.message);
    } else {
      toast.error(result.message);
    }
  }

  return (
    <div className="flex flex-col gap-6">
      <div className="flex flex-col gap-1">
        <h1 className="text-2xl font-semibold tracking-tight text-white">
          Categories
        </h1>
        <p className="text-sm text-color-secondary">
          {items.length} categor{items.length === 1 ? "y" : "ies"} used to
          categorize your products
        </p>
      </div>

      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div className="relative flex-1 sm:max-w-xs">
          <FiSearch
            size={16}
            className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-color-secondary"
          />
          <Input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search categories..."
            className="pl-9"
          />
        </div>

        <Button onClick={openCreate} className="gap-2">
          <FiPlus size={16} />
          New category
        </Button>
      </div>

      {filtered.length === 0 ? (
        <div className="flex flex-col items-center justify-center gap-3 rounded-lg border border-dashed border-border-primary py-16 text-center">
          <FiLayers size={28} className="text-color-secondary" />
          <p className="text-sm text-color-secondary">
            {items.length === 0
              ? "No categories yet. Create your first one."
              : "No categories match your search."}
          </p>
        </div>
      ) : (
        <div className="flex flex-col gap-3">
          {filtered.map((collection) => (
            <div
              key={collection.id}
              className="flex flex-col gap-3 rounded-lg border border-border-primary bg-background-secondary p-4 sm:flex-row sm:items-center sm:justify-between"
            >
              <div className="min-w-0">
                <p className="truncate font-medium text-white">
                  {collection.name}
                </p>
                <Link
                  href={`/${collection.slug}`}
                  target="_blank"
                  className="mt-1 inline-block truncate font-mono text-xs text-color-tertiary hover:text-violet-400 hover:underline"
                >
                  /{collection.slug}
                </Link>
              </div>

              <div className="flex items-center gap-1.5 self-end sm:self-center">
                <Button
                  variant="outline"
                  size="icon"
                  onClick={() => openEdit(collection)}
                  aria-label="Edit collection"
                >
                  <FiEdit2 size={16} />
                </Button>
                <Button
                  variant="destructive"
                  size="icon"
                  disabled={deletingId === collection.id}
                  onClick={() => setCollectionToDelete(collection)}
                  aria-label="Delete collection"
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
              {editingCollection ? "Edit category" : "New category"}
            </DialogTitle>
          </DialogHeader>
          <CollectionForm
            collection={editingCollection}
            onSuccess={handleFormSuccess}
            onCancel={() => setDialogOpen(false)}
          />
        </DialogContent>
      </Dialog>
      <AlertDialog open={Boolean(collectionToDelete)} onOpenChange={(open) => !open && setCollectionToDelete(null)}><AlertDialogContent className="fixed left-1/2 top-1/2 z-50 w-[calc(100%-2rem)] max-w-md -translate-x-1/2 -translate-y-1/2 rounded-2xl border border-slate-200 bg-white p-6 shadow-xl dark:border-slate-800 dark:bg-slate-950"><AlertDialogHeader><AlertDialogTitle className="text-lg font-semibold text-slate-950 dark:text-white">Delete collection?</AlertDialogTitle><AlertDialogDescription className="text-sm text-slate-500">This will permanently remove {collectionToDelete?.name}.</AlertDialogDescription></AlertDialogHeader><AlertDialogFooter><AlertDialogCancel className="admin-icon-button px-4">Cancel</AlertDialogCancel><AlertDialogAction className="rounded-xl bg-red-600 px-4 py-2 text-sm font-semibold text-white" onClick={() => collectionToDelete && handleDelete(collectionToDelete)}>Delete</AlertDialogAction></AlertDialogFooter></AlertDialogContent></AlertDialog>
    </div>
  );
}
