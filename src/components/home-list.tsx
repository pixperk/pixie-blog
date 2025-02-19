"use client"

import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { useUser } from "@/context/userContext"
import { fetchTrendingBlogs, fetchBlogsByTag, fetchFollowedBlogs } from "@/server/blog"
import { formatDistanceToNow } from "date-fns"
import { ArrowBigUp, MessageSquare } from "lucide-react"
import Image from "next/image"
import Link from "next/link"
import { useCallback, useEffect, useRef, useState } from "react"
import { Bookmark } from "./bookmark"
import { useSearchParams } from "next/navigation"
import { Skeleton } from "./ui/skeleton"

interface BlogType {
  id: string
  title: string
  subtitle: string | null
  thumbnail: string
  publishDate: Date
  readingTime: string
  author: {
    id: string
    name: string
    socialId: string
    email: string
    bio: string | null
    avatar: string
    github: string | null
    twitter: string | null
    linkedin: string | null
  }
  tags: {
    id: string
    tag: string
  }[]
  _count: {
    upvotes: number
    comments: number
  }
  score: number
  createdAt: Date
}



function BlogSkeleton()  {
 return (
    <div className="flex flex-col sm:flex-row justify-between items-start border-b border-neon-green-500 pb-6 space-y-4 sm:space-y-0 sm:space-x-6">
      <div className="flex flex-1 space-x-4">
        <Skeleton className="w-24 h-24 sm:w-32 sm:h-32 rounded-lg" />
        <div className="flex-1 space-y-2">
          <Skeleton className="h-6 w-3/4" />
          <Skeleton className="h-4 w-1/2" />
          <div className="flex items-center space-x-2 mt-2">
            <Skeleton className="w-6 h-6 rounded-full" />
            <Skeleton className="h-4 w-24" />
            <Skeleton className="h-4 w-16" />
          </div>
          <div className="flex flex-wrap gap-2 mt-2">
            <Skeleton className="h-6 w-16 rounded-full" />
            <Skeleton className="h-6 w-20 rounded-full" />
            <Skeleton className="h-6 w-24 rounded-full" />
          </div>
        </div>
      </div>
      <div className="flex space-x-4 items-center">
        <Skeleton className="h-6 w-12" />
        <Skeleton className="h-6 w-12" />
        <Skeleton className="h-6 w-16" />
      </div>
    </div>
  )
}

export default function HomeList() {
  const [blogs, setBlogs] = useState<BlogType[]>([])
  const [loading, setLoading] = useState(false)
  const [page, setPage] = useState(1)
  const [hasMore, setHasMore] = useState(true)
  const { user } = useUser()
  const searchParams = useSearchParams()
  const observer = useRef<IntersectionObserver | null>(null)

  const category = searchParams.get("category") || ""

  const fetchBlogs = useCallback(
    async (currentPage: number) => {
      if (loading || !hasMore) return
      setLoading(true)

      try {
        let data: BlogType[] = []

        if (category === "") {
          data = await fetchTrendingBlogs(currentPage)
        } else if (category.toLowerCase() === "following") {
          if (user) {
            data = await fetchFollowedBlogs(user.id, currentPage)
          } else {
            setLoading(false)
            return
          }
        } else {
          data = await fetchBlogsByTag(category, currentPage)
        }

        setBlogs((prev) => (currentPage === 1 ? data : [...prev, ...data]))
        setHasMore(data.length > 0)
        setPage((prev) => prev + 1)
      } catch (error) {
        console.error("Error fetching blogs:", error)
      } finally {
        setLoading(false)
      }
    },
    [category, user, hasMore],
  )

  useEffect(() => {
    setBlogs([]);
    setPage(1);
    setHasMore(true);
  }, [category]);

  useEffect(() => {
    if (page === 1) {
      fetchBlogs(1);
    }
  }, [category, fetchBlogs, page]);

  const lastBlogRef = useCallback(
    (node: HTMLDivElement | null) => {
      if (loading) return
      if (observer.current) observer.current.disconnect()
      observer.current = new IntersectionObserver((entries) => {
        if (entries[0].isIntersecting && hasMore) {
          fetchBlogs(page)
        }
      })
      if (node) observer.current.observe(node)
    },
    [loading, hasMore, page, fetchBlogs],
  )

  if (!blogs.length && !loading) {
    return (
      <p className="text-center text-neon-green-400 text-lg font-semibold mt-6">No Blogs found. Start exploring!</p>
    )
  }

  return (
    <div className="space-y-8 p-4 sm:p-6">
      {blogs.map((blog, index) => (
        <div
          key={blog.id}
          ref={index === blogs.length - 1 ? lastBlogRef : null}
          className="group flex flex-col sm:flex-row justify-between items-start border-b border-neon-green-500 pb-6 space-y-4 sm:space-y-0 sm:space-x-6 transition-all duration-300 hover:shadow-md hover:border-neon-green-300"
        >
          <div className="flex flex-1 space-x-4">
            <div className="relative w-24 h-24 sm:w-32 sm:h-32 rounded-lg overflow-hidden shadow-lg transition-all duration-300 group-hover:scale-105 group-hover:shadow-xl">
              <Image src={blog.thumbnail || "/placeholder.svg"} alt={blog.title} layout="fill" objectFit="cover" />
            </div>
            <div className="flex-1 space-y-2">
              <Link href={`/blog/${blog.id}`} className="block">
                <h2 className="text-2xl sm:text-xl font-bold text-neon-green-400 transition-colors duration-300 group-hover:text-neon-green-800">
                  {blog.title}
                </h2>
              </Link>
              {blog.subtitle && (
                <p className="text-sm font-serif sm:text-base text-neon-green-400 line-clamp-2">{blog.subtitle}</p>
              )}
              <div className="flex items-center space-x-2 text-neon-green-500 text-sm">
                <Avatar className="w-6 h-6">
                  <AvatarImage src={blog.author.avatar} alt={blog.author.name} />
                  <AvatarFallback>{blog.author.name.charAt(0)}</AvatarFallback>
                </Avatar>
                <span>{blog.author.name}</span>
                <span className="ml-2">·</span>
                <span>
                  {formatDistanceToNow(blog.publishDate, {
                    addSuffix: true,
                  })}
                </span>
              </div>
              {blog.tags && blog.tags.length > 0 && (
                <div className="flex flex-wrap gap-2 mt-2">
                  {blog.tags.map((tag) => (
                    <span
                      key={tag.id}
                      className="px-3 py-1 rounded-full text-xs font-semibold bg-dark-gray-800 text-neon-green-400 border border-neon-green-500 hover:bg-dark-gray-700 transition-all duration-300"
                    >
                      #{tag.tag}
                    </span>
                  ))}
                </div>
              )}
            </div>
          </div>
          <div className="flex space-x-4 items-center text-sm text-neon-green-500">
            <div className="flex items-center space-x-1 transition-transform duration-300 hover:scale-110">
              <ArrowBigUp className="w-4 h-4" />
              <span>{blog._count.upvotes}</span>
            </div>
            <div className="flex items-center space-x-1 transition-transform duration-300 hover:scale-110">
              <MessageSquare className="w-4 h-4" />
              <span>{blog._count.comments}</span>
            </div>
            <div className="text-neon-green-400 font-semibold">{blog.readingTime}</div>
            {user && <Bookmark blogId={blog.id} />}
          </div>
        </div>
      ))}
      {loading && <BlogSkeleton />}
    </div>
  )
}

