"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { toast } from "sonner";
import { FiPlus, FiEdit2, FiTrash2, FiSearch, FiPackage } from "react-icons/fi";

import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { useProductMutation } from "@/hooks/product/mutations/useProductMutation";
import { formatPriceFromEuros } from "@/utils/formatters";
import { capitalizeFirstLetter } from "@/utils/capitalizeFirstLetter";
import type { ProductWithVariants, Collection } from "@/lib/db/drizzle/schema";
import {
  AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent,
  AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle,
} from "@/components/ui/alert-dialog";

export function ProductsList({
  products,
  categories,
}: {
  products: ProductWithVariants[];
  categories: Collection[];
}) {
  const [items, setItems] = useState(products);
  const [search, setSearch] = useState("");
  const [category, setCategory] = useState<string>("all");
  const [deletingId, setDeletingId] = useState<number | null>(null);
  const [productToDelete, setProductToDelete] = useState<ProductWithVariants | null>(null);

  const { deleteProductAsync } = useProductMutation();

  const filtered = useMemo(() => {
    const query = search.trim().toLowerCase();
    return items.filter((product) => {
      const matchesQuery = !query || product.name.toLowerCase().includes(query);
      const matchesCategory = category === "all" || product.category === category;
      return matchesQuery && matchesCategory;
    });
  }, [items, search, category]);

  async function handleDelete(product: ProductWithVariants) {
    setDeletingId(product.id);
    const ok = await deleteProductAsync(product.id);
    setDeletingId(null);

    if (ok) {
      setItems((prev) => prev.filter((p) => p.id !== product.id));
      toast.success("Product deleted");
    } else {
      toast.error("Failed to delete product");
    }
  }

  return (
    <div className="flex flex-col gap-6">
      <div className="flex flex-col gap-1">
        <h1 className="text-2xl font-semibold tracking-tight text-white">
          Products
        </h1>
        <p className="text-sm text-color-secondary">
          {items.length} product{items.length === 1 ? "" : "s"} in your catalog
        </p>
      </div>

      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex flex-1 flex-col gap-3 sm:flex-row sm:items-center">
          <div className="relative flex-1 sm:max-w-xs">
            <FiSearch
              size={16}
              className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-color-secondary"
            />
            <Input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search products..."
              className="pl-9"
            />
          </div>

          <Select value={category} onValueChange={setCategory}>
            <SelectTrigger className="sm:w-48">
              <SelectValue placeholder="Category" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All categories</SelectItem>
              {categories.map((cat) => (
                <SelectItem key={cat.id} value={cat.slug}>
                  {cat.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <Button asChild className="gap-2">
          <Link href="/admin/products/create">
            <FiPlus size={16} />
            New product
          </Link>
        </Button>
      </div>

      {filtered.length === 0 ? (
        <div className="flex flex-col items-center justify-center gap-3 rounded-lg border border-dashed border-border-primary py-16 text-center">
          <FiPackage size={28} className="text-color-secondary" />
          <p className="text-sm text-color-secondary">
            {items.length === 0
              ? "No products yet. Create your first one."
              : "No products match your search."}
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {filtered.map((product) => (
            <div
              key={product.id}
              className="group flex flex-col overflow-hidden rounded-lg border border-border-primary bg-background-secondary"
            >
              <div className="relative aspect-square w-full bg-background-tertiary">
                <Image
                  src={product.img}
                  alt={product.name}
                  fill
                  sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
                  className="object-cover"
                />
              </div>

              <div className="flex flex-1 flex-col gap-2 p-4">
                <div className="flex items-start justify-between gap-2">
                  <h3 className="line-clamp-1 text-sm font-medium text-white">
                    {product.name}
                  </h3>
                  <span className="shrink-0 rounded-full border border-border-primary px-2 py-0.5 text-xs text-color-secondary">
                    {capitalizeFirstLetter(product.category)}
                  </span>
                </div>

                <p className="text-sm font-semibold text-violet-400">
                  {formatPriceFromEuros(product.price)}
                </p>

                <p className="text-xs text-color-secondary">
                  {product.variants.length} variant
                  {product.variants.length === 1 ? "" : "s"}
                </p>

                <div className="mt-auto flex items-center gap-2 pt-2">
                  <Button
                    asChild
                    variant="outline"
                    size="sm"
                    className="flex-1 gap-2"
                  >
                    <Link href={`/admin/products/${product.id}/edit`}>
                      <FiEdit2 size={14} />
                      Edit
                    </Link>
                  </Button>
                  <Button
                    variant="destructive"
                    size="sm"
                    className="gap-2"
                    disabled={deletingId === product.id}
                    onClick={() => setProductToDelete(product)}
                  >
                    <FiTrash2 size={14} />
                  </Button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
      <AlertDialog open={Boolean(productToDelete)} onOpenChange={(open) => !open && setProductToDelete(null)}>
        <AlertDialogContent className="fixed left-1/2 top-1/2 z-50 w-[calc(100%-2rem)] max-w-md -translate-x-1/2 -translate-y-1/2 rounded-2xl border border-slate-200 bg-white p-6 shadow-xl dark:border-slate-800 dark:bg-slate-950">
          <AlertDialogHeader><AlertDialogTitle className="text-lg font-semibold text-slate-950 dark:text-white">Delete product?</AlertDialogTitle><AlertDialogDescription className="text-sm text-slate-500 dark:text-slate-400">This will permanently remove {productToDelete?.name}. This action cannot be undone.</AlertDialogDescription></AlertDialogHeader>
          <AlertDialogFooter><AlertDialogCancel className="admin-icon-button px-4" onClick={() => setProductToDelete(null)}>Cancel</AlertDialogCancel><AlertDialogAction className="rounded-xl bg-red-600 px-4 py-2 text-sm font-semibold text-white" onClick={() => productToDelete && handleDelete(productToDelete)}>Delete</AlertDialogAction></AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
