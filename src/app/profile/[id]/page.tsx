"use client"

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardFooter } from "@/components/ui/card";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Separator } from "@/components/ui/separator";
import { getUserProfileById, ProfileType } from "@/server/user";
import { formatDistanceToNow } from "date-fns";
import { ArrowRight, Clock, Github, Mail, MessageSquare, ThumbsUp, Twitter, Users } from "lucide-react";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { use, useEffect, useState } from "react";

const SocialLink = ({ icon: Icon, href, label }: { icon: any, href: string, label: string }) => (
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

const FollowList = ({ users, title }: { users: any[], title: string }) => {
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
                onClick={() => router.push(`/profile${user.id}`)}
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
}

const AuthorProfile = ({params} : {params : Promise<{id : string}>}) => {
  const [author, setAuthor] = useState<ProfileType | null>();
  const [visibleBlogs, setVisibleBlogs] = useState(5);
  const router = useRouter();

  const handleShowMore = () => {
    setVisibleBlogs((prev) => prev + 5);
  };

  const userId = use(params).id;

  useEffect(() => {
    const fetchAuthor = async() => {
      const response = await getUserProfileById(userId);
      setAuthor(response);
    }
    fetchAuthor();
  }, [userId])

  if(!author) return (
    <div className="min-h-screen bg-gray-900 flex items-center justify-center">
      <div className="animate-pulse text-neon-green-400 text-xl">Loading profile...</div>
    </div>
  );

  const {name, bio, avatar, followers, following, blogs} = author;

  return (
    <div className="min-h-screen bg-gray-900 text-white p-8">
      <div className="max-w-4xl mx-auto space-y-8">
        {/* Profile Header */}
        <div className="relative">
          <div className="absolute inset-0 bg-gradient-to-r from-neon-green-500/20 to-transparent blur-3xl -z-10" />
          <div className="flex items-center gap-6 p-6 rounded-2xl bg-gray-800/50 backdrop-blur-sm border border-neon-green-500/20">
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
              <div className="flex items-center justify-between">
                <h1 className="text-3xl font-bold bg-gradient-to-r from-white to-neon-green-400 bg-clip-text text-transparent">
                  {name}
                </h1>
                <div className="flex items-center gap-4">
                  <SocialLink
                    icon={Github}
                    href="https://github.com/username"
                    label="GitHub Profile"
                  />
                  <SocialLink
                    icon={Twitter}
                    href="https://twitter.com/username"
                    label="Twitter Profile"
                  />
                  <SocialLink
                    icon={Mail}
                    href="mailto:user@example.com"
                    label="Email"
                  />
                </div>
              </div>
              <p className="text-gray-400 mt-2 max-w-xl">{bio}</p>
            </div>
          </div>
        </div>

        {/* Stats Section */}
        <div className="flex gap-4">
          <Dialog>
            <DialogTrigger asChild>
              <Button variant="outline" className="flex-1 h-20 bg-gray-800/50 border-neon-green-500/20 hover:bg-gray-800 hover:border-neon-green-500/40 group">
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
            <DialogContent className="bg-gray-900 border-neon-green-500/20 max-w-2xl">
              <DialogHeader>
                <DialogTitle className="text-neon-green-400 text-xl mb-4">Followers</DialogTitle>
              </DialogHeader>
              <FollowList users={followers} title="Followers" />
            </DialogContent>
          </Dialog>

          <Dialog>
            <DialogTrigger asChild>
              <Button variant="outline" className="flex-1 h-20 bg-gray-800/50 border-neon-green-500/20 hover:bg-gray-800 hover:border-neon-green-500/40 group">
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
            <DialogContent className="bg-gray-900 border-neon-green-500/20 max-w-2xl">
              <DialogHeader>
                <DialogTitle className="text-neon-green-400 text-xl mb-4">Following</DialogTitle>
              </DialogHeader>
              <FollowList users={following} title="Following" />
            </DialogContent>
          </Dialog>
        </div>

        {/* Blogs Section */}
        <div>
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-2xl font-bold text-neon-green-400">Latest Posts</h2>
            <Button
              onClick={() => router.push('/blogs')}
              variant="outline"
              className="border-neon-green-500/20 hover:bg-neon-green-500/10 text-neon-green-400"
            >
              All Blogs
              <ArrowRight className="ml-2 h-4 w-4" />
            </Button>
          </div>

          <div className="space-y-4">
            {blogs.slice(0, visibleBlogs).map((blog) => (
              <Card key={blog.id} className="group bg-gray-800/50 border-neon-green-500/20 hover:border-neon-green-500/40 transition-all hover:scale-[1.01]">
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
                      <h3 className="text-xl font-bold text-white mb-2 truncate">{blog.title}</h3>
                      <p className="text-gray-400 mb-3 line-clamp-2">{blog.subtitle}</p>
                      <div className="flex gap-2 mb-4 flex-wrap">
                        {blog.tags.map((tag, index) => (
                          <Badge
                            key={index}
                            className="bg-neon-green-500/20 text-neon-green-400 hover:bg-neon-green-500/30"
                          >
                            {tag}
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
                        <ThumbsUp size={14} />
                        {blog._count.upvotes}
                      </span>
                      <span className="flex items-center gap-1">
                        <MessageSquare size={14} />
                        {blog._count.comments}
                      </span>
                    </div>
                    <div className="flex items-center gap-4">
                      <span className="text-gray-500">
                        {formatDistanceToNow(new Date(blog.createdAt), { addSuffix: true })}
                      </span>
                      <Button
                        size="sm"
                        onClick={() => router.push(`/blog/${blog.id}`)}
                        className="bg-neon-green-500/20 text-neon-green-400 hover:bg-neon-green-500/30"
                      >
                        Read More
                      </Button>
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