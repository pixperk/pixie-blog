"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { MessageSquare, ArrowBigUp } from "lucide-react";
import { formatDistanceToNow } from "date-fns";
import Image from "next/image";
import Link from "next/link";
import { useUser } from "@/context/userContext";
import { useRouter } from "next/navigation";
import { bookmarkedBlogType, fetchBookmarked } from "@/server/blog";
import { Bookmark } from "./bookmark";

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
  );
}

function BlogSkeleton() {
  return (
    <div className="animate-pulse space-y-8">
      {[...Array(3)].map((_, i) => (
        <Skeleton key={i} />
      ))}
    </div>
  );
}

export default function BookmarksList() {
  const [bookmarkedBlogs, setBookmarkedBlogs] = useState<bookmarkedBlogType>([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);
  const { user, loading: userLoading } = useUser();
  const router = useRouter();
  const observer = useRef<IntersectionObserver | null>(null);

  useEffect(() => {
    if (!userLoading && !user) {
      router.push("/login");
      return;
    }
  }, [user, userLoading, router]);

  const fetchBookmarks = useCallback(async () => {
    if (!user || !hasMore) return;
    setLoading(true);
    try {
      const data = await fetchBookmarked(user.id, page);
      setBookmarkedBlogs((prev) => [...prev, ...data]);
      setHasMore(data.length > 0);
      setPage((prev) => prev + 1);
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  }, [user, page, hasMore]);

  useEffect(() => {
    fetchBookmarks();
  }, [fetchBookmarks]);

  const lastBlogRef = useCallback(
    (node: HTMLDivElement | null) => {
      if (loading) return;
      if (observer.current) observer.current.disconnect();
      observer.current = new IntersectionObserver((entries) => {
        if (entries[0].isIntersecting) {
          fetchBookmarks();
        }
      });
      if (node) observer.current.observe(node);
    },
    [loading, fetchBookmarks]
  );

  if (loading && page === 1) {
    return <BlogSkeleton />;
  }

  if (!bookmarkedBlogs.length) {
    return (
      <p className="text-center text-neon-green-400 text-lg font-semibold mt-6">
        No bookmarks found. Start exploring!
      </p>
    );
  }

  return (
    <div className="space-y-8 px-4 sm:px-6 max-w-4xl mx-auto">
      {bookmarkedBlogs.map(({ blog }, index) => (
        <article
          key={blog.id}
          ref={index === bookmarkedBlogs.length - 1 ? lastBlogRef : null}
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
                      {formatDistanceToNow(new Date(blog.publishDate), { addSuffix: true })} · {blog.readingTime}
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
      {loading && <BlogSkeleton />}
    </div>
  );
}
