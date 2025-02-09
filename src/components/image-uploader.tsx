"use client";

import { type Dispatch, type FC, type SetStateAction, useState } from "react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Dialog, DialogContent, DialogTrigger } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Trash2, Loader2 } from "lucide-react";
import { UploadDropzone } from "@/lib/uploadthing";
import type { ClientUploadedFileData } from "uploadthing/types";
import type { OurFileRouter } from "@/app/api/uploadthing/core";
import { deleteImage } from "@/server/image";
import { useUser } from "@/context/userContext";
import toast from "react-hot-toast";

interface ImageUploaderModalProps {
  handleUpload: (res: ClientUploadedFileData<OurFileRouter>[]) => void;
  handleInsert: (imageUrl: string) => void;
  images: string[];
  setImages: Dispatch<SetStateAction<string[]>>;
}

export const ImageUploaderModal: FC<ImageUploaderModalProps> = ({
  handleUpload,
  handleInsert,
  images,
  setImages,
}) => {
  const [activeTab, setActiveTab] = useState("your-images");
  const [selectedImage, setSelectedImage] = useState<string | null>(null);
  const [isOpen, setIsOpen] = useState(false);
  const { user } = useUser();
  const [deletingImageIndex, setDeletingImageIndex] = useState<number | null>(null);

  const handleClientUploadComplete = (
    res: ClientUploadedFileData<OurFileRouter>[]
  ) => {
    handleUpload(res);
    setActiveTab("your-images");
  };

  const handleUploadError = (error: Error) => {
    toast.error(`Upload error`);
    setActiveTab("your-images");
  };

  const handleDelete = async (image: string, index: number) => {
    setDeletingImageIndex(index);
    try {
      if(!user)throw new Error("Please login")
      await deleteImage(image, user.id!);
      setImages(images.filter((_, i) => i !== index));
      if (selectedImage === image) {
        setSelectedImage(null);
      }
    } catch (error) {
      console.error("Failed to delete image:", error);
    } finally {
      setDeletingImageIndex(null);
    }
  };

  const handleImageSelect = (imageUrl: string) => {
    setSelectedImage(imageUrl);
  };

  const handleInsertClick = () => {
    if (selectedImage) {
      handleInsert(selectedImage);
      setIsOpen(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        <Button
          variant="outline"
          className="border-neon-green-400 text-neon-green-400 hover:bg-neon-green-400 hover:text-white"
        >
          Add Image
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[425px] bg-darkGray text-neon-green-300 border-neon-green-400">
        <h2 className="text-xl font-bold text-center mb-4 text-neon-green-400">
          Insert Image
        </h2>
        <Tabs
          defaultValue={activeTab}
          value={activeTab}
          onValueChange={setActiveTab}
          className="w-full"
        >
          <TabsList className="grid w-full grid-cols-2 bg-darkGray">
            <TabsTrigger
              value="your-images"
              className="data-[state=active]:bg-neon-green-400 data-[state=active]:text-white text-neon-green-300 hover:text-white"
            >
              Your Images
            </TabsTrigger>
            <TabsTrigger
              value="upload-new"
              className="data-[state=active]:bg-neon-green-400 data-[state=active]:text-white text-neon-green-300 hover:text-white"
            >
              Upload New Image
            </TabsTrigger>
          </TabsList>
          <TabsContent value="your-images">
            <div className="grid grid-cols-2 gap-4 mt-4">
              {images.length > 0 ? (
                images.map((image, index) => (
                  <div key={index} className="relative group">
                    <img
                      src={image || "/placeholder.svg"}
                      alt={`Your image ${index}`}
                      className={`w-full h-24 object-cover rounded-lg border ${
                        selectedImage === image
                          ? "border-neon-green-400"
                          : "border-gray-600"
                      } hover:brightness-110 cursor-pointer`}
                      onClick={() => handleImageSelect(image)}
                    />
                    <button
                      onClick={() => handleDelete(image, index)}
                      className={`absolute top-1 right-1 bg-red-500 text-white text-sm p-1 rounded-md hidden group-hover:block hover:bg-red-600 ${
                        deletingImageIndex === index ? "opacity-50 cursor-not-allowed" : ""
                      }`}
                      disabled={deletingImageIndex === index}
                    >
                      {deletingImageIndex === index ? (
                        <Loader2 className="animate-spin w-4 h-4" />
                      ) : (
                        <Trash2 size={16} />
                      )}
                    </button>
                  </div>
                ))
              ) : (
                <p className="text-gray-400 col-span-2">
                  No images available. Upload a new one!
                </p>
              )}
            </div>
          </TabsContent>
          <TabsContent value="upload-new">
            <UploadDropzone
              endpoint="uploader"
              onClientUploadComplete={handleClientUploadComplete}
              onUploadError={handleUploadError}
              className="border border-dashed border-neon-green-400 rounded-lg p-4 flex flex-col items-center justify-center cursor-pointer mt-4 hover:border-neon-green-500 hover:bg-darkGray/50"
            />
          </TabsContent>
        </Tabs>
        <div className="flex justify-end mt-4 space-x-2">
          <Button
            variant="outline"
            className="border-neon-green-400 text-neon-green-400 hover:bg-neon-green-800 hover:text-white"
            onClick={() => setIsOpen(false)}
          >
            Cancel
          </Button>
          {activeTab === "your-images" && (
            <Button
              className={`bg-neon-green-400 text-white hover:bg-neon-green-500 hover:shadow-lg ${
                !selectedImage ? "opacity-50 cursor-not-allowed" : ""
              }`}
              onClick={handleInsertClick}
              disabled={!selectedImage}
            >
              Insert
            </Button>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
};
