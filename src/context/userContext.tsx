"use client";

import { createContext, useContext, useEffect, useState } from "react";
import { auth } from "@/lib/firebase";
import { getUserBySocialId } from "@/server/user";

interface User {
  id: string;
  name: string;
  avatar: string;
  bio: string;
  images : string[]
}

interface UserContextType {
  user: User | null;
  loading: boolean;
}

const UserContext = createContext<UserContextType | undefined>(undefined);

export function UserProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    setLoading(true);
    const unsubscribe = auth.onAuthStateChanged(async (currentUser) => {
      if (currentUser) {
        try {
          const userData = await getUserBySocialId(currentUser.uid);
          const images = userData?.Images.map((image)=>image.url) || []
          setUser({
            id: userData?.id!,
            name: userData?.name || "Unknown",
            avatar: userData?.avatar || "",
            bio: userData?.bio || "",
            images
          });

          console.log("Images : ", images);
          
        } catch (error) {
          console.error("Error fetching user data:", error);
          setUser(null);
        }
      } else {
        setUser(null);
      }
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  return (
    <UserContext.Provider value={{ user, loading }}>
      { children}
    </UserContext.Provider>
  );
}

export function useUser() {
  const context = useContext(UserContext);
  if (!context) {
    throw new Error("useUser must be used within a UserProvider");
  }
  return context;
}
