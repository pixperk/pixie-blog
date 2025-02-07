"use client";

import { useState } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { cn } from "@/lib/utils";
import { Search, Bell, Edit, LogOut, LogIn, Menu, User, Bookmark } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";
import { DropdownMenu, DropdownMenuTrigger, DropdownMenuContent, DropdownMenuItem } from "@/components/ui/dropdown-menu";
import { useUser } from "@/context/userContext";
import { signOut } from "firebase/auth";
import { auth } from "@/lib/firebase";

const categories = [
  "For you",
  "Following",
  "Technology",
  "Programming",
  "Design",
  "AI",
  "Web Development",
  "Philosophy",
  "Writing",
];

export function SiteHeader() {
  const pathname = usePathname();
  const router = useRouter();
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const { user, loading } = useUser();

  async function logout() {
    await signOut(auth);
    router.push("/");
  }

  const isBlogPage = pathname.startsWith("/blog/");

  return (
    <header className="fixed top-0 left-0 right-0 z-50 bg-black/70 backdrop-blur-md shadow-md border-b border-gray-800/50">
      <div className="container mx-auto flex h-16 items-center justify-between px-6">
        <div className="flex items-center space-x-6">
          <Link href="/" className="text-2xl font-bold text-neon-green-500">
            Pixie
          </Link>
          {!loading && user && !isBlogPage && (
            <nav className="hidden md:flex space-x-6">
              {categories.slice(0, 5).map((category) => (
                <Link
                  key={category}
                  href={`/category/${category.toLowerCase().replace(/ /g, "-")}`}
                  className={cn(
                    "text-sm font-medium transition-colors hover:text-neon-green-400",
                    pathname === `/category/${category.toLowerCase().replace(/ /g, "-")}`
                      ? "text-neon-green-500"
                      : "text-gray-300"
                  )}
                >
                  {category}
                </Link>
              ))}
            </nav>
          )}
        </div>

        <div className="flex items-center space-x-3">
          {isBlogPage ? (
            <input
              type="text"
              placeholder="Search blogs..."
              className="px-4 py-2 rounded-md bg-gray-800 text-gray-200 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-neon-green-400"
            />
          ) : (
            <Button variant="ghost" size="icon" className="text-gray-400 hover:text-neon-green-400">
              <Search className="h-5 w-5" />
            </Button>
          )}

          <Button variant="ghost" size="icon" className="text-gray-400 hover:text-neon-green-400">
            <Bell className="h-5 w-5" />
          </Button>

          <Button
            onClick={() => router.push("/write")}
            variant="ghost"
            className="hidden md:flex items-center space-x-2 text-gray-400 hover:text-neon-green-400"
          >
            <Edit className="h-5 w-5" />
            <span>Write</span>
          </Button>

          {!loading && user ? (
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <img
                  src={user.avatar || "/default-avatar.png"}
                  alt="Profile"
                  className="h-8 w-8 rounded-full border border-gray-500 cursor-pointer"
                />
              </DropdownMenuTrigger>
              <DropdownMenuContent className="bg-gray-900 text-gray-100">
                <DropdownMenuItem onClick={() => router.push("/profile")}>
                  <User className="h-4 w-4 mr-2" /> Profile
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => router.push("/bookmarks")}>
                  <Bookmark className="h-4 w-4 mr-2" /> Bookmarks
                </DropdownMenuItem>
                <DropdownMenuItem onClick={logout} className="text-red-500">
                  <LogOut className="h-4 w-4 mr-2" /> Logout
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          ) : (
            <Button
              variant="ghost"
              size="icon"
              className="text-gray-400 hover:text-neon-green-400"
              onClick={() => router.push("/login")}
            >
              <LogIn className="h-5 w-5" />
            </Button>
          )}

          <Sheet open={isMenuOpen} onOpenChange={setIsMenuOpen}>
            <SheetTrigger asChild>
              <Button variant="ghost" size="icon" className="md:hidden text-gray-400 hover:text-neon-green-400">
                <Menu className="h-5 w-5" />
              </Button>
            </SheetTrigger>
            <SheetContent side="right" className="w-[300px] sm:w-[400px] bg-gray-900 text-gray-100">
              <SheetHeader>
                <SheetTitle className="text-neon-green-500">Menu</SheetTitle>
              </SheetHeader>
              <nav className="mt-6 flex flex-col space-y-4">
                {!loading && user && categories.map((category) => (
                  <Link
                    key={category}
                    href={`/category/${category.toLowerCase().replace(/ /g, "-")}`}
                    className={cn(
                      "text-lg font-medium transition-colors hover:text-neon-green-400",
                      pathname === `/category/${category.toLowerCase().replace(/ /g, "-")}`
                        ? "text-neon-green-500"
                        : "text-gray-400"
                    )}
                    onClick={() => setIsMenuOpen(false)}
                  >
                    {category}
                  </Link>
                ))}

                {!loading && user ? (
                  <Button
                    variant="ghost"
                    className="justify-start px-0 text-lg text-red-500 hover:text-red-400"
                    onClick={logout}
                  >
                    <LogOut className="h-5 w-5 mr-2" /> Logout
                  </Button>
                ) : (
                  <Button
                    variant="ghost"
                    className="justify-start px-0 text-lg text-gray-400 hover:text-neon-green-400"
                    onClick={() => router.push("/login")}
                  >
                    <LogIn className="h-5 w-5 mr-2" /> Sign In
                  </Button>
                )}
              </nav>
            </SheetContent>
          </Sheet>
        </div>
      </div>
    </header>
  );
} 