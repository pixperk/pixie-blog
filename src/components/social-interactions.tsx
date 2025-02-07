import { useState, useEffect } from "react";
import { Upvotes } from "@/components/upvotes";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuSeparator,
} from "@/components/ui/dropdown-menu";
import { MessageSquare, ChevronDown, Loader2, Check, X } from "lucide-react";
import { FaTwitter } from "react-icons/fa";
import { formatCount } from "@/lib/utils";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { Bookmark } from "@/components/bookmark";
import { generateBlogThread, genetateSummaryTweet } from "@/server/blog";
import toast, { Toaster } from "react-hot-toast";

interface SocialInteractionsProps {
  blogId: string;
  initialUpvotes: number;
  commentCount: number;
  onCommentClick: () => void;
}

interface Pun {
  type: string;
  setup: string;
  punchline: string;
  id: number;
}

export function SocialInteractions({
  blogId,
  initialUpvotes,
  commentCount,
  onCommentClick,
}: SocialInteractionsProps) {
  const [isLoading, setIsLoading] = useState(false);
  const [progress, setProgress] = useState(0);
  const [loadingMessage, setLoadingMessage] = useState("");
  const [tweetContent, setTweetContent] = useState("");
  const [threadTweets, setThreadTweets] = useState<string[]>([]);
  const [copiedTweetIndex, setCopiedTweetIndex] = useState<number | null>(null);
  const [showAICard, setShowAICard] = useState(false);
  const [currentPun, setCurrentPun] = useState<Pun | null>(null);

  const loadingSteps = [
    "Reading blog content...",
    "Understanding key points...",
    "Thinking creatively...",
    "Generating your content...",
  ];

  useEffect(() => {
    if (isLoading) {
      const fetchPun = async () => {
        try {
          const response = await fetch(
            "https://official-joke-api.appspot.com/jokes/random"
          );
          const data = await response.json();
          setCurrentPun(data);
        } catch (error) {
          console.error("Error fetching pun:", error);
        }
      };

      const interval = setInterval(() => {
        setCurrentPun(null); // Clear current pun for smooth transition
        fetchPun();
      }, 5000);

      fetchPun(); // Fetch immediately on load

      return () => clearInterval(interval);
    }
  }, [isLoading]);

  const handleTweet = async (type: "summarize" | "thread") => {
    setIsLoading(true);
    setShowAICard(true);
    setTweetContent("");
    setThreadTweets([]);
    setProgress(0);
    setCopiedTweetIndex(null);
    setLoadingMessage(loadingSteps[0]);
    setCurrentPun(null);

    const toastId = toast.loading(
      `Generating ${type === "summarize" ? "tweet" : "thread"}...`
    );

    try {
      const link = window.location.href;

      for (let step = 0; step < loadingSteps.length; step++) {
        setLoadingMessage(loadingSteps[step]);
        setProgress(((step + 1) / loadingSteps.length) * 50);
        await new Promise((resolve) => setTimeout(resolve, 1000));
      }

      if (type === "summarize") {
        const response = await genetateSummaryTweet(blogId, link);
        const words = response.split(" ");
        for (let i = 0; i < words.length; i++) {
          await new Promise((resolve) => setTimeout(resolve, 50));
          setTweetContent((prev) => prev + " " + words[i]);
          setProgress(50 + Math.floor(((i + 1) / words.length) * 50));
        }
        toast.success("Tweet generated successfully!", { id: toastId });
      } else if (type === "thread") {
        const response = await generateBlogThread(blogId, link);
        for (let i = 0; i < response.length; i++) {
          await new Promise((resolve) => setTimeout(resolve, 500));
          setThreadTweets((prev) => [...prev, response[i]]);
          setProgress(50 + Math.floor(((i + 1) / response.length) * 50));
        }
        toast.success("Thread generated successfully!", { id: toastId });
      }
    } catch (error) {
      console.error("Error generating tweet/thread:", error);
      setTweetContent("Failed to generate content. Please try again.");
      toast.error("Failed to generate content. Please try again.", {
        id: toastId,
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleShareTweet = () => {
    if (tweetContent) {
      const tweetUrl = `https://twitter.com/intent/tweet?text=${encodeURIComponent(
        tweetContent
      )}`;
      window.open(tweetUrl, "_blank");
      toast.success("Opening Twitter to share your tweet!");
    }
  };

  const handleShareThread = () => {
    const tweetUrl = `https://twitter.com/intent/tweet?text=${encodeURIComponent(
      threadTweets[0]
    )}\n. Copy the rest tweets manually and paste them ahead to complete the thread`;
    window.open(tweetUrl, "_blank");
    toast.success("Opening Twitter to share your thread!");
  };

  const handleCopyTweet = (tweet: string, index: number) => {
    navigator.clipboard.writeText(tweet);
    setCopiedTweetIndex(index);
    toast.success("Tweet copied to clipboard!");
    setTimeout(() => setCopiedTweetIndex(null), 2000);
  };

  const handleCloseAICard = () => {
    setShowAICard(false);
    setTweetContent("");
    setThreadTweets([]);
    toast.success("AI card closed. Generate new content anytime!");
  };

  return (
    <TooltipProvider>
      <div className="flex flex-col space-y-4">
        <Toaster position="bottom-right" toastOptions={{ duration: 3000 }} />
        <div className="flex items-center space-x-3 sm:space-x-4">
          <Upvotes blogId={blogId} initialUpvotes={initialUpvotes} />
          <Tooltip>
            <TooltipTrigger asChild>
              <Button
                variant="ghost"
                size="sm"
                className="flex items-center gap-2 text-gray-400 hover:text-neon-green-500 transition-all"
                onClick={() => {
                  onCommentClick();
                  toast.success("Opening comments section!");
                }}
              >
                <MessageSquare className="w-5 h-5" />
                <span>{formatCount(commentCount)}</span>
              </Button>
            </TooltipTrigger>
            <TooltipContent side="top">View Comments</TooltipContent>
          </Tooltip>
          <Bookmark blogId={blogId} />
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button
                size="sm"
                className="flex items-center gap-2 bg-blue-500 text-white hover:bg-blue-600 transition-all shadow-lg px-3 py-2 rounded-md"
              >
                <FaTwitter className="w-5 h-5 text-white" />
                <span className="font-bold">Tweet It Up!</span>
                <ChevronDown className="w-4 h-4 text-white" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent
              align="end"
              className="bg-gray-900 border border-blue-500 text-gray-100"
            >
              <DropdownMenuItem
                onClick={() => handleTweet("summarize")}
                className="hover:bg-blue-500 text-gray-100 hover:text-white transition-all"
              >
                <FaTwitter className="w-4 h-4 mr-2 text-blue-400" />
                Summarize & Tweet
              </DropdownMenuItem>
              <DropdownMenuItem
                onClick={() => handleTweet("thread")}
                className="hover:bg-blue-500 text-gray-100 hover:text-white transition-all"
              >
                <FaTwitter className="w-4 h-4 mr-2 text-blue-400" />
                Threadify
              </DropdownMenuItem>
              <DropdownMenuSeparator className="border-t border-blue-500/30" />
            </DropdownMenuContent>
          </DropdownMenu>
        </div>

        {showAICard && (
          <div className="p-4 bg-black border border-neon-green-500 rounded-xl shadow-md space-y-4 relative">
            <Button
              variant="ghost"
              size="sm"
              className="absolute top-2 right-2 text-gray-400 hover:text-neon-green-500"
              onClick={handleCloseAICard}
            >
              <X className="w-4 h-4" />
            </Button>
            <h4 className="text-neon-green-500 font-semibold text-lg flex items-center justify-between">
              {threadTweets.length > 0
                ? "AI Generated Thread"
                : "AI Generated Tweet Content"}
              {isLoading && <Loader2 className="w-4 h-4 ml-2 animate-spin" />}
            </h4>

            {isLoading && (
              <>
                <div className="w-full bg-gray-800 rounded-full h-2 mt-2">
                  <div
                    className="bg-neon-green-500 h-2 rounded-full"
                    style={{ width: `${progress}%` }}
                  ></div>
                </div>
                <p className="text-gray-400 text-sm mt-2">{loadingMessage}</p>
                {currentPun && (
                  <div className="bg-gray-800 p-4 rounded-lg transition-opacity duration-500 ease-in-out">
                    <p className="text-white text-sm mb-2">
                      {currentPun.setup}
                    </p>
                    <p className="text-neon-green-500 font-semibold text-sm">
                      {currentPun.punchline}
                    </p>
                  </div>
                )}
              </>
            )}

            {tweetContent && !threadTweets.length && (
              <div>
                <p className="text-white mt-2 whitespace-pre-wrap">
                  {tweetContent || "Generating tweet..."}
                </p>
                {!isLoading && tweetContent && (
                  <Button
                    onClick={handleShareTweet}
                    className="mt-4 bg-blue-500 hover:bg-blue-600 text-white"
                  >
                    <FaTwitter className="w-4 h-4 mr-2" />
                    Share on Twitter
                  </Button>
                )}
              </div>
            )}

            {threadTweets.length > 0 && (
              <div className="space-y-2">
                {threadTweets.map((tweet, index) => (
                  <div
                    key={index}
                    className="p-4 bg-gray-900 rounded-lg border border-gray-700 flex justify-between items-start"
                  >
                    <p className="text-white flex-1 whitespace-pre-wrap text-sm leading-6">
                      {tweet}
                    </p>
                    <Button
                      variant="ghost"
                      size="sm"
                      className={`ml-4 ${
                        copiedTweetIndex === index
                          ? "text-neon-green-500"
                          : "text-gray-400 hover:text-neon-green-500"
                      }`}
                      onClick={() => handleCopyTweet(tweet, index)}
                    >
                      {copiedTweetIndex === index ? (
                        <Check className="w-4 h-4" />
                      ) : (
                        "Copy"
                      )}
                    </Button>
                  </div>
                ))}
              </div>
            )}

            {threadTweets.length > 0 && (
              <Button
                onClick={handleShareThread}
                className="mt-4 bg-blue-500 hover:bg-blue-600 text-white"
              >
                <FaTwitter className="w-4 h-4 mr-2" />
                Share Entire Thread on Twitter
              </Button>
            )}
          </div>
        )}
      </div>
    </TooltipProvider>
  );
}
