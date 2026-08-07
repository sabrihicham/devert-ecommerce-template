"use client";

import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { LuLayoutGrid, LuPanelTop } from "react-icons/lu";

import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { cn } from "@/lib/utils";
import type { CatalogSort } from "./catalog";
import { useTranslations } from "@/providers/LocaleProvider";

interface CatalogToolbarProps {
  count: number;
  sort: CatalogSort;
  density: "comfortable" | "compact";
  onDensityChange: (density: "comfortable" | "compact") => void;
}

export function CatalogToolbar({
  count,
  sort,
  density,
  onDensityChange,
}: CatalogToolbarProps) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const t = useTranslations();

  const updateSort = (nextSort: string) => {
    const params = new URLSearchParams(searchParams.toString());
    if (nextSort === "newest") params.delete("sort");
    else params.set("sort", nextSort);
    router.replace(params.size ? `${pathname}?${params}` : pathname, {
      scroll: false,
    });
  };

  return (
    <div className="flex flex-col gap-3 border-y border-border-primary py-3.5 sm:flex-row sm:items-center sm:justify-between">
      <p className="text-sm text-color-secondary" aria-live="polite">
        {count} {count === 1 ? t.catalog.product : t.catalog.products}
      </p>

      <div className="flex items-center justify-between gap-2 sm:justify-end">
        <div className="flex rounded-md border border-border-primary bg-background-secondary p-1">
          <Button
            type="button"
            variant="ghost"
            size="xs"
            aria-label={t.catalog.gridComfortable}
            aria-pressed={density === "comfortable"}
            onClick={() => onDensityChange("comfortable")}
            className={cn(
              "h-8 w-8 p-0 text-color-secondary",
              density === "comfortable" && "bg-background-tertiary text-white",
            )}
          >
            <LuLayoutGrid size={16} />
          </Button>
          <Button
            type="button"
            variant="ghost"
            size="xs"
            aria-label={t.catalog.gridCompact}
            aria-pressed={density === "compact"}
            onClick={() => onDensityChange("compact")}
            className={cn(
              "h-8 w-8 p-0 text-color-secondary",
              density === "compact" && "bg-background-tertiary text-white",
            )}
          >
            <LuPanelTop size={16} />
          </Button>
        </div>

        <Select value={sort} onValueChange={updateSort}>
          <SelectTrigger aria-label={t.catalog.newest} className="h-10 w-[158px] bg-background-secondary">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="newest">{t.catalog.newest}</SelectItem>
            <SelectItem value="price-asc">{t.catalog.priceAsc}</SelectItem>
            <SelectItem value="price-desc">{t.catalog.priceDesc}</SelectItem>
            <SelectItem value="name-asc">{t.catalog.nameAsc}</SelectItem>
          </SelectContent>
        </Select>
      </div>
    </div>
  );
}
