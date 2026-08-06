"use client";

import { Suspense, useState } from "react";
import Link from "next/link";
import { LuMenu, LuLogOut, LuStore } from "react-icons/lu";

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

export function AdminShell({ children }: { children: React.ReactNode }) {
  const [mobileNavOpen, setMobileNavOpen] = useState(false);
  const { data: session, isPending } = useSession();
  const { signOut } = useAuthMutation();

  return (
    <div className="min-h-screen bg-background-primary">
      {/* Desktop sidebar */}
      <aside className="hidden lg:fixed lg:inset-y-0 lg:left-0 lg:z-30 lg:flex lg:w-64 lg:flex-col border-r border-border-primary bg-background-secondary">
        <div className="flex h-16 items-center gap-2 px-5 border-b border-border-primary">
          <span className="h-2 w-2 rounded-full bg-violet-500" />
          <span className="font-semibold tracking-tight text-white">
            Admin
          </span>
        </div>
        <div className="flex-1 overflow-y-auto py-4">
          <Suspense fallback={<NavSkeleton />}>
            <AdminNav />
          </Suspense>
        </div>
        <div className="border-t border-border-primary p-3">
          <Link
            href="/"
            className="flex items-center gap-3 rounded-md px-3 py-2.5 text-sm font-medium text-color-secondary hover:bg-background-tertiary hover:text-white transition-colors"
          >
            <LuStore size={18} />
            Back to store
          </Link>
        </div>
      </aside>

      {/* Topbar */}
      <header className="sticky top-0 z-20 flex h-16 items-center gap-3 border-b border-border-primary bg-background-secondary/95 backdrop-blur px-4 lg:pl-64">
        <Sheet open={mobileNavOpen} onOpenChange={setMobileNavOpen}>
          <SheetTrigger asChild>
            <button
              className="flex items-center justify-center rounded-md p-2 text-color-secondary hover:bg-background-tertiary hover:text-white transition-colors lg:hidden"
              aria-label="Open menu"
            >
              <LuMenu size={20} />
            </button>
          </SheetTrigger>
          <SheetContent side="left" className="w-72 p-0">
            <div className="flex h-full flex-col">
              <div className="flex h-16 items-center gap-2 px-5 border-b border-border-primary">
                <span className="h-2 w-2 rounded-full bg-violet-500" />
                <SheetTitle className="font-semibold tracking-tight text-white">
                  Admin
                </SheetTitle>
              </div>
              <div className="flex-1 overflow-y-auto py-4">
                <Suspense fallback={<NavSkeleton />}>
                  <AdminNav onNavigate={() => setMobileNavOpen(false)} />
                </Suspense>
              </div>
              <div className="border-t border-border-primary p-3">
                <Link
                  href="/"
                  onClick={() => setMobileNavOpen(false)}
                  className="flex items-center gap-3 rounded-md px-3 py-2.5 text-sm font-medium text-color-secondary hover:bg-background-tertiary hover:text-white transition-colors"
                >
                  <LuStore size={18} />
                  Back to store
                </Link>
              </div>
            </div>
          </SheetContent>
        </Sheet>

        <span className="font-semibold tracking-tight text-white lg:hidden">
          Admin
        </span>

        <div className="ml-auto flex items-center gap-3">
          {isPending ? (
            <Skeleton className="h-4 w-32" />
          ) : (
            <span className="hidden sm:inline text-sm text-color-secondary truncate max-w-[200px]">
              {session?.user?.email}
            </span>
          )}
          <button
            onClick={() => signOut.mutate()}
            aria-label="Log out"
            className="flex items-center gap-2 rounded-md px-3 py-2 text-sm font-medium text-color-secondary hover:bg-background-tertiary hover:text-white transition-colors"
          >
            <LuLogOut size={16} />
            <span className="hidden sm:inline">Log out</span>
          </button>
        </div>
      </header>

      {/* Content */}
      <main className="lg:pl-64">
        <div className="mx-auto max-w-6xl px-4 py-6 sm:px-6 lg:px-8">
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
        <Skeleton key={index} className="h-10 w-full rounded-md" />
      ))}
    </div>
  );
}
