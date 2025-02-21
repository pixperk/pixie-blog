"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import Image from "next/image";
import { ArrowLeft, ArrowUpCircle, Clock, MessageSquare } from "lucide-react";
import { formatDistanceToNow } from "date-fns";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardFooter } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { deleteBlog, getAuthorBlogs } from "@/server/blog";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogTitle,AlertDialogFooter, AlertDialogHeader, AlertDialogTrigger } from "@/components/ui/alert-dialog";
import { useUser } from "@/context/userContext";
import toast from "react-hot-toast";


const ITEMS_PER_PAGE = 5;

type BlogType = {
  id: string;
  title: string;
  subtitle: string;
  content: string;
  thumbnail: string | null;
  readingTime: string;
  createdAt: Date;
  author: {
    id: string;
    name: string;
    socialId: string;
    email: string;
    bio: string | null;
    avatar: string;
    github: string | null;
    twitter: string | null;
    linkedin: string | null;
  };
  tags: {
    id: string;
    blogId: string;
    tag: string;
  }[];
  _count: {
    upvotes: number;
    comments: number;
  };
};

export default function AuthorBlogs() {
  const params = useParams();
  const router = useRouter();
  const [blogs, setBlogs] = useState<BlogType[]>([]);
  const [page, setPage] = useState(1);
  const [loading, setLoading] = useState(true);
  const [hasMore, setHasMore] = useState(true);
  const {user} = useUser()

  useEffect(() => {
    fetchBlogs();
  }, [page]);

  const fetchBlogs = async () => {
    try {
      setLoading(true);
      const authorId = params.id as string;
      const newBlogs = await getAuthorBlogs(authorId, page, ITEMS_PER_PAGE) as  BlogType[];
      
      if (newBlogs.length < ITEMS_PER_PAGE) {
        setHasMore(false);
      }

      if (page === 1) {
        setBlogs(newBlogs);
      } else {
        setBlogs((prev) => [...prev, ...newBlogs]);
      }
    } catch (error) {
      console.error("Error fetching blogs:", error);
    } finally {
      setLoading(false);
    }
  };

  async function handleDelete (blogId  :string){
    try{await deleteBlog(blogId,user?.uid!, user?.idToken!, )
      setBlogs((prev) => prev.filter((blog) => blog.id !== blogId))
    toast.success('Deleted')}
    catch(err){
      toast.error(`Unable to Delete  ${err instanceof Error && err.message}`)
    }
  }

  return (
    <div className="min-h-screen bg-gray-900 text-white p-8">
      <div className="max-w-4xl mx-auto space-y-8">
        <div className="flex items-center justify-between mb-8">
          <Button
            variant="outline"
            onClick={() => router.back()}
            className="border-neon-green-500/20 hover:bg-neon-green-500/10 text-neon-green-400"
          >
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back to Profile
          </Button>
          <h1 className="text-3xl font-bold bg-gradient-to-r from-white to-neon-green-400 bg-clip-text text-transparent">
            All Posts
          </h1>
        </div>

        <div className="space-y-6">
          {blogs.map((blog) => (
            <Card
              key={blog.id}
              className="group bg-gray-800/50 border-neon-green-500/20 hover:border-neon-green-500/40 transition-all hover:scale-[1.01]"
            >
              <CardContent className="p-6">
                <div className="flex gap-6">
                  {blog.thumbnail && (
                    <div className="relative w-48 h-32 rounded-lg overflow-hidden shrink-0">
                      <Image
                        src={blog.thumbnail}
                        alt={blog.title}
                        fill
                        className="object-cover transition-transform group-hover:scale-110"
                      />
                    </div>
                  )}
                  <div className="flex-1 min-w-0">
                    <h3 className="text-xl font-bold text-white mb-2 truncate">
                      {blog.title}
                    </h3>
                    <p className="text-gray-400 mb-3 line-clamp-2">{blog.subtitle}</p>
                    <div className="flex gap-2 mb-4 flex-wrap">
                      {blog.tags.map((tag, index) => (
                        <Badge
                          key={index}
                          className="bg-neon-green-500/20 text-neon-green-400 hover:bg-neon-green-500/30"
                        >
                          {tag.tag}
                        </Badge>
                      ))}
                    </div>
                  </div>
                </div>
              </CardContent>
              <CardFooter className="px-6 pb-6 pt-0">
                <div className="flex items-center justify-between w-full text-sm">
                  <div className="flex items-center gap-4 text-gray-400">
                    <span className="flex items-center gap-1">
                      <Clock size={14} />
                      {blog.readingTime}
                    </span>
                    <span className="flex items-center gap-1">
                      <ArrowUpCircle size={14} />
                      {blog._count.upvotes}
                    </span>
                    <span className="flex items-center gap-1">
                      <MessageSquare size={14} />
                      {blog._count.comments}
                    </span>
                  </div>
                  <div className="flex items-center gap-4">
                    <span className="text-gray-500">
                      {formatDistanceToNow(new Date(blog.createdAt), {
                        addSuffix: true,
                      })}
                    </span>
                    <Button
                      size="sm"
                      onClick={() => router.push(`/blog/${blog.id}`)}
                      className="bg-neon-green-500/20 text-neon-green-400 hover:bg-neon-green-500/30"
                    >
                      Read More
                    </Button>
                    {user && user.id === blog.author.id && (
        <AlertDialog>
          <AlertDialogTrigger asChild>
            <Button size="sm" variant="destructive" className="bg-red-500/20 text-red-400 hover:bg-red-500/30">
              Delete
            </Button>
          </AlertDialogTrigger>
          <AlertDialogContent className="bg-gray-900 border-neon-green-500/20">
            <AlertDialogHeader>
              <AlertDialogTitle className="text-neon-green-400">Delete Blog Post</AlertDialogTitle>
              <AlertDialogDescription className="text-gray-400">
                Are you sure you want to delete this blog post? This action cannot be undone.
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel className="bg-gray-800 text-gray-300 hover:bg-gray-700">Cancel</AlertDialogCancel>
              <AlertDialogAction
                onClick={() => handleDelete(blog.id)}
                className="bg-red-500/20 text-red-400 hover:bg-red-500/30"
              >
                Delete
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
      )}
                  </div>
                </div>
              </CardFooter>
            </Card>
          ))}

          {loading && (
            <div className="flex justify-center py-8">
              <div className="animate-pulse text-neon-green-400">Loading more posts...</div>
            </div>
          )}

          {!loading && hasMore && (
            <Button
              onClick={() => setPage((p) => p + 1)}
              className="w-full mt-6 bg-neon-green-500/20 text-neon-green-400 hover:bg-neon-green-500/30 border-neon-green-500/20"
            >
              Load More Posts
            </Button>
          )}

          {!loading && !hasMore && blogs.length > 0 && (
            <p className="text-center text-gray-400 mt-8">
              You've reached the end of the posts
            </p>
          )}

          {!loading && blogs.length === 0 && (
            <div className="text-center py-12">
              <p className="text-gray-400 text-lg">No posts found</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}