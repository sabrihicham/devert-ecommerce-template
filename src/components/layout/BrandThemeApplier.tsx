"use client";

import { useEffect } from "react";
import type { BrandTheme } from "@/lib/db/drizzle/schema";

export function BrandThemeApplier({ brandTheme }: { brandTheme: BrandTheme }) {
  useEffect(() => {
    document.documentElement.dataset.brand = brandTheme;
    window.localStorage.setItem("store-brand-theme", brandTheme);
  }, [brandTheme]);

  return null;
}
