"use server";

import prisma from "@/lib/db";
import { GoogleGenerativeAI, SchemaType } from "@google/generative-ai";

export async function createBlog(
  title: string,
  content: string,
  readingTime: string,
  authorId: string,
  subtitle?: string
) {
  await prisma.blog.create({
    data: {
      title,
      content,
      readingTime,
      authorId,
      subtitle,
    },
  });
}

export async function getBlogById(id: string) {
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

  return blog;
}

export type blogType = Awaited<ReturnType<typeof getBlogById>>;

export async function addComment(
  content: string,
  userId: string,
  blogId: string
) {
  return await prisma.comment.create({
    data: {
      content,
      userId,
      blogId,
    },
  });
}

export async function getComments(blogId: string) {
  return await prisma.comment.findMany({
    where: { blogId, parentId: null },
    include: {
      _count: {
        select: { replies: true }, // This will count the number of replies
      },
      user: true,
    },
    orderBy: { createdAt: "desc" },
  });
}
export async function getReplies(blogId: string, parentId: string) {
  return await prisma.comment.findMany({
    where: { blogId, parentId },
    include: {
      _count: {
        select: { replies: true }, // This will count the number of replies
      },
      user: true,
    },
    orderBy: { createdAt: "desc" },
  });
}

type commentArrayType = Awaited<ReturnType<typeof getComments>>;
export type CommentType = commentArrayType[number];

export async function addReply(
  content: string,
  userId: string,
  blogId: string,
  parentId: string
) {
  return await prisma.comment.create({
    data: {
      content,
      userId,
      blogId,
      parentId,
    },
  });
}

export async function upvote(blogId: string, userId: string) {
  try {
    const upvote = await prisma.upvote.findUnique({
      where: { userId_blogId: { userId, blogId } },
    });

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
export async function addBookmark(blogId: string, userId: string) {
  try {
    const bookmark = await prisma.bookmark.findUnique({
      where: { userId_blogId: { userId, blogId } },
    });

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
    skip: (page - 1) * limit * 2,
    take: limit * 2,
  });

  return blogs
    .map((blog) => ({
      ...blog,
      score:
        blog._count.upvotes * 3 +
        blog._count.comments * 2 -
        ((Date.now() - new Date(blog.createdAt).getTime()) / 3_600_000) * 0.5,
    }))
    .sort((a, b) => b.score - a.score) // Sort by score
    .slice(0, limit); // Return only the required amount
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
        description: "Content of a single tweet" 
    }
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
  const threads : string[] = JSON.parse((threadString.response.text()));
  return threads;

}
