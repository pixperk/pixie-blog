import { Input } from "@/components/ui/input"
import { format } from "date-fns"
import { ThumbnailUploader } from "./thumbnail-uploader"
import { Dispatch, SetStateAction } from "react"
import { ClientUploadedFileData } from "uploadthing/types"
import { OurFileRouter } from "@/app/api/uploadthing/core"

interface BlogMetadataProps {
  title: string
  subtitle: string
  publishDate: Date
  readingTime: string
  onTitleChange: (title: string) => void
  onSubtitleChange: (subtitle: string) => void,
  handleImageUpload : (res: ClientUploadedFileData<{file:string}>[]) => void
  images: string[];
  setImages: Dispatch<SetStateAction<string[]>>;
  thumbnailUrl : string
  setThumbnailUrl : Dispatch<SetStateAction<string>>
}

export function BlogMetadata({
  title,
  subtitle,
  publishDate,
  readingTime,
  onTitleChange,
  onSubtitleChange,
  handleImageUpload,
  images,
  setImages,
  thumbnailUrl,
  setThumbnailUrl
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
      <ThumbnailUploader
      handleImageUpload={handleImageUpload}
      images={images}
      setImages={setImages}
      thumbnailUrl={thumbnailUrl}
      setThumbnailUrl={setThumbnailUrl}/>

      <div className="flex space-x-4 text-sm text-gray-400">
        <span>{format(publishDate, "MMMM d, yyyy")}</span>
        <span>·</span>
        <span>{readingTime}</span>
      </div>
    </div>
  )
}

