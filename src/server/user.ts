'use server'

import prisma from "@/lib/db";
import { verifyIdTokenWithoutAdmin } from "@/lib/firebaseAuthVerify";
import { z, ZodError } from "zod";

const userSchema = z.object({
  name: z.string().min(2, "Name must be at least 2 characters").max(50, "Name must be at most 50 characters"),
  email: z.string().email("Invalid email format"),
  socialId: z.string().min(3, "Invalid social ID"),
  avatar: z.string().url("Invalid avatar URL"),
});

const socialIdSchema = z.object({
  socialId: z.string().min(3, "Invalid social ID"),
});

const followSchema = z.object({
  userId: z.string().cuid("Invalid user ID"),
  authorId: z.string().cuid("Invalid author ID"),
});

const updateUserSchema = z.object({
  id: z.string().cuid("Invalid user ID"),
  bio: z.string().max(500, "Bio cannot exceed 500 characters"),
  github: z.string().url("Invalid GitHub URL").optional(),
  linkedin: z.string().url("Invalid LinkedIn URL").optional(),
  twitter: z.string().url("Invalid Twitter URL").optional(),
  email: z.string().email("Invalid email format"),
  avatar: z.string().url("Invalid avatar URL"),
  uid: z.string().min(1, "UID is required"),
});

type UserData = z.infer<typeof userSchema>;

export const login = async (userData: UserData) => {
  try {
    const validatedData = userSchema.parse(userData);

    let user = await prisma.user.findUnique({
      where: { socialId: validatedData.socialId },
    });

    if (!user) {
      user = await prisma.user.create({
        data: validatedData,
      });
    }

    return user;
  } catch (error) {
    console.error("Error during user login:", error);
    throw new Error(
      error instanceof ZodError ? error.errors.map(err => err.message).join(", ") : "Login Unsuccessful"
    );
  }
};

export async function getUserBySocialId(socialId: string) {
  try {
    const validatedData = socialIdSchema.parse({ socialId });

    const user = await prisma.user.findUnique({
      where: { socialId: validatedData.socialId },
      include: { Images: true },
    });

    if (!user) {
      throw new Error("User not found");
    }

    return user;
  } catch (error) {
    console.error("Error fetching user by social ID:", error);
    throw new Error(error instanceof ZodError ? error.message : "Unable to fetch user");
  }
}

export async function toggleFollowAuthor(userId: string, authorId: string, userUid : string, idToken: string) {
  try {
    const validatedData = followSchema.parse({ userId, authorId });

    if (validatedData.userId === validatedData.authorId) {
      throw new Error("You cannot follow yourself.");
    }

    // Verify Firebase token
    const decodedToken = await verifyIdTokenWithoutAdmin(idToken);
    if (decodedToken.user_id !== userUid) {
      throw new Error("Unauthorized user");
    }

    // Fetch current following status
    const user = await prisma.user.findUnique({
      where: { id: validatedData.userId },
      select: {
        following: { where: { id: validatedData.authorId } },
      },
    });

    const isFollowing = user?.following?.length;

    const updatedUser = await prisma.user.update({
      where: { id: validatedData.userId },
      data: {
        following: isFollowing
          ? { disconnect: { id: validatedData.authorId } } // Unfollow
          : { connect: { id: validatedData.authorId } }, // Follow
      },
    });

    return updatedUser;
  } catch (error) {
    console.error("Error toggling follow status:", error);
    throw new Error(error instanceof ZodError ? error.message : "Unable to toggle follow status");
  }
}

export const isUserFollowingAuthor = async (userId: string, authorId: string) => {
  try {
    const validatedData = followSchema.parse({ userId, authorId });

    const user = await prisma.user.findUnique({
      where: { id: validatedData.userId },
      select: {
        following: { where: { id: validatedData.authorId } },
      },
    });

    return !!user?.following?.length;
  } catch (error) {
    console.error("Error checking follow status:", error);
    throw new Error(error instanceof ZodError ? error.message : "Unable to check follow status");
  }
};

export async function getUserProfileById(userId: string) {
  try {
    const userIdSchema = z.string().cuid("Invalid user ID");
    const validatedUserId = userIdSchema.parse(userId);

    const user = await prisma.user.findUnique({
      where: { id: validatedUserId },
      include: {
        following: true,
        followers: true,
        blogs: {
          select: {
            id: true,
            title: true,
            content: true,
            readingTime: true,
            thumbnail: true,
            subtitle: true,
            tags: true,
            _count: { select: { upvotes: true, comments: true } },
            createdAt: true,
          },
          take: 5,
          orderBy: { createdAt: "desc" },
        },
      },
    });

    if (!user) {
      throw new Error("User profile not found");
    }

    return user;
  } catch (error) {
    console.error("Error fetching user profile:", error);
    throw new Error(error instanceof ZodError ? error.message : "Unable to fetch user profile");
  }
}

export type ProfileType = Awaited<ReturnType<typeof getUserProfileById>>;

export async function updateUserProfile(
  userData: {
    id: string;
    bio: string;
    github?: string;
    linkedin?: string;
    twitter?: string;
    email: string;
    avatar: string;
    uid: string; // Firebase UID
  },
  idToken: string
) {
  try {
    const validatedData = updateUserSchema.parse(userData);

    // Verify Firebase token
    const decodedToken = await verifyIdTokenWithoutAdmin(idToken);

    if (decodedToken.user_id !== validatedData.uid) {
      throw new Error("Unauthorized user");
    }

    // Update user profile in the database
    const user = await prisma.user.update({
      where: { id: validatedData.id, socialId : validatedData.uid },
      data: {
        bio: validatedData.bio,
        github: validatedData.github,
        linkedin: validatedData.linkedin,
        twitter: validatedData.twitter,
        email: validatedData.email,
        avatar: validatedData.avatar,
      },
    });

    return user;
  } catch (error) {
    console.error("Error updating user profile:", error);
    throw new Error(error instanceof ZodError ? error.message : "Unable to update user profile");
  }
}
