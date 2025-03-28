import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { cn, constructMetadata } from "@/lib/utils";
import type React from "react";
import { SiteHeader } from "@/components/site-header";
import { UserProvider } from "@/context/userContext";
import { NextSSRPlugin } from "@uploadthing/react/next-ssr-plugin";
import { extractRouterConfig } from "uploadthing/server";
import { ourFileRouter } from "@/app/api/uploadthing/core"; 
import { Toaster } from "react-hot-toast";
import { CategoriesProvider } from "@/context/categoryContext";
import { Suspense } from "react";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = constructMetadata()

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <Suspense>
    <UserProvider>
      <CategoriesProvider>
    <html lang="en" className="dark h-full">
      <body
        className={cn(
          inter.className,
          "flex flex-col min-h-screen  bg-gray-900 text-gray-100 antialiased"
        )}
      >
         <NextSSRPlugin
          routerConfig={extractRouterConfig(ourFileRouter)}
        />
        <SiteHeader />
        <main className="flex-1 flex flex-col mt-16">{children}</main>
        <Toaster
          position="bottom-right"
          toastOptions={{
            style: {
              background: "#1a1a1a",
              color: "#ffffff",
              border: "1px solid #333333",
            },
            success: {
              iconTheme: {
                primary: "#39FF14",
                secondary: "#1a1a1a",
              },
            },
            error: {
              iconTheme: {
                primary: "#ff4444",
                secondary: "#1a1a1a",
              },
            },
          }}
        />
      </body>
    </html>
    </CategoriesProvider>
    </UserProvider>
    </Suspense>
  );
}
