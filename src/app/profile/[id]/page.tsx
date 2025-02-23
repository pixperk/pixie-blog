"use client";

import FollowButton from "@/components/follow-button";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardFooter } from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Separator } from "@/components/ui/separator";
import { useUser } from "@/context/userContext";
import { deleteBlog } from "@/server/blog";
import { getUserProfileById } from "@/server/user";
import { formatDistanceToNow } from "date-fns";
import {
  ArrowRight,
  ArrowUpCircle,
  Clock,
  Code,
  MessageSquare,
  Users
} from "lucide-react";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { use, useEffect, useState } from "react";
import { toast } from "react-hot-toast";
import { FaGithub, FaLinkedin, FaTwitter } from "react-icons/fa";

interface ProfileType {
  id: string;
  name: string;
  socialId: string;
  email: string;
  bio: string | null;
  avatar: string;
  github: string | null;
  twitter: string | null;
  linkedin: string | null;
  blogs: BlogType[];
  followers: FollowerType[];
  following: FollowerType[];
}

interface BlogType {
  id: string;
  _count: {
    comments: number;
    upvotes: number;
  };
  title: string;
  subtitle: string | null;
  thumbnail: string;
  content: string;
  readingTime: string;
  createdAt: Date;
  tags: {
    tag: string;
  }[];
}

interface FollowerType {
  id: string;
  name: string;
  bio: string | null;
  avatar: string;
}

interface SocialLinkProps {
  icon: React.ComponentType<{ size: number }>;
  href: string;
  label: string;
}

interface EmbedCodeDialogProps {
  userId: string;
}

interface FollowListProps {
  users: FollowerType[];
  title: string;
}

const SocialLink = ({ icon: Icon, href, label }: SocialLinkProps) => (
  <a
    href={href}
    target="_blank"
    rel="noopener noreferrer"
    className="flex items-center gap-2 text-gray-400 hover:text-neon-green-400 transition-colors"
    aria-label={label}
  >
    <Icon size={18} />
  </a>
);

const EmbedCodeDialog = ({}: EmbedCodeDialogProps) => {
  return (
    <Dialog>
      <DialogTrigger asChild>
        <Button
          variant="outline"
          size="sm"
          className="border-neon-green-500/20 hover:bg-neon-green-500/10 text-neon-green-400"
        >
          <Code className="w-4 h-4 mr-2" />
          Embed Profile
        </Button>
      </DialogTrigger>
      <DialogContent className="bg-gray-900 border-neon-green-500/20">
        <DialogHeader>
          <DialogTitle className="text-neon-green-400">
            Embed Your Profile
          </DialogTitle>
        </DialogHeader>
        <div className="space-y-4">
          <p className="text-gray-400">Coming soon!</p>
        </div>
      </DialogContent>
    </Dialog>
  );
};

const FollowList = ({ users }: FollowListProps) => {
  const router = useRouter();

  return (
    <ScrollArea className="h-[400px] pr-4">
      <div className="space-y-4">
        {users.map((user, index) => (
          <div key={index} className="group">
            <div className="flex items-center gap-3 p-3 rounded-lg transition-all hover:bg-gray-800/50 hover:scale-[1.02]">
              <div className="relative">
                <div className="absolute inset-0 bg-neon-green-400/20 rounded-full blur-md opacity-0 group-hover:opacity-100 transition-opacity" />
                <Image
                  src={user.avatar}
                  alt={user.name}
                  width={48}
                  height={48}
                  className="rounded-full relative"
                />
              </div>
              <div className="flex-1 min-w-0">
                <p className="font-medium text-white truncate">{user.name}</p>
                <p className="text-sm text-gray-400 truncate">{user.bio}</p>
              </div>
              <Button
                variant="outline"
                size="sm"
                onClick={() => router.push(`/profile/${user.id}`)}
                className="opacity-0 group-hover:opacity-100 transition-opacity border-neon-green-500/20 hover:bg-neon-green-500/10 text-neon-green-400"
              >
                View Profile
              </Button>
            </div>
            {index < users.length - 1 && (
              <Separator className="my-2 bg-gray-800" />
            )}
          </div>
        ))}
      </div>
    </ScrollArea>
  );
};

const AuthorProfile = ({ params }: { params: Promise<{ id: string }> }) => {
  const [author, setAuthor] = useState<ProfileType | null>(null);
  const [visibleBlogs, setVisibleBlogs] = useState(5);
  const router = useRouter();
  const { user } = useUser();

  const handleShowMore = () => {
    setVisibleBlogs((prev) => prev + 5);
  };

  const userId = use(params).id;

  useEffect(() => {
    const fetchAuthor = async () => {
      const response = await getUserProfileById(userId);
      setAuthor(response);
    };
    fetchAuthor();
  }, [userId]);

  if (!author)
    return (
      <div className="min-h-screen bg-gray-900 flex items-center justify-center">
        <div className="animate-pulse text-neon-green-400 text-xl">
          Loading profile...
        </div>
      </div>
    );

  const { name, bio, avatar, followers, following, blogs } = author;

  async function handleDelete(blogId: string) {
    try {
      await deleteBlog(blogId, user!.uid!, user!.idToken!);
      setAuthor((prev) =>
        prev
          ? {
              ...prev,
              blogs: prev.blogs.filter((blog) => blog.id !== blogId),
            }
          : null
      );
      toast.success("Deleted");
    } catch (err) {
      toast.error(
        `Unable to Delete  ${
          err instanceof Error && err.message ? err.message : ""
        }`
      );
    }
  }

  return (
    <div className="min-h-screen bg-gray-900 text-white p-4 sm:p-8">
      <div className="max-w-4xl mx-auto space-y-8">
        {/* Profile Header */}
        <div className="relative">
          <div className="absolute inset-0 bg-gradient-to-r from-neon-green-500/20 to-transparent blur-3xl -z-10" />
          <div className="flex flex-col sm:flex-row items-center gap-6 p-6 rounded-2xl bg-gray-800/50 backdrop-blur-sm border border-neon-green-500/20">
            <div className="relative">
              <div className="absolute inset-0 bg-neon-green-400 blur-xl opacity-20 rounded-full" />
              <Image
                src={avatar}
                alt={name}
                height={200}
                width={200}
                className="w-24 h-24 rounded-full relative border-2 border-neon-green-500"
              />
            </div>
            <div className="flex-1">
              <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4 mb-4">
                <h1 className="text-2xl sm:text-3xl font-bold bg-gradient-to-r from-white to-neon-green-400 bg-clip-text text-transparent">
                  {name}
                </h1>
                <div className="flex items-center gap-2">
                  {user && userId === user.id ? (
                    <>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => router.push(`/profile/${userId}/edit`)}
                        className="border-neon-green-500/20 hover:bg-neon-green-500/10 text-neon-green-400"
                      >
                        Edit Profile
                      </Button>
                      <EmbedCodeDialog userId={userId} />
                    </>
                  ) : (
                    <FollowButton author={author} />
                  )}
                </div>
              </div>
              <p className="text-gray-400 mb-4 max-w-xl">{bio}</p>
              <div className="flex items-center gap-4">
                {author.github && (
                  <SocialLink
                    icon={FaGithub}
                    href={author.github}
                    label="GitHub Profile"
                  />
                )}
                {author.twitter && (
                  <SocialLink
                    icon={FaTwitter}
                    href={author.twitter}
                    label="Twitter Profile"
                  />
                )}
                {author.linkedin && (<SocialLink
                  icon={FaLinkedin}
                  href={author.linkedin}
                  label="LinkedIn Profile"
                />)}
              </div>
            </div>
          </div>
        </div>

        {/* Stats Section */}
        <div className="flex flex-col sm:flex-row gap-4">
          <Dialog>
            <DialogTrigger asChild>
              <Button
                variant="outline"
                className="flex-1 h-20 bg-gray-800/50 border-neon-green-500/20 hover:bg-gray-800 hover:border-neon-green-500/40 group"
              >
                <div className="text-center">
                  <div className="text-2xl font-bold text-neon-green-400 group-hover:scale-105 transition-transform">
                    {followers.length}
                  </div>
                  <div className="text-gray-400 flex items-center gap-2 justify-center">
                    <Users size={14} />
                    Followers
                  </div>
                </div>
              </Button>
            </DialogTrigger>
            <DialogContent className="bg-gray-900 border-neon-green-500/20 max-w-full sm:max-w-2xl">
              <DialogHeader>
                <DialogTitle className="text-neon-green-400 text-xl mb-4">
                  Followers
                </DialogTitle>
              </DialogHeader>
              <FollowList users={followers} title="Followers" />
            </DialogContent>
          </Dialog>

          <Dialog>
            <DialogTrigger asChild>
              <Button
                variant="outline"
                className="flex-1 h-20 bg-gray-800/50 border-neon-green-500/20 hover:bg-gray-800 hover:border-neon-green-500/40 group"
              >
                <div className="text-center">
                  <div className="text-2xl font-bold text-neon-green-400 group-hover:scale-105 transition-transform">
                    {following.length}
                  </div>
                  <div className="text-gray-400 flex items-center gap-2 justify-center">
                    <Users size={14} />
                    Following
                  </div>
                </div>
              </Button>
            </DialogTrigger>
            <DialogContent className="bg-gray-900 border-neon-green-500/20 max-w-full sm:max-w-2xl">
              <DialogHeader>
                <DialogTitle className="text-neon-green-400 text-xl mb-4">
                  Following
                </DialogTitle>
              </DialogHeader>
              <FollowList users={following} title="Following" />
            </DialogContent>
          </Dialog>
        </div>

        {/* Blogs Section */}
        <div>
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between mb-6">
            <h2 className="text-2xl font-bold text-neon-green-400">
              Latest Posts
            </h2>
            <Button
              onClick={() => router.push(`/profile/${userId}/blogs`)}
              variant="outline"
              className="mt-4 sm:mt-0 border-neon-green-500/20 hover:bg-neon-green-500/10 text-neon-green-400"
            >
              All Blogs
              <ArrowRight className="ml-2 h-4 w-4" />
            </Button>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {blogs.slice(0, visibleBlogs).map((blog) => (
              <Card
                key={blog.id}
                className="group bg-gray-800/50 border border-neon-green-500/20 hover:border-neon-green-500/40 transition-all hover:scale-[1.02] shadow-md hover:shadow-lg flex flex-col"
              >
                {blog.thumbnail && (
                  <div className="relative w-full h-48 overflow-hidden">
                    <Image
                      src={blog.thumbnail}
                      alt={blog.title}
                      fill
                      className="object-cover transition-transform group-hover:scale-110"
                    />
                  </div>
                )}
                <CardContent className="p-4 flex-1">
                  <h3 className="text-xl font-bold text-white mb-2 truncate">
                    {blog.title}
                  </h3>
                  <p className="text-gray-400 mb-3 line-clamp-3">
                    {blog.subtitle}
                  </p>
                  <div className="flex flex-wrap gap-2">
                    {blog.tags.map((tag, index) => (
                      <Badge
                        key={index}
                        className="bg-neon-green-500/20 text-neon-green-400"
                      >
                        {tag.tag}
                      </Badge>
                    ))}
                  </div>
                </CardContent>
                <CardFooter className="px-4 pb-4 pt-0">
                  <div className="flex flex-col gap-2">
                    {/* First row: metadata and timestamp */}
                    <div className="flex items-center justify-between text-gray-400 text-sm">
                      <div className="flex items-center gap-4">
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
                      <span className="text-gray-500 text-xs ml-4">
                        {formatDistanceToNow(new Date(blog.createdAt), {
                          addSuffix: true,
                        })}
                      </span>
                    </div>
                    {/* Second row: action buttons */}
                    <div className="flex items-center gap-2">
                      <Button
                        size="sm"
                        onClick={() => router.push(`/blog/${blog.id}`)}
                        className="bg-neon-green-500/20 text-neon-green-400 hover:bg-neon-green-500/30"
                      >
                        Read More
                      </Button>
                      {user && user.id === userId && (
                        <AlertDialog>
                          <AlertDialogTrigger asChild>
                            <Button
                              size="sm"
                              variant="destructive"
                              className="bg-red-500/20 text-red-400 hover:bg-red-500/30"
                            >
                              Delete
                            </Button>
                          </AlertDialogTrigger>
                          <AlertDialogContent className="bg-gray-900 border-neon-green-500/20">
                            <AlertDialogHeader>
                              <AlertDialogTitle className="text-neon-green-400">
                                Delete Blog Post
                              </AlertDialogTitle>
                              <AlertDialogDescription className="text-gray-400">
                                Are you sure you want to delete this blog post? This action cannot be undone.
                              </AlertDialogDescription>
                            </AlertDialogHeader>
                            <AlertDialogFooter>
                              <AlertDialogCancel className="bg-gray-800 text-gray-300 hover:bg-gray-700">
                                Cancel
                              </AlertDialogCancel>
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
          </div>

          {visibleBlogs < blogs.length && (
            <Button
              onClick={handleShowMore}
              className="w-full mt-6 bg-neon-green-500/20 text-neon-green-400 hover:bg-neon-green-500/30 border-neon-green-500/20"
            >
              Show More Posts
            </Button>
          )}
        </div>
      </div>
    </div>
  );
};

export default AuthorProfile;
