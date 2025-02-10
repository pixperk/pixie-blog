import { useEffect, useState } from "react";
import { Check, Plus, Loader2 } from "lucide-react";
import { User } from "@prisma/client";
import { isUserFollowingAuthor, toggleFollowAuthor } from "@/server/user";
import { useUser } from "@/context/userContext";
import { auth } from "@/lib/firebase";

const FollowButton = ({ author }: { author: User }) => {
  const [isFollowing, setIsFollowing] = useState(false);
  const [loading, setLoading] = useState(false);
  const { user } = useUser();

  useEffect(() => {
    async function setIsFollowingAuthor() {
      if (user && user.id !== author.id) {
        const isFollowing = await isUserFollowingAuthor(user.id, author.id);
        setIsFollowing(isFollowing);
      }
    }
    setIsFollowingAuthor();
  }, [user, author.id]);

  const handleFollowToggle = async () => {
    if (!user || user.id === author.id) return;
    setLoading(true);
    try {
      const idToken = await auth.currentUser?.getIdToken()
      const userUid = auth.currentUser?.uid
      await toggleFollowAuthor(user.id, author.id, userUid!, idToken!);
      setIsFollowing((prev) => !prev);
    } catch (error) {
      console.error("Error toggling follow:", error);
    } finally {
      setLoading(false);
    }
  };

  if (!user || user.id === author.id) {
    return null; // Hide the button if the user is the author
  }

  return (
    <button
      onClick={handleFollowToggle}
      disabled={loading}
      className={`flex items-center gap-2 px-4 py-1.5 text-sm font-medium rounded-full border transition-all duration-300
        ${
          isFollowing
            ? "bg-neon-green-700 text-white border-neon-green-400 hover:bg-neon-green-600"
            : "text-neon-green-700 border-neon-green-400 hover:bg-neon-green-700 hover:text-white"
        }
        ${loading ? "opacity-50 cursor-not-allowed" : ""}
      `}
    >
      {loading ? (
        <Loader2 className="w-4 h-4 animate-spin text-white" />
      ) : isFollowing ? (
        <>
          <Check className="w-4 h-4 text-white" />
          <span>Following</span>
        </>
      ) : (
        <>
          <Plus className="w-4 h-4 text-neon-green-700" />
          <span>Follow</span>
        </>
      )}
    </button>
  );
};

export default FollowButton;
