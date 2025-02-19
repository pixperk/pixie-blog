"use server";

import prisma from "@/lib/db";
import { verifyIdTokenWithoutAdmin } from "@/lib/firebaseAuthVerify";
import { redis } from "@/lib/redis";
import { GoogleGenerativeAI, SchemaType } from "@google/generative-ai";
import { z, ZodError } from "zod";

const createBlogSchema = z.object({
  title: z.string().min(1, "Title is required"),
  content: z.string().min(1, "Content is required"),
  readingTime: z.string().min(1, "Reading time is required"),
  authorId: z.string().cuid("Invalid author ID format"),
  tags: z.array(z.string()).nonempty("Tags must contain at least one tag"),
  thumbnail: z.string().url("Thumbnail must be a valid URL"),
  subtitle: z.string().optional(),
});

// Function with zod validation
export async function createBlog(
  title: string,
  content: string,
  readingTime: string,
  authorId: string,
  tags: string[],
  thumbnail: string,
  idToken: string,
  uid: string,
  subtitle?: string
) {
  // Validate the input data
  try {
    const validatedData = createBlogSchema.parse({
      title,
      content,
      readingTime,
      authorId,
      tags,
      thumbnail,
      subtitle,
    });

    const decodedToken = await verifyIdTokenWithoutAdmin(idToken);
    if (decodedToken.user_id !== uid) {
      throw new Error("Unauthorized user");
    }
    
    await prisma.blog.create({
      data: validatedData,
    });
  } catch (error) {
    console.error("Error during blog creation:", error);
    throw new Error(
      error instanceof ZodError ? error.message : "Unable to create blog"
    );
  }
}

export async function getBlogById(id: string) {
  //cache the blog by redis
  const cachedBlog = await redis.get(`blog:${id}`);
  if (cachedBlog) {
    return JSON.parse(cachedBlog);
  }
  const blog = await prisma.blog.findUnique({
    where: {
      id,
    },
    include: {
      author: true,
      _count: {
        select: { comments: true, upvotes: true },
      },
    },
  });
  await redis.set(`blog:${id}`, JSON.stringify(blog)); 
  return blog;
}

export type blogType = Awaited<ReturnType<typeof getBlogById>>;

const addCommentSchema = z.object({
  content: z.string().min(1, "Comment content is required"),
  userId: z.string().cuid("Invalid user ID format"),
  blogId: z.string().cuid("Invalid blog ID format"),
});

export async function addComment(
  content: string,
  userId: string,
  blogId: string,
  uid: string,
  idToken: string
) {

  try{
  const validatedData = addCommentSchema.parse({
    content,
    userId,
    blogId,
  });

  const decodedToken = await verifyIdTokenWithoutAdmin(idToken);
  if (decodedToken.user_id !== uid) {
    throw new Error("Unauthorized user");
  }

  //invalidate the cache
  await redis.del(`blog:${blogId}`);
  await redis.del(`comments:${blogId}`);

  return await prisma.comment.create({
    data: validatedData,
  });}catch(error){
    console.error("Error during comment creation:", error);
    throw new Error(
      error instanceof ZodError ? error.message : "Unable to create comment"
    );
  }
}

export async function getComments(blogId: string) {
  const cachedComments = await redis.get(`comments:${blogId}`);
  if (cachedComments) {
    return JSON.parse(cachedComments);
  }
  const comments =  await prisma.comment.findMany({
    where: { blogId, parentId: null },
    include: {
      _count: {
        select: { replies: true },
      },
      user: true,
    },
    orderBy: {
      replies : {
        _count : "desc"
      }
    }
    
    
  });
  await redis.set(`comments:${blogId}`, JSON.stringify(comments));
  return comments;
}

export async function getReplies(blogId: string, parentId: string) {
  const cachedReplies = await redis.get(`replies:${blogId}:${parentId}`);
  if (cachedReplies) {
    return JSON.parse(cachedReplies);
  }
  const replies =  await prisma.comment.findMany({
    where: { blogId, parentId },
    include: {
      _count: {
        select: { replies: true }, // This will count the number of replies
      },
      user: true,
    },
    orderBy: { createdAt: "desc" },
  });
  await redis.set(`replies:${blogId}:${parentId}`, JSON.stringify(replies));
  return replies;
}

type commentArrayType = Awaited<ReturnType<typeof getComments>>;
export type CommentType = commentArrayType[number];


//validate reply schema
const addReplySchema = z.object({
  content: z.string().min(1, "Reply content is required"),
  userId: z.string().cuid("Invalid user ID format"),
  blogId: z.string().cuid("Invalid blog ID format"),
  parentId: z.string().cuid("Invalid parent ID format"),
});

export async function addReply(
  content: string,
  userId: string,
  blogId: string,
  parentId: string,
  uid: string,
  idToken: string
) {

  const validatedData = addReplySchema.parse({
    content,
    userId,
    blogId,
    parentId,
  });
  //check if user
  const decodedToken = await verifyIdTokenWithoutAdmin(idToken);
  if (decodedToken.user_id !== uid) {
    throw new Error("Unauthorized user");
  }
  //invalidate the cache
  await redis.del(`blog:${blogId}`);
  await redis.del(`comments:${blogId}`);
  await redis.del(`replies:${blogId}:${parentId}`);

  return await prisma.comment.create({
    data: validatedData,
  });
}


export async function upvote(blogId: string, userId: string, uid: string, idToken: string) {
  try {
    const upvote = await prisma.upvote.findUnique({
      where: { userId_blogId: { userId, blogId } },
    });
    //check if user
    const decodedToken = await verifyIdTokenWithoutAdmin(idToken);
    if (decodedToken.user_id !== uid) {
      throw new Error("Unauthorized user");
    }
    await redis.del(`blog:${blogId}`);
    if (upvote) {
      await prisma.$transaction([
        prisma.upvote.delete({ where: { id: upvote.id } }),
      ]);
      return { message: "Upvote removed" };
    } else {
      await prisma.$transaction([
        prisma.upvote.create({ data: { userId, blogId } }),
      ]);
      return { message: "Upvote added" };
    }
  } catch (error) {
    console.error("Upvote Error:", error);
    throw new Error("Failed to update upvote");
  }
}

export async function hasUserUpvoted(blogId: string, userId: string) {
  const upvote = await prisma.upvote.findUnique({
    where: { userId_blogId: { userId, blogId } },
  });

  return !!upvote;
}
export async function addBookmark(blogId: string, userId: string,uid: string, idToken: string) {
  try {
    const decodedToken = await verifyIdTokenWithoutAdmin(idToken);
    if (decodedToken.user_id !== uid) {
      throw new Error("Unauthorized user");
    }
    const bookmark = await prisma.bookmark.findUnique({
      where: { userId_blogId: { userId, blogId } },
    });

    await redis.del(`blog:${blogId}`);

    if (bookmark) {
      await prisma.$transaction([
        prisma.bookmark.delete({ where: { id: bookmark.id } }),
      ]);
      return { message: "bookmark removed" };
    } else {
      await prisma.$transaction([
        prisma.bookmark.create({ data: { userId, blogId } }),
      ]);
      return { message: "bookmark added" };
    }
  } catch (error) {
    console.error("bookmark Error:", error);
    throw new Error("Failed to update bookmark");
  }
}

export async function hasUserBookmarked(blogId: string, userId: string) {
  
  const bookmark = await prisma.bookmark.findUnique({
    where: { userId_blogId: { userId, blogId } },
  });

  return !!bookmark;
}

function calculateTrendingScore(
  createdAt: Date,
  comments: number,
  upvotes: number
): number {
  const ageInHours =
    (Date.now() - new Date(createdAt).getTime()) / (1000 * 60 * 60);
  const recencyWeight = 1 / Math.log2(ageInHours + 2);
  const engagementWeight = comments * 2 + upvotes;

  return recencyWeight * engagementWeight;
}

export async function fetchTrendingBlogs(page: number = 1, limit: number = 5) {
  const blogs = await prisma.blog.findMany({
    include: {
      author: true,
      _count: {
        select: { comments: true, upvotes: true },
      },
    },
    orderBy: {
      createdAt: "desc",
    },
    skip: (page - 1) * limit,
    take: limit,
  });

  const scoredBlogs = blogs.map((blog) => ({
    ...blog,
    score: calculateTrendingScore(
      blog.createdAt,
      blog._count.comments,
      blog._count.upvotes
    ),
  }));

  scoredBlogs.sort((a, b) => b.score - a.score);

  return scoredBlogs.slice(0, limit);
}

export type BlogType = Awaited<ReturnType<typeof fetchTrendingBlogs>>;

export async function fetchBookmarked(
  userId: string,
  page: number = 1,
  limit: number = 5
) {
  const bookmarkedBlogs = await prisma.bookmark.findMany({
    where: { userId },
    include: {
      blog: {
        include: {
          author: true,
          _count: {
            select: { comments: true, upvotes: true },
          },
        },
      },
    },
    orderBy: {
      createdAt: "desc",
    },
    skip: (page - 1) * limit,
    take: limit,
  });

  return bookmarkedBlogs;
}

export type bookmarkedBlogType = Awaited<ReturnType<typeof fetchBookmarked>>;

const genAI = new GoogleGenerativeAI(process.env.GOOGLE_GENERATIVE_AI_API_KEY!);
export async function genetateSummaryTweet(blogId: string, link: string) {
  const blog = await getBlogById(blogId);
  const prompt = `You are a social media strategist tasked with creating an engaging Twitter summary for a blog. Your goal is to maximize engagement (likes, retweets, and clicks). Follow these steps:
  The blog content is ${blog?.content} by author ${blog?.author.name}. Include the author name as well.
  Start with a hook: Use a surprising fact, question, or bold statement to grab attention.
  Summarize the blog's main idea in 1-2 sentences. Keep it intriguing without giving everything away.
  
  Add emojis and relevant hashtags to make it visually appealing and discoverable.
  End with a clear call-to-action (CTA) to encourage readers to click the blog link. Use phrases like:
  'Read the full story here 👇'
  'Discover more on PIXIE: [link]'. The link is ${link}
  Important: The tweet must be concise and fit within 280 characters, including spaces, hashtags, emojis, and the link.

  The tone should be conversational and engaging. Target an audience interested in [insert blog topic, e.g., productivity, technology, personal growth].`;

  const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });

  const result = await model.generateContent(prompt);
  return result.response.text();
}
export async function generateBlogThread(blogId: string, link: string) {
  const threadSchema = {
    description: "List of tweet contents for the thread",
    type: SchemaType.ARRAY,
    items: {
      type: SchemaType.STRING,
      description: "Content of a single tweet",
    },
  };

  const blog = await getBlogById(blogId);

  const prompt = `
You are a social media strategist tasked with creating an engaging Twitter thread summarizing a blog. Your goal is to maximize engagement (likes, retweets, and clicks). Follow these steps:  

The blog content is ${blog?.content} by author ${blog?.author.name}. Include the author's name at the end of thread in the last tweet.  

1️⃣ **Start the thread with a strong hook:** Use a surprising fact, a bold statement, or a compelling question to draw readers in.  
2️⃣ **Break the blog's main idea into 8-10 concise tweets:** Each tweet should provide value, keep the audience intrigued, and encourage them to keep reading.  
3️⃣ **Include visuals or emojis where appropriate:** These elements make the thread visually appealing and increase discoverability.  
4️⃣ **Use relevant hashtags throughout the thread:** Make sure they align with the blog topic (e.g., #Productivity, #TechTrends, #PersonalGrowth).  
5️⃣ **End the thread with a clear CTA:** Drive readers to the blog link with phrases like:  
   - 'Want the full scoop? Read more here 👇'  
   - 'Get all the details on PIXIE: [link]'  

   DO NOT DISPLAY 1/x for the tweet content. You can display 1, 2, 3, 4, ....., n for a specific tweet.Also DO NOT product it in object form for any tweet. Just text (String) is required.

📌 **Important:** Each tweet should fit within 280 characters (including hashtags, emojis, and the blog link ${link}).  

The tone should be conversational and engaging, targeting an audience interested in [insert blog topic, e.g., productivity, technology, personal growth].  

`;

  const threadModel = genAI.getGenerativeModel({
    model: "gemini-1.5-pro",
    generationConfig: {
      responseMimeType: "application/json",
      responseSchema: threadSchema,
    },
  });

  const threadString = await threadModel.generateContent(prompt);
  const threads: string[] = JSON.parse(threadString.response.text());
  return threads;
}
export async function generateRecommendedContent(blogId: string) {
  const blog = await getBlogById(blogId);
  if (!blog) throw new Error("Blog not found");

  // Fetch blogs by the same author
  const blogsFromAuthor = await prisma.blog.findMany({
    where: {
      authorId: blog.authorId,
      NOT: {
        id: blogId,
      },
    },
    include: {
      author: true,
      _count: {
        select: {
          comments: true,
          upvotes: true,
        },
      },
    },
    orderBy: {
      createdAt: "desc",
    },
    take: 10, // Fetch the latest 10 blogs
  });

  // Fetch blogs by matching tags
  const blogsByTags = await prisma.blog.findMany({
    where: {
      tags: {
        hasSome: blog.tags, // Match at least one tag from the current blog
      },
      NOT: {
        id: blogId,
      },
    },
    include: {
      author: true,
      _count: {
        select: {
          comments: true,
          upvotes: true,
        },
      },
    },
    orderBy: {
      createdAt: "desc",
    },
    take: 10, // Fetch the latest 10 blogs
  });

  // Helper function to calculate the score
  const calculateScore = (blog: {
    _count?: { comments: number; upvotes: number };
  }) => {
    return (blog._count?.comments || 0) + (blog._count?.upvotes || 0);
  };

  // Sort by combined comments and upvotes, and take the top 3
  const recommendedBlogsFromAuthor = blogsFromAuthor
    .sort((a, b) => calculateScore(b) - calculateScore(a))
    .slice(0, 3);

  const recommendedBlogsByTags = blogsByTags
    .sort((a, b) => calculateScore(b) - calculateScore(a))
    .slice(0, 3);

  return {
    fromAuthor: recommendedBlogsFromAuthor,
    byTags: recommendedBlogsByTags,
  };
}
export type RecommendedContentType = Awaited<
  ReturnType<typeof generateRecommendedContent>
>;



  export async function getSearchedBlogs(query: string, page: number = 1) {
    const pageSize = 5
    const isFirstPage = page === 1
    const cacheKey = `search:${query}:page:${page}`
  
    const cachedResults = await redis.get(cacheKey)
    if (cachedResults) {
      return JSON.parse(cachedResults)
    }
  
    const [blogs, authors] = await Promise.all([
      prisma.blog.findMany({
        where: {
          OR: [
            { title: { contains: query, mode: "insensitive" } },
            { subtitle: { contains: query, mode: "insensitive" } },
            { author: { name: { contains: query, mode: "insensitive" } } },
            { tags: { has: query } },
          ],
        },
        select: {
          id: true,
          title: true,
          subtitle: true,
          thumbnail : true,
          author: {
            select: {
              id: true,
              name: true,
              avatar: true,
            },
          },
        },
        take: isFirstPage ? 10 : pageSize,
        skip: isFirstPage ? 0 : (page - 1) * pageSize + 5,
      }),
      prisma.user.findMany({
        where: {
          name: { contains: query, mode: "insensitive" },
        },
        select: {
          id: true,
          name: true,
          avatar: true,
          bio: true,
          _count: {
            select: {
              blogs: true,
            },
          },
        },
        take: 5,
      }),
    ])
  
    const results = {
      blogs,
      authors,
      hasMore: blogs.length === (isFirstPage ? 10 : pageSize),
    }
  
    await redis.set(cacheKey, JSON.stringify(results), "EX", 3600)
  
    return results
  }

