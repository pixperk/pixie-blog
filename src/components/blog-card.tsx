import Link from "next/link"
import Image from "next/image"
import { formatDistanceToNow } from "date-fns"
import { MessageCircle, Star } from "lucide-react"

interface BlogCardProps {
  id: string
  title: string
  excerpt: string
  author: {
    name: string
    image: string
  }
  publishedAt: Date
  readingTime: string
  category: string
  image?: string
}

export function BlogCard({ id, title, excerpt, author, publishedAt, readingTime, category, image }: BlogCardProps) {
  return (
    <Link href={`/blog/${id}`}>
      <article className="group grid grid-cols-1 md:grid-cols-12 gap-4 items-start p-4 cursor-pointer hover:bg-gray-800/20 rounded-lg transition-colors">
        <div className="md:col-span-8 space-y-3">
          <div className="flex items-center gap-2">
            <Image
              src={author.image || "/placeholder.jpeg"}
              alt={author.name}
              width={24}
              height={24}
              className="rounded-full"
            />
            <span className="text-sm text-gray-400">{author.name}</span>
            <span className="text-gray-600">·</span>
            <span className="text-sm text-gray-400">{formatDistanceToNow(publishedAt, { addSuffix: true })}</span>
          </div>
          <h2 className="text-xl font-bold group-hover:text-neon-green-400 transition-colors">{title}</h2>
          <p className="text-gray-400 line-clamp-2">{excerpt}</p>
          <div className="flex items-center gap-4 text-sm text-gray-400">
            <span>{readingTime}</span>
            <span className="text-gray-600">·</span>
            <span>{category}</span>
            <div className="flex items-center gap-2">
              <MessageCircle className="h-4 w-4" />
              <span>12</span>
            </div>
            <div className="flex items-center gap-2">
              <Star className="h-4 w-4" />
              <span>48</span>
            </div>
          </div>
        </div>
        {image && (
          <div className="md:col-span-4">
            <Image
              src={image || "/placeholder.jpeg"}
              alt={title}
              width={200}
              height={134}
              className="rounded-lg object-cover w-full aspect-[3/2]"
            />
          </div>
        )}
      </article>
    </Link>
  )
}

