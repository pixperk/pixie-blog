"use client";

import { Button } from "@/components/ui/button";
import { useUser } from "@/context/userContext";
import { upvote, hasUserUpvoted } from "@/server/blog";

import { CircleArrowUp, Loader2 } from "lucide-react";
import { useState, useTransition, useEffect } from "react";
import { motion } from "framer-motion";
import { formatCount } from "@/lib/utils";

interface UpvotesProps {
  blogId: string;
  initialUpvotes: number;
}

export function Upvotes({ blogId, initialUpvotes }: UpvotesProps) {
  const { user } = useUser();
  const [isPending, startTransition] = useTransition();
  const [upvotes, setUpvotes] = useState(initialUpvotes);
  const [hasUpvoted, setHasUpvoted] = useState(false);

  useEffect(() => {
    if (user) {
      hasUserUpvoted(blogId, user.id).then(setHasUpvoted);
    }
  }, [user, blogId]);

  const handleUpvote = () => {
    if (!user) {
      alert("You must be logged in to upvote");
      return;
    }

    // Optimistic UI Update
    setUpvotes((prev) => (hasUpvoted ? prev - 1 : prev + 1));
    setHasUpvoted((prev) => !prev);

    startTransition(async () => {
      try {
        const response = await upvote(blogId, user.id);
        if (response.message === "Upvote added") {
          setHasUpvoted(true);
        } else {
          setHasUpvoted(false);
        }
      } catch (error) {
        console.error("Upvote failed", error);
        // Revert optimistic update on error
        setUpvotes((prev) => (hasUpvoted ? prev + 1 : prev - 1));
        setHasUpvoted((prev) => !prev);
      }
    });
  };

  return (
    <div className="flex items-center gap-2">
      {/* Upvote Button */}
      <Button
        variant="outline"
        size="icon"
        onClick={handleUpvote}
        disabled={isPending}
        aria-label="Upvote this post"
        className={`group rounded-full border-neon-green-500/50 p-2 transition-all duration-200 flex items-center justify-center ${
          hasUpvoted ? "bg-neon-green-500 text-white" : "text-neon-green-500 bg-transparent"
        } hover:bg-neon-green-500/20`}
      >
        {isPending ? (
          <Loader2 className="h-5 w-5 animate-spin text-neon-green-400" />
        ) : (
          <motion.div
            whileTap={{ scale: 0.85 }}
            transition={{ duration: 0.1 }}
            className="relative"
          >
            <CircleArrowUp
              className={`h-5 w-5 transition-all ${
                hasUpvoted ? "fill-neon-green-500 stroke-white" : "stroke-neon-green-500"
              }`}
            />
          </motion.div>
        )}
      </Button>

      {/* Upvote Count & Label */}
      <span className="text-sm font-medium text-neon-green-500">
        {formatCount(upvotes)} {upvotes === 1 ? "Upvote" : "Upvotes"}
      </span>
    </div>
  );
}
