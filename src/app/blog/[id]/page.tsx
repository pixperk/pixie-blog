"use client"
import { use, useEffect, useState } from "react";
import Image from "next/image";
import remarkGfm from "remark-gfm";
import { TracingBeam } from "@/components/tracing-beam";
import { CommentSection } from "@/components/comment-section";
import ReactMarkdown from "react-markdown";
import { type blogType, getBlogById } from "@/server/blog";
import { motion } from "framer-motion";
import {
  CustomBlockquote,
  CustomCode,
  CustomHeading,
  CustomHR,
  CustomImage,
  CustomLink,
  CustomList,
  CustomListItem,
  CustomParagraph,
  CustomTable,
  CustomTableBody,
  CustomTableCell,
  CustomTableHead,
  CustomTableRow,
} from "@/components/markdown-components";
import SkeletonBlogPost from "./SkeletonBlogPost";
import { SocialInteractions } from "@/components/social-interactions";
import { Button } from "@/components/ui/button";
import { MessageSquare } from "lucide-react";
import { RecommendedContent } from "./recommended-content";
import FollowButton from "@/components/follow-button";
import { useRouter } from "next/navigation";
import Head from "next/head";


export default function BlogPost({ params }: { params: Promise<{ id: string }> }) {
  const [blog, setBlog] = useState<blogType | null>(null);
  const [loading, setLoading] = useState(true);
  const [isCommentSectionOpen, setIsCommentSectionOpen] = useState(false);

  const blogId = use(params).id;
  const router = useRouter();

  useEffect(() => {
    const fetchBlog = async () => {
      try {
        const data = await getBlogById(blogId);
        setBlog(data);
      } catch (error) {
        console.error("Error fetching blog:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchBlog();
  }, [blogId]);

  if (loading) {
    return <SkeletonBlogPost />;
  }

  if (!blog) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <div className="text-gray-400 text-2xl">Blog not found.</div>
      </div>
    );
  }

  return (
    <>
     <Head>
        <title>{blog.title}</title>
        <meta property="og:title" content={blog.title} />
        <meta property="og:description" content={blog.subtitle || `${blog.title} by ${blog.author.name}` } />
        <meta property="og:image" content={blog.thumbnail} />
        <meta property="og:url" content={`https://${process.env.NEXT_PUBLIC_APP_URL}/blog/${blog.id}`} />
        <meta property="og:type" content="article" />
        <meta name="twitter:card" content="summary_large_image" />
        <meta name="twitter:title" content={blog.title} />
        <meta name="twitter:description" content={blog.subtitle || `${blog.title} by ${blog.author.name}`} />
        <meta name="twitter:image" content={blog.thumbnail} />
      </Head>
    <div className="flex min-h-screen flex-col">
      <TracingBeam />

      <main className="relative mx-auto w-full max-w-5xl px-6 py-10 sm:px-8 lg:px-12">
        <article className="prose prose-invert prose-green max-w-none">
          <motion.header
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="mb-8 space-y-4 not-prose"
          >
            <div className="flex items-center gap-4">
              <Image
                src={blog.author.avatar || "/placeholder.svg"}
                alt={blog.title}
                width={60}
                height={60}
                className="rounded-full border-2 border-neon-green-400 cursor-pointer"
                onClick={() => router.push(`/profile/${blog.author.id}`)}
              />
              <div>
                <h3
                  className="font-medium text-neon-green-400 text-xl cursor-pointer"
                  onClick={() => router.push(`/profile/${blog.author.id}`)}
                >
                  {blog.author.name}
                </h3>
                <p className="text-sm text-gray-400">{blog.author.bio ?? ""}</p>
                <div className="flex items-center gap-2 text-sm text-gray-400 mt-1">
                  <time>
                    {new Date(blog.createdAt).toLocaleDateString("en-US", {
                      year: "numeric",
                      month: "long",
                      day: "numeric",
                    })}
                  </time>
                  <span>·</span>
                  <span>{blog.readingTime}</span>
                </div>
              </div>
              <FollowButton author={blog.author} />
            </div>
            <h1 className="text-4xl font-bold text-neon-green-500 sm:text-6xl leading-tight">{blog.title}</h1>
            {blog.subtitle && (
              <h2 className="text-xl sm:text-2xl font-thin text-neon-green-400 leading-snug mt-2">{blog.subtitle}</h2>
            )}

            {blog.tags?.length > 0 && (
              <div className="flex flex-wrap gap-2 mt-4">
                {blog.tags.map((tag : {id : string, blogId:string, tag : string}) => (
                  <span
                    key={tag.id}
                    className="px-3 py-1 text-sm font-medium text-white bg-neon-green-700 rounded-full border border-neon-green-400"
                  >
                    {tag.tag}
                  </span>
                ))}
              </div>
            )}
          </motion.header>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.2 }}
            className="mb-8"
          >
            <SocialInteractions
              blogId={blogId}
              initialUpvotes={blog._count.upvotes}
              commentCount={blog._count.comments}
              onCommentClick={() => setIsCommentSectionOpen(true)}
            />
          </motion.div>

          {blog.thumbnail && (
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.5 }}
              className="mb-8"
            >
              <Image
                src={blog.thumbnail}
                alt={`${blog.title} Thumbnail`}
                width={400}
                height={600}
                className="rounded-2xl shadow-lg w-full h-auto object-cover"
                priority
              />
            </motion.div>
          )}

          <ReactMarkdown
            remarkPlugins={[remarkGfm]}
            className="text-gray-300 leading-relaxed space-y-6"
            components={{
              img: CustomImage,
              h1: (props) => <CustomHeading level={1} {...props} />,
              h2: (props) => <CustomHeading level={2} {...props} />,
              h3: (props) => <CustomHeading level={3} {...props} />,
              p: CustomParagraph,
              blockquote: CustomBlockquote,
              code: CustomCode,
              ul: (props) => <CustomList {...props} />,
              ol: (props) => <CustomList ordered {...props} />,
              li: CustomListItem,
              a: CustomLink,
              hr: CustomHR,
              table: CustomTable,
              thead: CustomTableHead,
              tbody: CustomTableBody,
              tr: CustomTableRow,
              th: ({ children }) => <CustomTableCell isHeader>{children}</CustomTableCell>,
              td: CustomTableCell,
            }}
          >
            {blog.content}
          </ReactMarkdown>
        </article>

        <CommentSection blogId={blogId} open={isCommentSectionOpen} onOpenChange={setIsCommentSectionOpen} />

        <Button
          className="fixed bottom-4 right-4 bg-neon-green-500 text-black hover:bg-neon-green-600 z-50"
          onClick={() => setIsCommentSectionOpen(true)}
        >
          <MessageSquare className="w-5 h-5 mr-2" />
          Comments
        </Button>
        <RecommendedContent blogId={blogId} author={blog.author} />
      </main>
    </div>
    </>
  );
}
