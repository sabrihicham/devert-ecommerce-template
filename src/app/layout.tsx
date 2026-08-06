import type { Metadata } from "next";
import { GeistSans } from "geist/font/sans";
import { Analytics } from "@vercel/analytics/react";
import { SpeedInsights } from "@vercel/speed-insights/next";
import { Toaster } from "sonner";

import { Navbar } from "@/components/layout/navbar";
import { Footer } from "@/components/layout/footer";
import { Providers } from "@/providers";
import { getCollections } from "@/app/actions";
import "@/styles/globals.css";
import "@/styles/colors.css";
import "@/styles/animations.css";

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
  const categories = await getCollections();

  return (
    <html lang="en">
      <body className={GeistSans.className}>
        <Providers>
          <Navbar categories={categories} />
          <main className="pointer-events-auto mx-auto w-full max-w-[1920px]">
            {children}
            <Toaster position="bottom-right" />
            <Analytics />
            <SpeedInsights />
          </main>
          <Footer categories={categories} />
        </Providers>
      </body>
    </html>
  );
}
