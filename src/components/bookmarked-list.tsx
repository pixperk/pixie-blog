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
    <div className="flex flex-col sm:flex-row justify-between items-start border-b border-neon-green-500 pb-6 animate-pulse space-y-4 sm:space-y-0 sm:space-x-4">
      <div className="relative w-24 h-24 sm:w-32 sm:h-32 bg-neon-green-400/20 rounded-lg" />
      <div className="flex-1 space-y-2">
        <div className="h-6 w-3/4 bg-neon-green-400/20 rounded-md" />
        <div className="h-4 w-1/2 bg-neon-green-400/20 rounded-md" />
        <div className="h-4 w-1/3 bg-neon-green-400/20 rounded-md" />
      </div>
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
    return (
      <div className="space-y-8">
        {[...Array(3)].map((_, index) => (
          <Skeleton key={index} />
        ))}
      </div>
    );
  }

  if (!bookmarkedBlogs.length) {
    return (
      <p className="text-center text-neon-green-400 text-lg font-semibold mt-6">
        No bookmarks found. Start exploring!
      </p>
    );
  }

  return (
    <div className="space-y-8 p-4 sm:p-6">
      {bookmarkedBlogs.map(({ blog }, index) => (
        <div
          key={blog.id}
          ref={index === bookmarkedBlogs.length - 1 ? lastBlogRef : null}
          className="group flex flex-col sm:flex-row justify-between items-start border-b border-neon-green-500 pb-6 space-y-4 sm:space-y-0 sm:space-x-6 transition-all duration-300 hover:shadow-md hover:border-neon-green-300"
        >
          <div className="flex flex-1 space-x-4">
            <div className="relative w-24 h-24 sm:w-32 sm:h-32 rounded-lg overflow-hidden shadow-lg transition-all duration-300 group-hover:scale-105 group-hover:shadow-xl">
              <Image
                src={blog.thumbnail}
                alt={blog.title}
                layout="fill"
                objectFit="cover"
              />
            </div>
            <div className="flex-1 space-y-2">
              <Link href={`/blog/${blog.id}`} className="block">
                <h2 className="text-lg sm:text-xl font-bold text-neon-green-300 transition-colors duration-300 group-hover:text-neon-green-500">
                  {blog.title}
                </h2>
              </Link>
              <p className="text-sm sm:text-base text-neon-green-400 line-clamp-2">
                {blog.subtitle || blog.content.substring(0, 100)}...
              </p>
              <div className="flex items-center space-x-2 text-neon-green-500 text-sm">
                <Avatar className="w-6 h-6">
                  <AvatarImage src={blog.author.avatar} alt={blog.author.name} />
                  <AvatarFallback>{blog.author.name.charAt(0)}</AvatarFallback>
                </Avatar>
                <span>{blog.author.name}</span>
                <span className="ml-2">·</span>
                <span>{formatDistanceToNow(new Date(blog.publishDate), { addSuffix: true })}</span>
              </div>
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
            <Bookmark blogId={blog.id} />
          </div>
        </div>
      ))}
      {loading && <Skeleton />}
    </div>
  );
}
