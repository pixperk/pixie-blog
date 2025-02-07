"use client";

import { Button } from "@/components/ui/button";
import { useUser } from "@/context/userContext";
import { calculateReadingTime } from "@/lib/utils";
import { createBlog } from "@/server/blog";
import "@uiw/react-markdown-preview/markdown.css";
import "@uiw/react-md-editor/markdown-editor.css";
import { ImageIcon, SaveIcon, SendIcon } from "lucide-react";
import { useTheme } from "next-themes";
import dynamic from "next/dynamic";
import { useEffect, useState, useCallback } from "react";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import debounce from "lodash.debounce";
import { AuthorInfo } from "./author-info";
import { BlogMetadata } from "./blog-metadata";
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
} from "./markdown-components";

const MDEditor = dynamic(() => import("@uiw/react-md-editor"), { ssr: false });

interface BlogPost {
  title: string;
  subtitle: string;
  content: string;
  publishDate: Date;
  readingTime: string;
  author: {
    name: string;
    avatar: string;
    bio: string;
  };
}

export function BlogEditor() {
  const { loading, user } = useUser();
  const { theme } = useTheme();
  const [post, setPost] = useState<BlogPost>({
    title: "",
    subtitle: "",
    content: "# Introduction\n\nStart writing your blog post here...",
    publishDate: new Date(),
    readingTime: "0 min read",
    author: {
      name: user?.name || "",
      avatar: user?.avatar || "",
      bio: user?.bio || "",
    },
  });

  // Debounced update for reading time
  const updateReadingTime = useCallback(
    debounce((content) => {
      setPost((prev) => ({
        ...prev,
        readingTime: calculateReadingTime(content),
      }));
    }, 500),
    []
  );

  useEffect(() => {
    setPost((prev) => ({
      ...prev,
      author: {
        name: user?.name || "",
        avatar: user?.avatar || "",
        bio: user?.bio || "",
      },
    }));
  }, [user]);

  const handleImageUpload = async (file: File) => {
    if (file.size > 5 * 1024 * 1024) {
      alert("File is too large! Please upload an image under 5MB.");
      return;
    }
    const url = URL.createObjectURL(file);
    setPost((prev) => ({
      ...prev,
      content: prev.content + `\n![${file.name}](${url})\n`,
    }));
  };

  const handleCreate = async () => {
    if (!post.title.trim() || !post.content.trim()) return;
    await createBlog(post.title, post.content, post.readingTime, user?.id!, post.subtitle);
  };

  return (
    <div className="p-6 bg-gray-900 rounded-lg shadow-xl space-y-6" data-color-mode={theme}>
      {loading ? (
        <div className="animate-pulse space-y-4">
          <div className="h-6 w-3/4 bg-gray-700 rounded"></div>
          <div className="h-4 w-1/2 bg-gray-700 rounded"></div>
        </div>
      ) : (
        <AuthorInfo author={post.author} />
      )}

      <BlogMetadata
        title={post.title}
        subtitle={post.subtitle}
        publishDate={post.publishDate}
        readingTime={post.readingTime}
        onTitleChange={(title) => setPost((prev) => ({ ...prev, title }))}
        onSubtitleChange={(subtitle) => setPost((prev) => ({ ...prev, subtitle }))}
      />

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        <div className="space-y-4">
          <div className="flex justify-between items-center">
            <h2 className="text-xl font-semibold text-neon-green-400">Editor</h2>
            <Button variant="outline" onClick={() => document.getElementById("image-upload")?.click()}>
              <ImageIcon className="w-4 h-4 mr-2" /> Add Image
            </Button>
            <input
              id="image-upload"
              type="file"
              accept="image/*"
              className="hidden"
              onChange={(e) => e.target.files?.[0] && handleImageUpload(e.target.files[0])}
            />
          </div>
          <MDEditor
            value={post.content}
            onChange={(value) => {
              setPost((prev) => ({ ...prev, content: value || "" }));
              updateReadingTime(value || "");
            }}
            preview="edit"
            height={400}
            className="border border-neon-green-400 rounded-md overflow-hidden"
          />
        </div>

        <div className="space-y-4 bg-gray-800 p-6 rounded-md border border-neon-green-400 max-h-[480px] overflow-auto">
          <h2 className="text-xl font-semibold text-neon-green-400">Preview</h2>
          <ReactMarkdown
            remarkPlugins={[remarkGfm]}
            className="text-gray-300 leading-relaxed space-y-6 mt-4"
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
            {post.content}
          </ReactMarkdown>
        </div>
      </div>

      <div className="flex justify-end space-x-4">
        <Button variant="outline" className="border-neon-green-400 text-neon-green-400 hover:bg-neon-green-400 hover:text-gray-900">
          <SaveIcon className="w-4 h-4 mr-2" /> Save Draft
        </Button>
        <Button
          onClick={handleCreate}
          disabled={!post.title.trim() || !post.content.trim()}
          className={`bg-neon-green-400 text-gray-900 hover:bg-neon-green-300 ${!post.title.trim() || !post.content.trim() ? "opacity-50 cursor-not-allowed" : ""}`}
        >
          <SendIcon className="w-4 h-4 mr-2" /> Publish Post
        </Button>
      </div>
    </div>
  );
}
