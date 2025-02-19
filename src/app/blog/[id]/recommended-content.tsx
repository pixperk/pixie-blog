"use client";

import { useState, useEffect } from "react";
import Image from "next/image";
import Link from "next/link";

import { motion } from "framer-motion";
import { formatDistanceToNow } from "date-fns";
import { generateRecommendedContent, RecommendedContentType } from "@/server/blog";
import { MessageSquare, ArrowUpCircle } from "lucide-react"; // Icons for comments and upvotes


interface RecommendedContentProps {
  blogId: string;
  author: {
    id: string;
    name: string;
    avatar: string;
  };
}

export function RecommendedContent({ blogId, author }: RecommendedContentProps) {
  const [recommendations, setRecommendations] = useState<RecommendedContentType | null>(null);

  useEffect(() => {
    const fetchRecommendations = async () => {
      try {
        const data = await generateRecommendedContent(blogId);
        setRecommendations(data);
      } catch (error) {
        console.error("Error fetching recommendations:", error);
      }
    };

    fetchRecommendations();
  }, [blogId]);

  // Do not render if there are no recommendations
  if (!recommendations || (recommendations.fromAuthor.length === 0 && recommendations.byTags.length === 0))
    return null;

  const fromAuthorOnly = recommendations.byTags.length === 0;
  const byTagsOnly = recommendations.fromAuthor.length === 0;

  return (
    <motion.section
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      className="mt-16 border-t border-neon-green-500 pt-8"
    >
      <h2 className="text-3xl font-bold text-neon-green-500 mb-6">Try out more</h2>
      <div
        className={`grid ${
          fromAuthorOnly || byTagsOnly ? "grid-cols-1" : "grid-cols-1 md:grid-cols-2"
        } gap-8`}
      >
        {/* More from this author */}
        {recommendations.fromAuthor.length > 0 && (
          <div>
            <div className="flex items-center mb-4">
              <Image
                src={author.avatar || "/placeholder-avatar.svg"}
                alt={author.name}
                width={40}
                height={40}
                className="rounded-full"
              />
              <h3 className="text-xl font-semibold text-neon-green-400 ml-3">
                More from {author.name}
              </h3>
            </div>
            <ul className="space-y-4">
              {recommendations.fromAuthor.map((blog) => (
                <RecommendedBlogCard key={blog.id} blog={blog} />
              ))}
            </ul>
          </div>
        )}

        {/* Similar topics */}
        {recommendations.byTags.length > 0 && (
          <div>
            <h3 className="text-xl font-semibold text-neon-green-400 mb-4">Similar topics</h3>
            <ul className="space-y-4">
              {recommendations.byTags.map((blog) => (
                <RecommendedBlogCard key={blog.id} blog={blog} />
              ))}
            </ul>
          </div>
        )}
      </div>
    </motion.section>
  );
}

interface RecommendedBlogCardProps {
  blog: RecommendedContentType["fromAuthor"][0] | RecommendedContentType["byTags"][0];
}

function RecommendedBlogCard({ blog }: RecommendedBlogCardProps) {
  return (
    <motion.li
      whileHover={{ scale: 1.03 }}
      className="bg-gray-900 rounded-lg overflow-hidden shadow-md hover:shadow-neon-green-400/20 transition-shadow duration-300"
    >
      <Link href={`/blog/${blog.id}`} className="flex items-start p-4 space-x-4">
        {/* Blog Thumbnail */}
        <div className="flex-shrink-0">
          <Image
            src={blog.thumbnail || "/placeholder.svg"}
            alt={blog.title}
            width={80}
            height={80}
            className="rounded-md object-cover"
          />
        </div>

        {/* Blog Details */}
        <div className="flex-grow">
          {/* Blog Title */}
          <h4 className="text-lg font-medium text-neon-green-400 line-clamp-2">{blog.title}</h4>

          {/* Blog Subtitle */}
          <p className="text-sm text-gray-300 mt-1 font-serif italic line-clamp-2">{blog.subtitle}</p>

          {/* Blog Tags */}
          <div className="flex flex-wrap mt-2 gap-2">
            {blog.tags.map((tag: {id : string, blogId : string, tag : string}) => (
              <span
                key={tag.id}
                className="text-xs bg-neon-green-500/10 text-neon-green-400 py-1 px-2 rounded-md"
              >
                #{tag.tag}
              </span>
            ))}
          </div>

          {/* Author Info */}
          <div className="flex items-center mt-3">
            <Image
              src={blog.author.avatar || "/placeholder-avatar.svg"}
              alt={blog.author.name}
              width={24}
              height={24}
              className="rounded-full"
            /> 
            <div className="ml-2 text-sm">
              <p className="text-gray-300 font-medium">{blog.author.name}</p>
              <p className="text-gray-400 text-xs italic line-clamp-1">{blog.author.bio}</p>
            </div>
          </div>

          {/* Created Time and Reading Time */}
          <div className="text-xs text-gray-400 mt-2">
            <span>{formatDistanceToNow(new Date(blog.createdAt))} ago</span> •
            <span> {blog.readingTime}</span>
          </div>

          {/* Comments and Upvotes */}
          <div className="flex items-center space-x-4 text-sm text-gray-400 mt-3">
            {/* Comments */}
            <div className="flex items-center space-x-1">
              <MessageSquare size={16} className="text-neon-green-400" />
              <span>{blog._count.comments}</span>
            </div>

            {/* Upvotes */}
            <div className="flex items-center space-x-1">
              <ArrowUpCircle size={16} className="text-neon-green-400" />
              <span>{blog._count.upvotes}</span>
            </div>
          </div>
        </div>
      </Link>
    </motion.li>
  );
}
