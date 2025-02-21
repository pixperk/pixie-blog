"use client"

import { Suspense, useState } from "react"
import Link from "next/link"
import { useRouter, useSearchParams } from "next/navigation"
import { cn } from "@/lib/utils"
import { Edit, LogOut, LogIn, Menu, User, Bookmark } from "lucide-react"
import { Button } from "@/components/ui/button"
import { motion } from "framer-motion"
import {
  Sheet,
  SheetTrigger,
  SheetContent,
} from "@/components/ui/sheet"
import {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuItem,
} from "@/components/ui/dropdown-menu"
import { useUser } from "@/context/userContext"
import { signOut } from "firebase/auth"
import { auth } from "@/lib/firebase"
import { SearchCommand } from "./search-command"
import { useCategories } from "@/context/categoryContext"

export function SiteHeader() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const activeCategory = searchParams.get("category") || ""
  const [isMenuOpen, setIsMenuOpen] = useState(false)
  const { user, loading } = useUser()
  const { categories: trendingCategories, loading: categoriesLoading } = useCategories()

  async function logout() {
    await signOut(auth)
    router.push("/")
  }

  const extraCategories = [
    { name: "Trending", query: "" },
    { name: "Following", query: "Following" },
  ]

  const categoryLinks = extraCategories.concat(
    trendingCategories.map((cat: string) => ({ name: cat, query: cat }))
  )

  function handleCategoryClick(category: { name: string; query: string }) {
    const path = category.query === "" ? "/" : `/?category=${encodeURIComponent(category.query)}`
    router.push(path)
    setIsMenuOpen(false)
  }

  return (
    <Suspense fallback = {<>Loading...</>}>
    <div className="fixed top-4 left-0 right-0 z-50 mx-auto max-w-7xl px-4">
      <motion.header
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3 }}
        className="rounded-lg border border-neon-green-800/20 bg-neon-green-950/40 backdrop-blur-xl shadow-[0_0_20px_rgba(34,255,0,0.2)]"
      >
        <div className="container mx-auto flex h-16 items-center justify-between px-4">
          <div className="flex items-center space-x-6">
            <motion.div whileHover={{ scale: 1.05 }}>
              <Link
                href="/"
                className="text-2xl font-bold text-neon-green-400 hover:text-neon-green-300 transition-all"
              >
                Pixie
              </Link>
            </motion.div>

            {!loading && !categoriesLoading && user && (
              <nav className="hidden md:flex space-x-6">
                {categoryLinks.map((category) => (
                  <motion.div whileHover={{ scale: 1.1 }} key={category.name}>
                    <button
                      onClick={() => handleCategoryClick(category)}
                      className={cn(
                        "text-sm font-medium transition-all hover:text-neon-green-400",
                        activeCategory === category.query
                          ? "text-neon-green-500"
                          : "text-neon-green-100/70"
                      )}
                    >
                      {category.name}
                    </button>
                  </motion.div>
                ))}
              </nav>
            )}
          </div>

          <div className="flex items-center space-x-3">
            <SearchCommand />

            <motion.div
              animate={{ scale: [1, 1.05, 1] }}
              transition={{ duration: 1.5, repeat: Infinity }}
            >
              <Button
                onClick={() => router.push("/write")}
                variant="ghost"
                className="hidden md:flex items-center space-x-2 text-neon-green-100/70 hover:text-neon-green-400 hover:bg-neon-green-900/50 transition-all"
              >
                <Edit className="h-5 w-5" />
                <span>Write</span>
              </Button>
            </motion.div>

            {!loading && user ? (
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <motion.img
                    whileHover={{ scale: 1.1 }}
                    src={user.avatar || "/default-avatar.png"}
                    alt="Profile"
                    className="h-8 w-8 rounded-full border border-neon-green-500/30 cursor-pointer hover:border-neon-green-400 transition-all"
                  />
                </DropdownMenuTrigger>
                <DropdownMenuContent className="bg-gray-800 border-neon-green-800/50 text-neon-green-100 shadow-lg">
                  <DropdownMenuItem
                    onClick={() => router.push(`/profile/${user.id}`)}
                    className="cursor-pointer hover:bg-neon-green-700 transition-all"
                  >
                    <User className="h-4 w-4 mr-2" /> Profile
                  </DropdownMenuItem>
                  <DropdownMenuItem
                    onClick={() => router.push("/bookmarks")}
                    className="cursor-pointer hover:bg-neon-green-900/50 transition-all"
                  >
                    <Bookmark className="h-4 w-4 mr-2" /> Bookmarks
                  </DropdownMenuItem>
                  <DropdownMenuItem
                    onClick={logout}
                    className="cursor-pointer text-red-400 hover:bg-red-950/50 transition-all"
                  >
                    <LogOut className="h-4 w-4 mr-2" /> Logout
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            ) : (
              <motion.div whileHover={{ scale: 1.1 }}>
                <Button
                  variant="ghost"
                  size="icon"
                  className="text-neon-green-100/70 hover:text-neon-green-400 hover:bg-neon-green-900/50 transition-all"
                  onClick={() => router.push("/login")}
                >
                  <LogIn className="h-5 w-5" />
                </Button>
              </motion.div>
            )}

            <Sheet open={isMenuOpen} onOpenChange={setIsMenuOpen}>
              <SheetTrigger asChild>
                <motion.div whileHover={{ scale: 1.1 }}>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="md:hidden text-neon-green-100/70 hover:text-neon-green-400 hover:bg-neon-green-900/50 transition-all"
                  >
                    <Menu className="h-5 w-5" />
                  </Button>
                </motion.div>
              </SheetTrigger>
              <SheetContent side="right" className="bg-gray-800 text-neon-green-100 p-6">
                <div className="flex flex-col h-full justify-between">
                  <div className="space-y-6">
                    {user && (
                      <div className="flex items-center space-x-3 pb-4 border-b border-neon-green-800/50">
                        <img
                          src={user.avatar || "/default-avatar.png"}
                          alt="Profile"
                          className="h-10 w-10 rounded-full border border-neon-green-500/30"
                        />
                        <div>
                          <p className="font-medium text-neon-green-300">{user.name}</p>
                          <p className="text-xs text-neon-green-400/70">{user.bio}</p>
                        </div>
                      </div>
                    )}

                    <div className="space-y-4">
                      {categoryLinks.map((category) => (
                        <button
                          key={category.name}
                          onClick={() => handleCategoryClick(category)}
                          className={cn(
                            "w-full text-left p-2 rounded-lg transition-all",
                            activeCategory === category.query
                              ? "bg-neon-green-900/50 text-neon-green-400"
                              : "hover:bg-neon-green-900/30 text-neon-green-100/70"
                          )}
                        >
                          {category.name}
                        </button>
                      ))}
                    </div>
                  </div>

                  <div className="space-y-4 pt-6 border-t border-neon-green-800/50">
                    {user ? (
                      <>
                        <motion.div whileHover={{ scale: 1.02 }}>
                          <Button
                            onClick={() => router.push("/write")}
                            className="w-full flex items-center justify-center space-x-2 bg-neon-green-900/50 hover:bg-neon-green-800/50 text-neon-green-400"
                          >
                            <Edit className="h-5 w-5" />
                            <span>Write</span>
                          </Button>
                        </motion.div>
                        
                        <button
                          onClick={logout}
                          className="w-full p-2 rounded-lg flex items-center space-x-3 text-red-400 hover:bg-red-950/50 transition-all"
                        >
                          <LogOut className="h-5 w-5" />
                          <span>Logout</span>
                        </button>
                      </>
                    ) : (
                      <Button
                        onClick={() => {
                          router.push("/login")
                          setIsMenuOpen(false)
                        }}
                        className="w-full flex items-center justify-center space-x-2 bg-neon-green-900/50 hover:bg-neon-green-800/50 text-neon-green-400"
                      >
                        <LogIn className="h-5 w-5" />
                        <span>Login</span>
                      </Button>
                    )}
                  </div>
                </div>
              </SheetContent>
            </Sheet>
          </div>
        </div>
      </motion.header>
    </div>
    </Suspense>
  )
}