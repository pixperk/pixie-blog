"use client"

import type React from "react"

import { useState, useEffect, useRef } from "react"
import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"
import { Sheet, SheetContent } from "@/components/ui/sheet"
import { getComments, addComment, addReply, getReplies } from "@/server/blog"
import Image from "next/image"
import { useUser } from "@/context/userContext"
import { Loader2, X } from "lucide-react"
import { formatDistanceToNow } from "date-fns"
import type { CommentType } from "@/server/blog"
import { motion, AnimatePresence } from "framer-motion"

type User = {
  id: string
  name: string | null
  avatar: string | null
  socialId: string
  bio: string | null
  email: string
  github: string
  twitter: string
  linkedin: string
}

type Comment = CommentType & {
  user: User
}

type CommentSectionProps = {
  blogId: string
  open: boolean
  onOpenChange: (open: boolean) => void
}

export function CommentSection({ blogId, open, onOpenChange }: CommentSectionProps) {
  const [comments, setComments] = useState<Comment[]>([])
  const [newComment, setNewComment] = useState("")
  const [isLoading, setIsLoading] = useState(true)
  const { user } = useUser()
  const commentListRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    async function fetchComments() {
      if (open) {
        setIsLoading(true)
        const fetchedComments = await getComments(blogId)
        setComments(fetchedComments)
        setIsLoading(false)
      }
    }
    fetchComments()
  }, [blogId, open])

  const handleNewComment = async (e: React.FormEvent) => {
    e.preventDefault()
    if (newComment.trim() && user?.id) {
      const optimisticComment: Comment = {
        id: Date.now().toString(),
        content: newComment,
        createdAt: new Date(),
        _count: {
          replies: 0,
        },
        blogId: Date.now().toString(),
        parentId: Date.now().toString(),
        userId: user.id,
        user: {
          id: user.id,
          name: user.name,
          avatar: user.avatar,
          socialId: new Date().toISOString(),
          bio: null,
          email: new Date().toISOString(),
          github: "",
          twitter: "",
          linkedin: "",
        },
      }
      setComments([optimisticComment, ...comments])
      setNewComment("")
      const serverComment = (await addComment(newComment, user.id, blogId, user.uid, user.idToken)) as Comment
      setComments((prevComments) => [{ ...serverComment, user: optimisticComment.user }, ...prevComments.slice(1)])
    }
  }

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent
        side="bottom"
        className="bg-gradient-to-b from-gray-900 via-gray-800 to-black text-gray-100 antialiased p-6 rounded-t-xl border-t border-neon-green-500/50 h-[80vh] overflow-hidden custom-scrollbar"
      >
        <div className="[&>button]:hidden flex justify-between items-center mb-4">
          <h2 className="text-2xl font-bold text-neon-green-400">Comments</h2>
          <Button variant="ghost" onClick={() => onOpenChange(false)} className="text-gray-400 hover:text-gray-300">
            <X className="h-6 w-6" />
          </Button>
        </div>
        <form onSubmit={handleNewComment} className="mb-6">
          <Textarea
            placeholder="Write a comment..."
            value={newComment}
            onChange={(e) => setNewComment(e.target.value)}
            className="w-full bg-neon-green-500/5 border-neon-green-500/20 focus:border-neon-green-500/50 focus:ring-neon-green-500/30 placeholder-neon-green-500/50 mb-2"
          />
          <Button disabled={!user} type="submit" className="bg-neon-green-500 text-black hover:bg-neon-green-600">
            {!user ? "Login to Comment" : "Comment"}
          </Button>
        </form>
        {isLoading ? (
          <div className="flex justify-center items-center">
            <Loader2 className="h-8 w-8 animate-spin text-neon-green-500" />
          </div>
        ) : (
          <div
            ref={commentListRef}
            className="overflow-y-auto pr-4 h-[calc(100%-150px)] scrollbar-thin scrollbar-thumb-neon-green-500 scrollbar-track-gray-800"
          >
            <CommentList comments={comments} setComments={setComments} blogId={blogId} />
          </div>
        )}
      </SheetContent>
    </Sheet>
  )
}

type CommentListProps = {
  comments: Comment[]
  setComments: React.Dispatch<React.SetStateAction<Comment[]>>
  blogId: string
}

function CommentList({ comments, setComments, blogId }: CommentListProps) {
  return (
    <div className="space-y-4">
      <AnimatePresence>
        {comments.map((comment) => (
          <motion.div
            key={comment.id}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            transition={{ duration: 0.3 }}
          >
            <CommentItem comment={comment} setComments={setComments} blogId={blogId} depth={0} />
          </motion.div>
        ))}
      </AnimatePresence>
    </div>
  )
}

type CommentItemProps = {
  comment: Comment
  setComments: React.Dispatch<React.SetStateAction<Comment[]>>
  blogId: string
  depth: number
}

function CommentItem({ comment, setComments, blogId, depth }: CommentItemProps) {
  const [reply, setReply] = useState("")
  const [showReplyBox, setShowReplyBox] = useState(false)
  const [showReplies, setShowReplies] = useState(false)
  const [replies, setReplies] = useState<Comment[]>([])
  const [loadingReplies, setLoadingReplies] = useState(false)
  const { user } = useUser()
  const isCurrentUser = user?.id === comment?.user?.id

  const handleReply = async (e: React.FormEvent) => {
    e.preventDefault()
    if (reply.trim() && user?.id) {
      const optimisticReply: Comment = {
        id: Date.now().toString(),
        content: reply,
        createdAt: new Date(),
        _count: {
          replies: 0,
        },
        blogId: Date.now().toString(),
        parentId: comment.id,
        userId: user.id,
        user: {
          id: user.id,
          name: user.name,
          avatar: user.avatar,
          socialId: new Date().toISOString(),
          bio: null,
          email: new Date().toISOString(),
          github: "",
          twitter: "",
          linkedin: "",
        },
      }
      setReplies([optimisticReply, ...replies])
      setReply("")
      setShowReplyBox(false)
      setShowReplies(true)
      const serverReply = (await addReply(reply, user.id, blogId, comment.id, user.uid, user.idToken)) as Comment
      setReplies((prevReplies) => [{ ...serverReply, user: optimisticReply.user }, ...prevReplies.slice(1)])
    }
  }

  const fetchReplies = async () => {
    if (!showReplies) {
      setLoadingReplies(true)
      const fetchedReplies = await getReplies(blogId, comment.id)
      setReplies(fetchedReplies)
      setLoadingReplies(false)
    }
    setShowReplies(!showReplies)
  }

  return (
    <div className={`bg-neon-green-500/5 p-4 rounded-lg border border-neon-green-500/20 ${depth > 0 ? "ml-4" : ""}`}>
      <div className="flex items-center gap-2 mb-2">
        {comment?.user?.avatar && (
          <Image
            src={comment.user.avatar || "/placeholder.svg"}
            alt="avatar"
            width={24}
            height={24}
            className="rounded-full"
          />
        )}
        <span className="font-semibold text-neon-green-400">
          {isCurrentUser ? "You" : comment?.user?.name || "Unknown"}
        </span>
        <span className="text-xs text-gray-400">
          {formatDistanceToNow(new Date(comment.createdAt), { addSuffix: true })}
        </span>
      </div>
      <p className="text-gray-300">{comment?.content}</p>
      <div className="mt-2 space-x-2">
        <Button
          variant="link"
          onClick={() => setShowReplyBox(!showReplyBox)}
          className="text-neon-green-400 p-0 h-auto"
        >
          Reply
        </Button>
        {comment._count?.replies > 0 && (
          <Button variant="link" onClick={fetchReplies} className="text-neon-green-400 p-0 h-auto">
            {showReplies
              ? "Hide"
              : `Show ${comment._count.replies} ${comment._count.replies === 1 ? "reply" : "replies"}`}
          </Button>
        )}
      </div>
      <AnimatePresence>
        {showReplyBox && (
          <motion.form
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            transition={{ duration: 0.3 }}
            onSubmit={handleReply}
            className="mt-2 space-y-2"
          >
            <Textarea
              placeholder="Reply..."
              value={reply}
              onChange={(e) => setReply(e.target.value)}
              className="w-full bg-neon-green-500/5 border-neon-green-500/20 focus:border-neon-green-500/50 focus:ring-neon-green-500/30 placeholder-neon-green-500/50"
            />
            <Button disabled={!user} type="submit" className="bg-neon-green-500 text-black hover:bg-neon-green-600">
              {!user ? "Login to Reply" : "Reply"}
            </Button>
          </motion.form>
        )}
      </AnimatePresence>
      {loadingReplies && (
        <div className="flex justify-center items-center mt-2">
          <Loader2 className="h-6 w-6 animate-spin text-neon-green-500" />
        </div>
      )}
      <AnimatePresence>
        {showReplies && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            transition={{ duration: 0.3 }}
            className="mt-2 space-y-2"
          >
            {replies.map((reply) => (
              <CommentItem key={reply.id} comment={reply} setComments={setReplies} blogId={blogId} depth={depth + 1} />
            ))}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}

