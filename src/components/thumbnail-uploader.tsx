'use client';

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Dispatch, FC, SetStateAction, useState } from "react";
import type { ClientUploadedFileData } from "uploadthing/types";
import { ImageUploaderModal } from "./image-uploader";

interface ThumbnailUploaderModalProps {
  handleImageUpload: (res: ClientUploadedFileData<{ file: string }>[]) => void;
  images: string[];
  setImages: Dispatch<SetStateAction<string[]>>;
  thumbnailUrl: string;
  setThumbnailUrl: Dispatch<SetStateAction<string>>;
}

export const ThumbnailUploader: FC<ThumbnailUploaderModalProps> = ({
  handleImageUpload,
  images,
  setImages,
  thumbnailUrl,
  setThumbnailUrl,
}) => {
  const [isLinkInput, setIsLinkInput] = useState(false);

  const handleLinkChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newImageUrl = e.target.value;
    setThumbnailUrl(newImageUrl);
  };

  const handleImageInsert = (imageUrl: string) => {
    setThumbnailUrl(imageUrl);
  };

  return (
    <div className="flex flex-col md:flex-row items-center space-y-4 md:space-y-0 md:space-x-6">
      {thumbnailUrl && (
        <div className="flex-shrink-0 w-full md:w-40 h-40 rounded-md overflow-hidden">
          <img
            src={thumbnailUrl || "/placeholder.png"}
            alt="Blog thumbnail"
            className="w-full h-full object-cover"
          />
        </div>
      )}
      <div className="flex-grow space-y-4">
        <h3 className="text-lg font-semibold text-neon-green-400">Blog Thumbnail</h3>
        <div className="flex flex-col sm:flex-row items-stretch gap-2">
          <ImageUploaderModal
            handleUpload={handleImageUpload}
            handleInsert={handleImageInsert}
            images={images}
            setImages={setImages}
          />
          <Button
            variant="outline"
            className="border-neon-green-400 text-neon-green-400"
            onClick={() => setIsLinkInput(!isLinkInput)}
          >
            Enter Link
          </Button>
        </div>
        {isLinkInput && (
          <div className="flex items-center space-x-2">
            <Input
              type="text"
              placeholder="Enter image URL"
              value={thumbnailUrl}
              onChange={handleLinkChange}
              className="flex-grow"
            />
          </div>
        )}
      </div>
    </div>
  );
};
