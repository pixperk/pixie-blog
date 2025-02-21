"use client"

import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { useUser } from "@/context/userContext"
import { fetchBlogsByTag, fetchFollowedBlogs, fetchTrendingBlogs } from "@/server/blog"
import { formatDistanceToNow } from "date-fns"
import { ArrowBigUp, MessageSquare } from "lucide-react"
import Image from "next/image"
import Link from "next/link"
import { useRouter, useSearchParams } from "next/navigation"
import { useCallback, useEffect, useRef, useState } from "react"
import { Bookmark } from "./bookmark"

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

function Skeleton() {
  return (
    <div className="flex flex-col sm:flex-row justify-between items-start border-b border-neon-green-500/30 pb-8 animate-pulse space-y-4 sm:space-y-0 sm:space-x-6">
      <div className="relative w-full sm:w-40 h-40 bg-neon-green-400/20 rounded-xl overflow-hidden" />
      <div className="flex-1 space-y-3 w-full">
        <div className="h-6 bg-neon-green-400/20 rounded-md w-3/4" />
        <div className="h-4 bg-neon-green-400/20 rounded-md w-1/2" />
        <div className="h-4 bg-neon-green-400/20 rounded-md w-2/3" />
        <div className="flex items-center space-x-3">
          <div className="h-8 w-8 rounded-full bg-neon-green-400/20" />
          <div className="h-3 bg-neon-green-400/20 rounded-md w-24" />
        </div>
      </div>
    </div>
  )
}

function BlogSkeleton() {
  return (
    <div className="animate-pulse space-y-8">
      {[...Array(3)].map((_, i) => (
        <Skeleton key={i} />
      ))}
    </div>
  )
}

export default function HomeList() {
  const [blogs, setBlogs] = useState<BlogType[]>([])
  const [loading, setLoading] = useState(false)
  const [page, setPage] = useState(1)
  const [hasMore, setHasMore] = useState(true)
  const { user } = useUser()
  const router = useRouter()
  const searchParams = useSearchParams()
  const observer = useRef<IntersectionObserver | null>(null)
  const category = searchParams.get("category") || ""

  const fetchBlogs = useCallback(async (currentPage: number) => {
    if (loading || !hasMore) return
    setLoading(true)
    try {
      let data: BlogType[] = []
      if (category === "") {
        data = await fetchTrendingBlogs(currentPage)
      } else if (category.toLowerCase() === "following" && user) {
        data = await fetchFollowedBlogs(user.id, currentPage)
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
  }, [category, user, hasMore])

  useEffect(() => {
    setBlogs([])
    setPage(1)
    setHasMore(true)
  }, [category])

  useEffect(() => {
    if (page === 1) fetchBlogs(1)
  }, [category, fetchBlogs, page])

  const lastBlogRef = useCallback((node: HTMLDivElement | null) => {
    if (loading) return
    if (observer.current) observer.current.disconnect()
    observer.current = new IntersectionObserver((entries) => {
      if (entries[0].isIntersecting && hasMore) fetchBlogs(page)
    })
    if (node) observer.current.observe(node)
  }, [loading, hasMore, page, fetchBlogs])

  return (
    <div className="space-y-8 px-4 sm:px-6 max-w-4xl mx-auto">
      {blogs.length === 0 && !loading && (
        <div className="text-center py-12 space-y-4">
          <div className="text-4xl">🌌</div>
          <p className="text-xl font-medium text-neon-green-400/90">
            No blogs found in this constellation... Start exploring the cosmos!
          </p>
        </div>
      )}

      <div className="space-y-8">
        {blogs.map((blog, index) => (
          <article 
            key={blog.id}
            ref={index === blogs.length - 1 ? lastBlogRef : null}
            className="group relative bg-black/30 backdrop-blur-sm rounded-2xl p-6 border border-neon-green-500/30 hover:border-neon-green-400/50 transition-all duration-300 shadow-lg hover:shadow-neon-green-500/20"
          >
            <div className="flex flex-col sm:flex-row gap-6">
              <Link href={`/blog/${blog.id}`} className="block sm:w-40 flex-shrink-0">
                <div className="relative w-full h-40 rounded-xl overflow-hidden transition-transform duration-300 group-hover:scale-95">
                  <Image
                    src={blog.thumbnail || "/placeholder.svg"}
                    alt={blog.title}
                    layout="fill"
                    objectFit="cover"
                    className="absolute inset-0 transform transition duration-500 group-hover:scale-105"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
                </div>
              </Link>

              <div className="flex-1 flex flex-col justify-between">
                <div className="space-y-3">
                  <Link href={`/blog/${blog.id}`} className="block">
                    <h2 className="text-2xl font-bold text-neon-green-400 hover:text-neon-green-300 transition-colors">
                      {blog.title}
                    </h2>
                    {blog.subtitle && (
                      <p className="mt-1 text-neon-green-400/80 font-serif line-clamp-2">
                        {blog.subtitle}
                      </p>
                    )}
                  </Link>

                  <div className="flex flex-wrap gap-2 mt-2">
                    {blog.tags.map((tag) => (
                      <span
                        key={tag.id}
                        className="px-2 py-1 text-xs font-medium rounded-full bg-neon-green-500/10 text-neon-green-400 border border-neon-green-500/30"
                      >
                        #{tag.tag}
                      </span>
                    ))}
                  </div>
                </div>

                <div className="mt-4 flex items-center justify-between">
                  <div 
                    onClick={() => router.push(`/profile/${blog.author.id}`)}
                    className="flex items-center gap-3 cursor-pointer hover:opacity-80 transition-opacity"
                  >
                    <Avatar className="w-8 h-8 border border-neon-green-500/30">
                      <AvatarImage src={blog.author.avatar} />
                      <AvatarFallback className="bg-neon-green-500/20">
                        {blog.author.name.charAt(0)}
                      </AvatarFallback>
                    </Avatar>
                    <div className="space-y-0.5">
                      <p className="text-sm font-medium text-neon-green-400">
                        {blog.author.name}
                      </p>
                      <p className="text-xs text-neon-green-500">
                        {formatDistanceToNow(blog.publishDate, { addSuffix: true })} · {blog.readingTime}
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center gap-4 text-neon-green-400/90">
                    <div className="flex items-center gap-1.5">
                      <ArrowBigUp className="w-5 h-5" />
                      <span className="text-sm">{blog._count.upvotes}</span>
                    </div>
                    <div className="flex items-center gap-1.5">
                      <MessageSquare className="w-5 h-5" />
                      <span className="text-sm">{blog._count.comments}</span>
                    </div>
                    {user && <Bookmark blogId={blog.id} />}
                  </div>
                </div>
              </div>
            </div>
          </article>
        ))}
      </div>

      {loading && <BlogSkeleton />}
    </div>
  )
}