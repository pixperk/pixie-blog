import { Input } from "@/components/ui/input"
import { format } from "date-fns"

interface BlogMetadataProps {
  title: string
  subtitle: string
  publishDate: Date
  readingTime: string
  onTitleChange: (title: string) => void
  onSubtitleChange: (subtitle: string) => void
}

export function BlogMetadata({
  title,
  subtitle,
  publishDate,
  readingTime,
  onTitleChange,
  onSubtitleChange,
}: BlogMetadataProps) {
  return (
    <div className="space-y-4">
      <Input
        type="text"
        placeholder="Enter blog post title"
        value={title}
        onChange={(e) => onTitleChange(e.target.value)}
        className="text-3xl font-bold bg-transparent text-neon-green-400 border-neon-green-400 placeholder-neon-green-400/50 p-3"
      />
      <Input
        type="text"
        placeholder="Enter subtitle or brief description"
        value={subtitle}
        onChange={(e) => onSubtitleChange(e.target.value)}
        className="text-lg bg-transparent text-gray-200 border-neon-green-400 placeholder-neon-green-400/50"
      />

      <div className="flex space-x-4 text-sm text-gray-400">
        <span>{format(publishDate, "MMMM d, yyyy")}</span>
        <span>·</span>
        <span>{readingTime}</span>
      </div>
    </div>
  )
}

