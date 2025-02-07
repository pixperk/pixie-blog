"use client";

import { useState, useEffect, useTransition } from "react";
import { Button } from "@/components/ui/button";
import { Bookmark as BookmarkIcon, Loader2 } from "lucide-react";
import { motion } from "framer-motion";
import { addBookmark, hasUserBookmarked } from "@/server/blog";
import { useUser } from "@/context/userContext";
import { useRouter } from "next/navigation";

interface BookmarkProps {
  blogId: string;
}

export function Bookmark({ blogId }: BookmarkProps) {
  const { user } = useUser();
  const userId = user?.id;
  const router = useRouter();
  const [isBookmarked, setIsBookmarked] = useState(false);
  const [isPending, startTransition] = useTransition();

  useEffect(() => {
    if (userId) {
      hasUserBookmarked(blogId, userId).then(setIsBookmarked);
    }
  }, [blogId, userId]);

  const handleBookmark = () => {
    if (!userId) {
      router.push("/login");
      return;
    }

    // Optimistic UI Update
    setIsBookmarked((prev) => !prev);

    startTransition(async () => {
      try {
        const response = await addBookmark(blogId, userId);
        if (response.message !== "bookmark added") {
          setIsBookmarked(false); // Revert on failure
        }
      } catch (error) {
        console.error("Bookmark Error:", error);
        setIsBookmarked(false); // Revert on error
      }
    });
  };

  return (
    <div className="flex items-center gap-2">
      <Button
        variant="outline"
        size="icon"
        onClick={handleBookmark}
        disabled={isPending}
        aria-label="Bookmark this post"
        className={`group rounded-full border-yellow-500/50 p-2 transition-all duration-200 flex items-center justify-center ${
          isBookmarked ? "bg-yellow-500 text-white" : "text-yellow-500 bg-transparent"
        } hover:bg-yellow-500/20`}
      >
        {isPending ? (
          <Loader2 className="h-5 w-5 animate-spin text-yellow-400" />
        ) : (
          <motion.div whileTap={{ scale: 0.85 }} transition={{ duration: 0.1 }}>
            <BookmarkIcon
              className={`h-5 w-5 transition-all ${
                isBookmarked ? "fill-yellow-500 stroke-white" : "stroke-yellow-500"
              }`}
            />
          </motion.div>
        )}
      </Button>

    </div>
  );
}
