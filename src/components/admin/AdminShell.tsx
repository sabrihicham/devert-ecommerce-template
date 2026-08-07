"use client";

import { Suspense, useState } from "react";
import Link from "next/link";
import { Menu, LogOut, Store } from "lucide-react";

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
  return <AdminPreferences><Suspense fallback={<AdminShellSkeleton /> }><AdminShellContent>{children}</AdminShellContent></Suspense></AdminPreferences>;
}

function AdminShellSkeleton() {
  return <div className="min-h-screen bg-background" />;
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
      <aside className="hidden border-e border-border bg-card/90 shadow-sm lg:fixed lg:inset-y-0 lg:start-0 lg:z-30 lg:flex lg:w-72 lg:flex-col">
        <div className="flex h-20 shrink-0 items-center gap-3 border-b border-border px-5">
          <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-primary text-sm font-black text-primary-foreground">S</span>
          <div className="min-w-0">
            <span className="block truncate font-semibold tracking-tight text-foreground">{t.admin}</span>
            <span className="block text-xs text-muted-foreground">Devert Nutrition</span>
          </div>
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
      <header className="sticky top-0 z-20 flex min-h-16 min-w-0 items-center gap-3 border-b border-border bg-card/85 px-3 py-2.5 backdrop-blur-xl sm:px-4 lg:ps-80 lg:pe-8">
        <div className="flex min-w-0 flex-1 items-center gap-2.5">
          <Sheet open={mobileNavOpen} onOpenChange={setMobileNavOpen}>
            <SheetTrigger asChild>
              <button className="admin-icon-button h-10 w-10 shrink-0 lg:hidden" aria-label={locale === "ar" ? "فتح القائمة" : "Ouvrir le menu"}>
                <Menu size={19} />
              </button>
            </SheetTrigger>
            <SheetContent side={isRtl ? "right" : "left"} dir={locale} className="w-[min(21rem,calc(100vw-1rem))] border-border bg-card p-0">
            <div className="flex h-full flex-col">
              <div className="flex h-20 items-center gap-3 border-b border-border px-5">
                <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-primary text-sm font-black text-primary-foreground">S</span>
                <div className="min-w-0"><SheetTitle className="truncate font-semibold tracking-tight text-foreground">{t.admin}</SheetTitle><p className="text-xs text-muted-foreground">Devert Nutrition</p></div>
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

          <div className="min-w-0 flex-1 lg:hidden">
            <span className="block truncate text-sm font-semibold tracking-tight text-foreground">{t.admin}</span>
            <Suspense fallback={null}><AdminBreadcrumb /></Suspense>
          </div>
          <div className="hidden min-w-0 lg:block"><Suspense fallback={null}><AdminBreadcrumb /></Suspense></div>
        </div>

        <div className="flex shrink-0 items-center gap-1 sm:gap-2">
          <LocaleToggle />
          <ThemeToggle />
          {isPending ? (
            <Skeleton className="hidden h-9 w-28 rounded-xl sm:block" />
          ) : (
            <span className="hidden max-w-44 truncate rounded-xl border border-border bg-card px-3 py-2 text-xs text-muted-foreground md:inline-block">
              {session?.user?.email}
            </span>
          )}
          <button
            onClick={() => signOut.mutate()}
            aria-label={t.signOut}
            className="admin-icon-button h-10 gap-2 px-2.5 sm:px-3"
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
