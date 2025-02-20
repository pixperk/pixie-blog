"use client"

import { Button } from "@/components/ui/button"
import { Dialog, DialogContent } from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { ScrollArea } from "@/components/ui/scroll-area"
import { getSearchedBlogs } from "@/server/blog"
import type { DialogProps } from "@radix-ui/react-dialog"
import { ChevronRight, FileText, Loader2, Search, Users } from "lucide-react"
import { useRouter } from "next/navigation"
import * as React from "react"

interface Author {
  id: string
  name: string
  avatar: string | null
  bio: string | null
  _count: { blogs: number }
}

interface Blog {
  id: string
  title: string
  subtitle: string
  thumbnail: string
  author: {
    id: string
    name: string
    avatar: string | null
  }
}

interface SearchResults {
  blogs: Blog[]
  authors: Author[]
  hasMore: boolean
}

export function SearchCommand({ ...props }: DialogProps) {
  const router = useRouter()
  const [open, setOpen] = React.useState(false)
  const [query, setQuery] = React.useState("")
  const [results, setResults] = React.useState<SearchResults>({
    blogs: [],
    authors: [],
    hasMore: false,
  })
  const [loading, setLoading] = React.useState(false)
  const [error, setError] = React.useState<string | null>(null)
  const [page, setPage] = React.useState(1)
  const searchInputRef = React.useRef<HTMLInputElement>(null)

  const performSearch = React.useCallback(async (searchQuery: string, pageNum = 1) => {
    if (!searchQuery.trim()) {
      setResults({ blogs: [], authors: [], hasMore: false })
      return
    }

    setLoading(true)
    setError(null)

    try {
      const searchResults = await getSearchedBlogs(searchQuery, pageNum)
      setResults((prev) => ({
        blogs: pageNum === 1 ? searchResults.blogs : [...prev.blogs, ...searchResults.blogs],
        authors: pageNum === 1 ? searchResults.authors : prev.authors,
        hasMore: searchResults.hasMore,
      }))
      setPage(pageNum)
    } catch (error) {
      console.error("Search error:", error)
      setError("An error occurred while searching. Please try again.")
    } finally {
      setLoading(false)
    }
  }, [])

  const debouncedSearch = React.useMemo(() => debounce(performSearch, 300), [performSearch])

  React.useEffect(() => {
    if (open) {
      setPage(1)
      performSearch(query, 1)
      searchInputRef.current?.focus()
    }
  }, [query, open, performSearch])

  const highlightMatch = (text: string) => {
    if (!query.trim()) return text
    const regex = new RegExp(`(${query})`, "gi")
    return text.split(regex).map((part, i) =>
      regex.test(part) ? (
        <span key={i} className="search-highlight">
          {part}
        </span>
      ) : (
        part
      ),
    )
  }

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Escape") {
      setOpen(false)
    }
  }

  return (
    <>
      <Button
        variant="outline"
        className="relative h-9 w-9 p-0 xl:h-10 xl:w-60 xl:justify-start xl:px-3 xl:py-2 border-neon-green-500/30 hover:border-neon-green-500 hover:bg-neon-green-500/10 transition-colors"
        onClick={() => setOpen(true)}
        {...props}
      >
        <Search className="h-4 w-4 xl:mr-2 text-neon-green-500" />
        <span className="hidden xl:inline-flex text-neon-green-500">Search blogs...</span>
        <span className="sr-only">Search blogs</span>
        <kbd className="pointer-events-none absolute right-1.5 top-2 hidden h-6 select-none items-center gap-1 rounded border border-neon-green-500/30 bg-neon-green-950 px-1.5 font-mono text-[10px] font-medium text-neon-green-500 opacity-100 xl:flex">
          <span className="text-xs">⌘</span>K
        </kbd>
      </Button>

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent
          className="sm:max-w-[600px] max-h-[85vh] bg-gray-900 border-neon-green-800/50 p-0 gap-0 overflow-hidden"
          onKeyDown={handleKeyDown}
        >
          <div className="p-4 border-b border-neon-green-800/50">
            <div className="flex items-center space-x-2">
              <Search className="h-5 w-5 text-neon-green-500" />
              <Input
                ref={searchInputRef}
                placeholder="Search blogs, authors, or tags..."
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                className="border-none bg-transparent focus-visible:ring-0 focus-visible:ring-offset-0 text-neon-green-50 placeholder:text-neon-green-500/50"
              />
            </div>
          </div>

          <ScrollArea className="scroll-area flex-1 p-4 max-h-[60vh] scrollbar-custom">
            {error ? (
              <div className="text-center py-4 text-red-400">{error}</div>
            ) : loading && page === 1 ? (
              <div className="flex items-center justify-center py-8">
                <Loader2 className="h-8 w-8 animate-spin text-neon-green-500" />
              </div>
            ) : !query.trim() ? (
              <div className="text-center py-8 text-neon-green-500/70">Start typing to search...</div>
            ) : results?.authors?.length === 0 && results?.blogs?.length === 0 ? (
              <div className="text-center py-8 text-neon-green-500/70">No results found for "{query}"</div>
            ) : (
              <div className="space-y-6">
                {results?.authors?.length > 0 && (
                  <div>
                    <h3 className="text-sm font-semibold text-neon-green-500 mb-3 flex items-center">
                      <Users className="h-4 w-4 mr-2" />
                      Authors
                    </h3>
                    <div className="space-y-2">
                      {results?.authors?.map((author) => (
                        <div
                          key={author.id}
                          onClick={() => {
                            setOpen(false)
                            router.push(`/profile/${author.id}`)
                          }}
                          className="flex items-center p-3 hover:bg-neon-green-900/50 rounded-lg transition-all duration-200 cursor-pointer group"
                        >
                          <div className="h-12 w-12 mr-4 flex-shrink-0">
                            {author.avatar ? (
                              <img
                                src={author.avatar || "/placeholder.svg"}
                                alt={author.name}
                                className="rounded-full object-cover w-full h-full ring-2 ring-neon-green-500/20 group-hover:ring-neon-green-500/50 transition-all"
                              />
                            ) : (
                              <div className="h-full w-full rounded-full bg-neon-green-500/20 flex items-center justify-center group-hover:bg-neon-green-500/30 transition-all">
                                <Users className="h-6 w-6 text-neon-green-500" />
                              </div>
                            )}
                          </div>
                          <div className="flex-grow min-w-0">
                            <p className="font-medium text-neon-green-50">{highlightMatch(author.name)}</p>
                            <p className="text-sm text-neon-green-500/70">
                              {author._count.blogs} {author._count.blogs === 1 ? "blog" : "blogs"}
                            </p>
                            {author.bio && <p className="text-sm text-neon-green-400/60 truncate mt-1">{author.bio}</p>}
                          </div>
                          <ChevronRight className="ml-2 h-5 w-5 text-neon-green-500/50 group-hover:text-neon-green-500 transition-colors" />
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {results?.blogs?.length > 0 && (
                  <div>
                    <h3 className="text-sm font-semibold text-neon-green-500 mb-3 flex items-center">
                      <FileText className="h-4 w-4 mr-2" />
                      Blogs
                    </h3>
                    <div className="space-y-2">
                      {results?.blogs?.map((blog) => (
                        <div
                          key={blog.id}
                          onClick={() => {
                            setOpen(false)
                            router.push(`/blog/${blog.id}`)
                          }}
                          className="flex items-center p-3 hover:bg-neon-green-900/50 rounded-lg transition-all duration-200 cursor-pointer group"
                        >
                          <div className="h-12 w-12 mr-4 flex-shrink-0 rounded-lg bg-neon-green-500/20 flex items-center justify-center group-hover:bg-neon-green-500/30 transition-all">
                            <img
                              src={blog.thumbnail || "/placeholder.svg"}
                              alt={blog.title}
                              className="rounded-full object-cover w-full h-full ring-2 ring-neon-green-500/20 group-hover:ring-neon-green-500/50 transition-all"
                            />
                          </div>
                          <div className="flex-grow min-w-0">
                            <p className="font-medium text-neon-green-50">{highlightMatch(blog.title)}</p>
                            <p className="text-sm text-neon-green-500/70">by {highlightMatch(blog.author.name)}</p>
                          </div>
                          <ChevronRight className="ml-2 h-5 w-5 text-neon-green-500/50 group-hover:text-neon-green-500 transition-colors" />
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            )}
            {results.hasMore && !loading && (
              <div className="flex justify-center mt-4">
                <Button
                  onClick={() => {
                    const nextPage = page + 1
                    performSearch(query, nextPage)
                  }}
                  variant="outline"
                  className="text-neon-green-500 border-neon-green-500 hover:bg-neon-green-500/10"
                >
                  Load More
                </Button>
              </div>
            )}
            {loading && page > 1 && (
              <div className="flex justify-center mt-4">
                <Loader2 className="h-6 w-6 animate-spin text-neon-green-500" />
              </div>
            )}
          </ScrollArea>
        </DialogContent>
      </Dialog>
    </>
  )
}

function debounce<T extends (...args: any[]) => any>(func: T, wait: number): (...args: Parameters<T>) => void {
  let timeout: NodeJS.Timeout

  return (...args: Parameters<T>) => {
    clearTimeout(timeout)
    timeout = setTimeout(() => func(...args), wait)
  }
}

