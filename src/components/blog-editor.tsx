"use client"

import { Button } from "@/components/ui/button"
import { useUser } from "@/context/userContext"
import { calculateReadingTime } from "@/lib/utils"
import { createBlog } from "@/server/blog"
import "@uiw/react-markdown-preview/markdown.css"
import "@uiw/react-md-editor/markdown-editor.css"
import { SaveIcon, SendIcon, ImageIcon } from "lucide-react"
import { useTheme } from "next-themes"
import dynamic from "next/dynamic"
import { useEffect, useState, useCallback } from "react"
import ReactMarkdown from "react-markdown"
import remarkGfm from "remark-gfm"
import debounce from "lodash.debounce"
import { useRouter } from "next/navigation"
import { AuthorInfo } from "./author-info"
import { BlogMetadata } from "./blog-metadata"
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
} from "./markdown-components"
import { ImageUploaderModal } from "./image-uploader"
import type { ClientUploadedFileData } from "uploadthing/types"
import type { OurFileRouter } from "@/app/api/uploadthing/core"
import { fetchUserImages, saveImageForUser } from "@/server/image"
import toast from "react-hot-toast"
import { SelectTags } from "./select-tags"

const MDEditor = dynamic(() => import("@uiw/react-md-editor"), { ssr: false })

interface BlogPost {
  title: string
  subtitle: string
  content: string
  publishDate: Date
  readingTime: string
  author: {
    name: string
    avatar: string
    bio: string
  }
  tags: string[]
}

export function BlogEditor() {
  const { loading, user } = useUser()
  const { theme } = useTheme()
  const router = useRouter()
  const [isSubmitting, setIsSubmitting] = useState(false)
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
    tags: [],
  })
  const [userImages, setUserImages] = useState<string[]>([])
  const [thumbnailUrl, setThumbnailUrl] = useState<string>(
    "https://a3dg9kymej.ufs.sh/f/8azif4ZMinvp6Rn93Yxu3McYpieCbsZjXGPxk2oTOBz0QJEI",
  )
  const [tags, setTags] = useState<{ value: string; label: string }[]>([])
  const [selectedTags, setSelectedTags] = useState<string[]>([])
  const updateReadingTime = useCallback(
    debounce((content) => {
      setPost((prev) => ({
        ...prev,
        readingTime: calculateReadingTime(content),
      }))
    }, 500),
    [],
  )

  useEffect(() => {
    setPost((prev) => ({
      ...prev,
      author: {
        name: user?.name || "",
        avatar: user?.avatar || "",
        bio: user?.bio || "",
      },
    }))
  }, [user])

  useEffect(() => {
    const fetchImages = async () => {
      try {
        const images = await fetchUserImages(user?.id!)
        setUserImages(images)
      } catch (error) {
        toast.error(`Failed to fetch images: ${error as Error}`)
      }
    }

    if (user?.id) {
      fetchImages()
    }
  }, [user])

  useEffect(() => {
    const fetchTags = async () => {
      try {
        const response = await fetch(
          "https://api.stackexchange.com/2.3/tags?order=desc&sort=popular&site=stackoverflow",
        )
        const data = await response.json()
        const fetchedTags = data.items.map((tag: { name: string }) => ({
          value: tag.name,
          label: tag.name,
        }))
        setTags(fetchedTags)
      } catch (error) {
        toast.error("Failed to fetch tags.")
      }
    }
    fetchTags()
  }, [])

  const handleCreate = async () => {
    if (!post.title.trim() || !post.content.trim()) {
      toast.error("Title and content cannot be empty.")
      return
    }

    setIsSubmitting(true)
    try {
      await createBlog(
        post.title,
        post.content,
        post.readingTime,
        user?.id!,
        thumbnailUrl,
        user?.idToken!,
        user?.uid!,
        selectedTags,
        post.subtitle,
      )
      toast.success("Blog post created successfully!")
      router.push("/")
    } catch (error) {
      toast.error("Failed to create the blog post. Please try again.")
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleImageUpload = async (res: ClientUploadedFileData<OurFileRouter>[]) => {
    const newImageUrl = res[0].url
    await saveImageForUser(newImageUrl, user?.id!)
    setUserImages((prev) => [...prev, newImageUrl])
    toast.success("Image saved")
  }

  const handleImageInsert = (imageUrl: string) => {
    setPost((prev) => ({
      ...prev,
      content: `${prev.content}\n![Uploaded Image](${imageUrl})`,
    }))
  }

  return (
    <div className="p-8 bg-gray-900 rounded-lg shadow-xl space-y-8" data-color-mode={theme}>
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
        handleImageUpload={handleImageUpload}
        images={userImages}
        setImages={setUserImages}
        thumbnailUrl={thumbnailUrl}
        setThumbnailUrl={setThumbnailUrl}
      />

      <SelectTags
        tags={tags}
        setTags={setTags}
        selectedTags={selectedTags}
        setSelectedTags={setSelectedTags}
        setPost={setPost}
      />

      <div className="flex flex-col lg:flex-row gap-8">
        <div className="flex-1 space-y-4">
          <div className="flex justify-between items-center">
            <h2 className="text-2xl font-semibold text-neon-green-400">Editor</h2>
            <ImageUploaderModal
              handleUpload={handleImageUpload}
              handleInsert={handleImageInsert}
              images={userImages}
              setImages={setUserImages}
            />
             
          </div>

          <MDEditor
            value={post.content}
            onChange={(value) => {
              setPost((prev) => ({ ...prev, content: value || "" }))
              updateReadingTime(value || "")
            }}
            preview="edit"
            height={600}
            className="border border-neon-green-400 rounded-md overflow-hidden"
            textareaProps={{
              placeholder: "Start writing your blog post here...",
            }}
          />
        </div>

        <div className="flex-1 space-y-4">
          <h2 className="text-2xl font-semibold text-neon-green-400">Preview</h2>
          <div className="bg-gray-800 p-6 rounded-md border border-neon-green-400 h-[600px] overflow-auto">
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
              {post.content}
            </ReactMarkdown>
          </div>
        </div>
      </div>

      <div className="flex justify-end space-x-4 mt-8">
        <Button
          variant="outline"
          className="border-neon-green-400 text-neon-green-400 hover:bg-neon-green-400 hover:text-gray-900 transition-all duration-300"
          disabled={isSubmitting}
        >
          <SaveIcon className="w-4 h-4 mr-2" /> Save Draft
        </Button>
        <Button
          onClick={handleCreate}
          disabled={!post.title.trim() || !post.content.trim() || isSubmitting}
          className={`flex items-center justify-center rounded-lg px-6 py-2 font-medium transition-all duration-300 ${
            isSubmitting
              ? "bg-gray-300 text-gray-500 cursor-not-allowed"
              : "bg-neon-green-400 text-gray-900 hover:bg-neon-green-300 hover:shadow-lg"
          }`}
        >
          {isSubmitting ? (
            <span className="flex items-center gap-2">
              <svg
                className="animate-spin h-5 w-5 text-gray-700"
                xmlns="http://www.w3.org/2000/svg"
                fill="none"
                viewBox="0 0 24 24"
              >
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v4l3.3-3.3a8 8 0 11-8 8z"></path>
              </svg>
              <span>Publishing...</span>
            </span>
          ) : (
            <span className="flex items-center gap-2">
              <SendIcon className="w-5 h-5" /> Publish Post
            </span>
          )}
        </Button>
      </div>
    </div>
  )
}

