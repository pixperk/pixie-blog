import { clsx, type ClassValue } from "clsx";
import { Metadata } from "next";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function calculateReadingTime(content: string): string {
  const wordsPerMinute = 200;
  const wordCount = content.trim().split(/\s+/).length;
  const minutes = wordCount / wordsPerMinute;

  if (minutes < 0.5) {
    const seconds = Math.round(minutes * 60);
    return `${seconds} sec read`;
  }

  return `${Math.round(minutes)} min read`;
}

export function formatCount(count: number) {
  if (count >= 1000000) {
    return (count / 1000000).toFixed(1) + "M";
  } else if (count >= 1000) {
    return (count / 1000).toFixed(1) + "K";
  }
  return count.toString();
}

export function constructMetadata({
  title = "Pixie - Systematic and easy blog",
  description = "Give you ideas life",
  image = "/thumbnail.png",
  icons = "/favicon.ico",
  noIndex = false
} : {
  title?: string,
  description?: string,
  image?: string,
  icons?: string,
  noIndex?: boolean,
} = {}) : Metadata{
  return {
    title, description, openGraph : {
      title,
      description,
      images: [
        {url : image}
      ]
    },
    twitter : {
      card : "summary_large_image",
      title,
      description,
      images:[image],
      creator : "@PixPerk_"
    },
    icons,
    metadataBase : new URL(process.env.NEXT_PUBLIC_APP_URL!),
    ...(noIndex && {
      robots : {
        index  : false,
        follow : false
      }
    })
  }
}
