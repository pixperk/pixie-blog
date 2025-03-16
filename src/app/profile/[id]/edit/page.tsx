"use client";

import { ImageUploaderModal } from "@/components/image-uploader";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { useUser } from "@/context/userContext";
import { auth } from "@/lib/firebase";
import { saveImageForUser } from "@/server/image";
import { getUserProfileById, updateUserProfile } from "@/server/user";
import { zodResolver } from "@hookform/resolvers/zod";
import { notFound, useRouter } from "next/navigation";
import { use, useEffect, useState } from "react";
import { Controller, useForm } from "react-hook-form";
import toast from "react-hot-toast";
import { ClientUploadedFileData } from "uploadthing/types";
import { z } from "zod";

const profileSchema = z.object({
  bio: z.string().max(300, "Bio must be under 300 characters."),
  github: z.string().url("Please enter a valid GitHub URL."),
  twitter: z.string().url("Please enter a valid Twitter URL."),
  linkedin: z.string().url("Please enter a valid LinkedIn URL."),

});

const EditProfile = ({ params }: { params: Promise<{ id: string }> }) => {
  const [profilePicture, setProfilePicture] = useState<string>("");
  const [userImages, setUserImages] = useState<string[]>([]);
  const [loading, setLoading] = useState(false);
  const { user } = useUser();
  const router = useRouter();
  const userId = use(params).id;

  if(!user || userId!=user.id){
    notFound()
  }

  const {
    control,
    handleSubmit,
    setValue,
    formState: { errors },
  } = useForm({
    resolver: zodResolver(profileSchema),
    defaultValues: {
      bio: "",
      github: "",
      twitter: "",
      linkedin: "",
  
    },
  });

  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const data = await getUserProfileById(userId);
        setValue("bio", data.bio || "");
        setValue("github", data.github || "");
        setValue("twitter", data.twitter || "");
        setValue("linkedin", data.linkedin || "");
        setProfilePicture(data.avatar || "");
        setUserImages(user!.images || []);
      } catch (error) {
        console.error(error)
        toast.error("Failed to load profile.");
      }
    };

    fetchProfile();
  }, [userId, user, setValue]);

  const handleImageUpload = async (res: ClientUploadedFileData<{file:string}>[]) => {
    const newImageUrl = res[0].url;
    await saveImageForUser(newImageUrl, user!.id!);
    setUserImages((prev) => (Array.isArray(prev) ? [...prev, newImageUrl] : [newImageUrl]));
    toast.success("Image saved");
  };

  const onSubmit = async (data: any) => {
    setLoading(true);
    try {
      const idToken = await auth.currentUser!.getIdToken();
      await updateUserProfile(
        {
          id: userId,
          bio: data.bio,
          github: data.github,
          twitter: data.twitter,
          linkedin: data.linkedin,
          avatar: profilePicture,
          uid: auth.currentUser!.uid!,
        },
        idToken!
      );
      toast.success("Profile updated successfully!");
      router.push(`/profile/${userId}`);
    } catch (error) {
      toast.error((error as Error).message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-black text-white py-12 px-8">
      <div className="max-w-4xl mx-auto space-y-8 bg-gray-800 rounded-2xl p-8 shadow-lg">
        <h1 className="text-4xl font-bold text-center text-neon-green-400">Edit Profile</h1>
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
          {/* Profile Picture */}
          <div>
            <Label htmlFor="profilePicture" className="text-lg font-medium text-neon-green-400">
              Profile Picture
            </Label>
            <div className="mt-4 flex flex-col items-center space-y-4">
              <ImageUploaderModal
                images={userImages}
                setImages={setUserImages}
                handleUpload={handleImageUpload}
                handleInsert={(imageUrl) => setProfilePicture(imageUrl)}
              />
              {profilePicture && (
                <img
                  src={profilePicture}
                  alt="Profile"
                  className="w-28 h-28 rounded-full border-4 border-neon-green-400"
                />
              )}
            </div>
          </div>

          {/* Bio */}
          <div>
            <Label htmlFor="bio" className="text-lg font-medium text-neon-green-400">
              Bio
            </Label>
            <Controller
              name="bio"
              control={control}
              render={({ field }) => (
                <Textarea
                  {...field}
                  id="bio"
                  placeholder="Write a short bio..."
                  className="mt-2 border-gray-700 focus:ring-neon-green-400"
                />
              )}
            />
            {errors.bio && <p className="text-red-500 text-sm mt-1">{errors.bio.message}</p>}
          </div>

          {/* GitHub */}
          <div>
            <Label htmlFor="github" className="text-lg font-medium text-neon-green-400">
              GitHub
            </Label>
            <Controller
              name="github"
              control={control}
              render={({ field }) => (
                <Input
                  {...field}
                  id="github"
                  placeholder="https://github.com/username"
                  className="mt-2 border-gray-700 focus:ring-neon-green-400"
                />
              )}
            />
            {errors.github && <p className="text-red-500 text-sm mt-1">{errors.github.message}</p>}
          </div>

          {/* Twitter */}
          <div>
            <Label htmlFor="twitter" className="text-lg font-medium text-neon-green-400">
              Twitter
            </Label>
            <Controller
              name="twitter"
              control={control}
              render={({ field }) => (
                <Input
                  {...field}
                  id="twitter"
                  placeholder="https://twitter.com/username"
                  className="mt-2 border-gray-700 focus:ring-neon-green-400"
                />
              )}
            />
            {errors.twitter && <p className="text-red-500 text-sm mt-1">{errors.twitter.message}</p>}
          </div>

          {/* LinkedIn */}
          <div>
            <Label htmlFor="linkedin" className="text-lg font-medium text-neon-green-400">
              LinkedIn
            </Label>
            <Controller
              name="linkedin"
              control={control}
              render={({ field }) => (
                <Input
                  {...field}
                  id="linkedin"
                  placeholder="https://linkedin.com/in/username"
                  className="mt-2 border-gray-700 focus:ring-neon-green-400"
                />
              )}
            />
            {errors.linkedin && <p className="text-red-500 text-sm mt-1">{errors.linkedin.message}</p>}
          </div>

         

          {/* Submit Button */}
          <Button
            type="submit"
            className="w-full bg-neon-green-400 text-white hover:bg-neon-green-500 py-3 rounded-lg font-semibold"
            disabled={loading}
          >
            {loading ? "Saving..." : "Save Changes"}
          </Button>
        </form>
      </div>
    </div>
  );
};

export default EditProfile;
