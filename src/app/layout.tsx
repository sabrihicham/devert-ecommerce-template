import type { Metadata } from "next";
import { Cairo, Montserrat } from "next/font/google";
import { Analytics } from "@vercel/analytics/react";
import { SpeedInsights } from "@vercel/speed-insights/next";
import { Toaster } from "sonner";
import { Suspense } from "react";
import Script from "next/script";

import { StoreChrome } from "@/components/layout/StoreChrome";
import { Providers } from "@/providers";
import "@/styles/globals.css";
import "@/styles/colors.css";
import "@/styles/animations.css";

const montserrat = Montserrat({
  subsets: ["latin"],
  variable: "--font-montserrat",
  display: "swap",
  weight: ["400", "500", "600", "700", "800"],
});

const cairo = Cairo({
  subsets: ["arabic", "latin"],
  variable: "--font-cairo",
  display: "swap",
  weight: ["400", "500", "600", "700", "800"],
});

const defaultDescription =
  "Modern ecommerce template built with Next.js 16, React 19, Drizzle, Better Auth, Supabase, and cash-on-delivery checkout.";

function getMetadataBase() {
  try {
    return process.env.NEXT_PUBLIC_APP_URL
      ? new URL(process.env.NEXT_PUBLIC_APP_URL)
      : undefined;
  } catch {
    return undefined;
  }
}

export const metadata: Metadata = {
  title: "Ecommerce Template",
  description: defaultDescription,
  metadataBase: getMetadataBase(),
  openGraph: {
    title: "Ecommerce Template",
    description: defaultDescription,
    type: "website",
    siteName: "Ecommerce Template",
  },
  twitter: {
    card: "summary_large_image",
    title: "Ecommerce Template",
    description: defaultDescription,
  },
};

export default async function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="ar" dir="rtl" suppressHydrationWarning>
      <body className={`${montserrat.variable} ${cairo.variable}`}>
        <Script id="restore-store-brand" strategy="beforeInteractive">{`
            try {
              var theme = localStorage.getItem("theme");
              var dark = theme === "dark" || (theme === "system" && window.matchMedia("(prefers-color-scheme: dark)").matches);
              document.documentElement.classList.toggle("dark", dark);
              var brand = localStorage.getItem("store-brand-theme");
              if (brand === "performance" || brand === "endurance" || brand === "energy") {
                document.documentElement.dataset.brand = brand;
              }
            } catch (error) {} finally {
              document.documentElement.dataset.themeReady = "true";
            }
          `}</Script>
        <Providers>
          <Suspense fallback={<main className="min-h-screen" />}>
            <StoreChrome><main className="pointer-events-auto mx-auto w-full max-w-[1920px]">{children}</main></StoreChrome>
          </Suspense>
          <div>
            <Toaster position="bottom-right" />
            <Analytics />
            <SpeedInsights />
          </div>
        </Providers>
      </body>
    </html>
  );
}
