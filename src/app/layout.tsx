import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { cn } from "@/lib/utils";
import type React from "react";
import { SiteHeader } from "@/components/site-header";
import { UserProvider } from "@/context/userContext";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "Pixie Blog",
  description: "Where ideas come to life",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <UserProvider>
    <html lang="en" className="dark h-full">
      <body
        className={cn(
          inter.className,
          "flex flex-col min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-black text-gray-100 antialiased"
        )}
      >
        <SiteHeader />
        <main className="flex-1 flex flex-col mt-16">{children}</main>
      </body>
    </html>
    </UserProvider>
  );
}
