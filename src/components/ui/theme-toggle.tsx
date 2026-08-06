"use client";

import { Moon, Sun } from "lucide-react";
import { useTheme } from "next-themes";

export function ThemeToggle({ className = "" }: { className?: string }) {
  const { resolvedTheme, setTheme } = useTheme();
  return <button type="button" aria-label="Toggle color theme" title="Toggle color theme" onClick={() => setTheme(resolvedTheme === "dark" ? "light" : "dark")} className={`relative inline-flex h-9 w-9 items-center justify-center rounded-md text-color-secondary transition hover:bg-background-tertiary hover:text-color-primary focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring ${className}`}><Sun className="h-4 w-4 rotate-0 scale-100 transition-all dark:-rotate-90 dark:scale-0" /><Moon className="absolute h-4 w-4 rotate-90 scale-0 transition-all dark:rotate-0 dark:scale-100" /></button>;
}
