"use client";

import { Suspense, useState } from "react";
import Link from "next/link";
import { Menu, LogOut, Store, Search } from "lucide-react";

import { AdminNav } from "./AdminNav";
import {
  Sheet,
  SheetContent,
  SheetTrigger,
  SheetTitle,
} from "@/components/ui/sheet";
import { Skeleton } from "@/components/ui/skeleton";
import { useSession } from "@/lib/auth/client";
import { useAuthMutation } from "@/hooks/auth/useAuthMutation";
import { AdminPreferences, LocaleToggle, ThemeToggle, useAdminLocale } from "./AdminPreferences";
import { AdminBreadcrumb } from "./AdminBreadcrumb";

export function AdminShell({ children }: { children: React.ReactNode }) {
  return <AdminPreferences><AdminShellContent>{children}</AdminShellContent></AdminPreferences>;
}

function AdminShellContent({ children }: { children: React.ReactNode }) {
  const [mobileNavOpen, setMobileNavOpen] = useState(false);
  const { data: session, isPending } = useSession();
  const { signOut } = useAuthMutation();
  const { locale, t } = useAdminLocale();
  const isRtl = locale === "ar";

  return (
    <div className="admin-shell min-h-screen overflow-x-hidden bg-background text-foreground" dir={locale === "ar" ? "rtl" : "ltr"}>
      {/* Desktop sidebar */}
      <aside className="hidden border-e border-border bg-card/85 lg:fixed lg:inset-y-0 lg:start-0 lg:z-30 lg:flex lg:w-72 lg:flex-col">
        <div className="flex h-20 items-center gap-3 px-6 border-b border-border">
          <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-primary text-sm font-black text-primary-foreground">S</span>
          <span className="font-semibold tracking-tight text-foreground">
            {t.admin}
          </span>
        </div>
        <div className="flex-1 overflow-y-auto py-4">
          <Suspense fallback={<NavSkeleton />}>
            <AdminNav />
          </Suspense>
        </div>
        <div className="border-t border-border p-3">
          <Link
            href="/"
            className="flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
          >
            <Store size={18} />
            {t.backToStore}
          </Link>
        </div>
      </aside>

      {/* Topbar */}
      <header className="sticky top-0 z-20 flex h-20 min-w-0 items-center gap-3 border-b border-border bg-card/80 px-4 backdrop-blur-xl lg:ps-80 lg:pe-8">
        <Sheet open={mobileNavOpen} onOpenChange={setMobileNavOpen}>
          <SheetTrigger asChild>
            <button
              className="admin-icon-button lg:hidden"
              aria-label="Open menu"
            >
              <Menu size={20} />
            </button>
          </SheetTrigger>
          <SheetContent side={isRtl ? "right" : "left"} dir={locale} className="w-72 border-border bg-card p-0">
            <div className="flex h-full flex-col">
              <div className="flex h-20 items-center gap-3 px-6 border-b border-border">
                <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-primary text-sm font-black text-primary-foreground">S</span>
                <SheetTitle className="font-semibold tracking-tight text-foreground">
                  {t.admin}
                </SheetTitle>
              </div>
              <div className="flex-1 overflow-y-auto py-4">
                <Suspense fallback={<NavSkeleton />}>
                  <AdminNav onNavigate={() => setMobileNavOpen(false)} />
                </Suspense>
              </div>
              <div className="border-t border-border p-3">
                <Link
                  href="/"
                  onClick={() => setMobileNavOpen(false)}
                  className="flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium text-muted-foreground"
                >
                  <Store size={18} />
                  {t.backToStore}
                </Link>
              </div>
            </div>
          </SheetContent>
        </Sheet>

        <span className="font-semibold tracking-tight text-foreground lg:hidden">
          {t.admin}
        </span>
        <Suspense fallback={null}>
          <AdminBreadcrumb />
        </Suspense>

        <div className="ms-auto flex min-w-0 shrink-0 items-center gap-1.5 sm:gap-2">
          <div className="hidden items-center gap-2 rounded-xl border border-border px-3 py-2 text-sm text-muted-foreground xl:flex"><Search className="h-4 w-4" /><span>{t.search}…</span><kbd className="ms-8 rounded border border-border px-1.5 text-[10px]">⌘K</kbd></div>
          <LocaleToggle />
          <ThemeToggle />
          {isPending ? (
            <Skeleton className="h-4 w-32" />
          ) : (
            <span className="hidden sm:inline text-sm text-muted-foreground truncate max-w-[200px]">
              {session?.user?.email}
            </span>
          )}
          <button
            onClick={() => signOut.mutate()}
            aria-label="Log out"
            className="admin-icon-button gap-2 px-3"
          >
            <LogOut size={16} />
            <span className="hidden sm:inline">{t.signOut}</span>
          </button>
        </div>
      </header>

      {/* Content */}
      <main className="min-w-0 lg:ps-72">
        <div className="mx-auto max-w-7xl px-4 py-6 sm:px-6 lg:px-8 lg:py-8">
          {children}
        </div>
      </main>
    </div>
  );
}

function NavSkeleton() {
  return (
    <div className="flex flex-col gap-1 px-3">
      {Array.from({ length: 5 }, (_, index) => (
        <Skeleton key={index} className="h-10 w-full rounded-xl" />
      ))}
    </div>
  );
}
