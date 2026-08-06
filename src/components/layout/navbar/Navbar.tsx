"use client";

/** COMPONENTS */
import Link from "next/link";
import Image from "next/image";
import { UserMenu } from "./UserMenu";
import { SearchInput } from "./SearchInput";
import {
  Sheet,
  SheetContent,
  SheetTrigger,
  SheetClose,
  SheetTitle,
} from "@/components/ui/sheet";
import { WishlistLink } from "./WishlistLink";
import { CartLink } from "./CartLink";
import { Separator } from "@/components/ui/separator";
import { Skeleton } from "@/components/ui/skeleton";
import { ThemeToggle } from "@/components/ui/theme-toggle";
/** FUNCTIONALITY */
import { useSession } from "@/lib/auth/client";
import { useManager } from "@/hooks/useManager";
import dynamic from "next/dynamic";
import { useAuthMutation } from "@/hooks/auth/useAuthMutation";
/** ICONS */
import { Menu, User, ReceiptText, LogOut } from "lucide-react";

const EditProfile = dynamic(() => import("./EditProfile"), {
  ssr: false,
});

export const Navbar = ({ storeName, logoUrl }: { storeName: string; logoUrl: string | null }) => {
  const { data: session, isPending } = useSession();

  const editProfileManager = useManager();
  const { signOut } = useAuthMutation();

  return (
    <>
      <header className="sticky top-0 z-40 flex w-full items-center justify-between gap-3 border-b border-border/80 bg-background/90 px-3.5 py-3 backdrop-blur-lg xs:px-6 sm:px-8">
        <Link href="/" className="order-2 shrink-0 text-lg font-black text-foreground lg:order-none">{logoUrl ? <Image src={logoUrl} alt={storeName} width={120} height={40} className="h-10 w-auto object-contain" priority/> : storeName}</Link>
        {/* Mobile Menu Trigger */}
        <Sheet>
          <SheetTrigger asChild>
            <button className="flex px-4 py-2 lg:hidden hover:opacity-75 transition-opacity">
              <Menu size={22} />
            </button>
          </SheetTrigger>

          <SheetContent side="right" className="w-full p-0 sm:w-80">
            <div className="flex flex-col h-full">
              {/* Header */}
              <div className="px-6 py-4 border-b border-border-primary">
                <SheetTitle className="text-lg font-semibold">القائمة</SheetTitle>
              </div>

              {/* Navigation Links */}
              <nav className="flex-1 overflow-y-auto">
                <ul className="flex flex-col gap-2 p-4">
                  {/* Separator */}
                  {(session?.user || isPending) && (
                    <Separator className="my-2" />
                  )}

                  {/* User Links Skeleton */}
                  {isPending && (
                    <>
                      <li>
                        <div className="flex items-center px-4 py-2">
                          <Skeleton className="h-4 w-4 mr-2 rounded-full" />
                          <Skeleton className="h-4 w-24" />
                        </div>
                      </li>
                      <li>
                        <div className="flex items-center px-4 py-2">
                          <Skeleton className="h-4 w-4 mr-2 rounded-full" />
                          <Skeleton className="h-4 w-20" />
                        </div>
                      </li>
                      <li>
                        <Separator className="my-2" />
                      </li>
                      <li>
                        <div className="flex items-center px-4 py-2">
                          <Skeleton className="h-4 w-4 mr-2 rounded-full" />
                          <Skeleton className="h-4 w-16" />
                        </div>
                      </li>
                    </>
                  )}

                  {/* User Links */}
                  {session?.user && !isPending && (
                    <>
                      <li>
                        <SheetClose asChild>
                          <Link
                            href="/orders"
                            className="flex items-center px-4 py-2 rounded-md hover:bg-color-secondary transition-colors text-sm font-medium"
                          >
                            <ReceiptText className="ms-2" size={16} />
                            <span>طلباتي</span>
                          </Link>
                        </SheetClose>
                      </li>

                      <li>
                        <SheetClose asChild>
                          <button
                            onClick={editProfileManager.open}
                            className="flex items-center w-full px-4 py-2 rounded-md hover:bg-color-secondary transition-colors text-sm font-medium"
                          >
                            <User className="ms-2" size={16} />
                            <span>الملف الشخصي</span>
                          </button>
                        </SheetClose>
                      </li>

                      <li>
                        <Separator className="my-2" />
                      </li>

                      <li>
                        <button
                          onClick={() => signOut.mutate()}
                          className="flex gap-2 items-center w-full px-4 py-2 rounded-md hover:bg-color-secondary transition-colors text-sm font-medium"
                        >
                          <LogOut size={16} />
                          <span>تسجيل الخروج</span>
                        </button>
                      </li>
                    </>
                  )}

                  {/* Login Link for non-authenticated users */}
                  {!session?.user && !isPending && (
                    <li>
                      <SheetClose asChild>
                        <Link
                          href="/login"
                          className="flex items-center px-4 py-2 rounded-md hover:bg-color-secondary transition-colors text-sm font-medium"
                        >
                            تسجيل الدخول
                        </Link>
                      </SheetClose>
                    </li>
                  )}
                </ul>
              </nav>
            </div>
          </SheetContent>
        </Sheet>

        {/* Desktop Navigation */}
        <ul className="justify-between hidden gap-2 text-sm lg:flex">
          {isPending ? (
            <li className="items-center justify-center hidden lg:flex">
              <Skeleton className="w-24 h-9 rounded-md" />
            </li>
          ) : session?.user ? (
            <li className="items-center justify-center hidden lg:flex">
              <UserMenu manager={editProfileManager} />
            </li>
          ) : (
            <li className="flex items-center justify-center">
              <Link
                href="/login"
                className="flex h-10 items-center justify-center rounded-lg px-3 text-sm font-medium text-muted-foreground transition hover:bg-muted hover:text-foreground"
              >
                تسجيل الدخول
              </Link>
            </li>
          )}
        </ul>

        {/* Search Input */}
        <SearchInput />

        {/* Cart and Wishlist Buttons */}
        <ul className="flex gap-2">
          <li className="flex items-center justify-center"><ThemeToggle /></li>
          <li className="flex items-center justify-center">
            <CartLink />
          </li>
          <li className="flex items-center justify-center">
            <WishlistLink />
          </li>
        </ul>
      </header>

      <EditProfile manager={editProfileManager} />
    </>
  );
};
