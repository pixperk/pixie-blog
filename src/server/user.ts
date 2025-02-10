'use server'

import prisma from "@/lib/db";
import {z, ZodError} from "zod"

const userSchema = z.object({
    name: z.string().min(2, "Name must be at least 2 characters").max(50, "Name must be at most 50 characters"),
    email: z.string().email("Invalid email format"),
    socialId: z.string().min(3, "Invalid social ID"),
    avatar: z.string().url("Invalid avatar URL"),
  });
  
  type UserData = z.infer<typeof userSchema>;
  
  export const login = async (userData: UserData) => {
    try {
      const validatedData = userSchema.safeParse(userData);
      const validatedUser = validatedData.data;
  
      const user = await prisma.user.upsert({
        where: { socialId: validatedUser?.socialId },
        update: { name: validatedUser?.name, avatar: validatedUser?.avatar },
        create: validatedUser!,
      });
  
      return user;
    } catch (error) {
      console.error("Error during user login:", error);
      throw new Error(`${error instanceof ZodError ? error.message : "Login Unsuccessful" }`);
    }
}

export async function getUserBySocialId(socialId:string) {
    const user = await prisma.user.findUnique({
        where:{
            socialId
        }
    })

    return user;
}

export async function toggleFollowAuthor(userId: string, authorId: string) {
  if (userId === authorId) {
    throw new Error("You cannot follow yourself.");
  }

  // Fetch current following status
  const user = await prisma.user.findUnique({
    where: { id: userId },
    select: {
      following: {
        where: { id: authorId },
      },
    },
  });

  const isFollowing = user && user.following && user.following.length;

  const updatedUser = await prisma.user.update({
    where: { id: userId },
    data: {
      following: isFollowing
        ? { disconnect: { id: authorId } } // Unfollow
        : { connect: { id: authorId } },  // Follow
    },
  });

  return updatedUser;
}


export const isUserFollowingAuthor = async (userId: string, authorId: string) => {
  const user = await prisma.user.findUnique({
    where: { id: userId },
    select: {
      following: {
        where: { id: authorId },
      },
    },
  });

  return !!user?.following?.length
}

export async function getUserProfileById(userId : string){
  const user = await prisma.user.findUnique({
    where:{
      id: userId
    },
    include:{
      following: true,
      followers: true,
      blogs: {
        select : {
          id: true,
          title: true,
          content: true,
          readingTime : true,
          thumbnail : true,
          subtitle : true,
          tags : true,
          _count:{
            select:{
              upvotes: true,
              comments: true
            }
          },
          createdAt: true,
        },
        take : 5,
        orderBy : {
          createdAt: 'desc'
        }
      }
    }
  })

  return user
}

export type ProfileType = Awaited<ReturnType<typeof getUserProfileById>>;