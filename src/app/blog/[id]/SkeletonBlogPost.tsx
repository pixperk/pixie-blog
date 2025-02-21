"use client";
import { TracingBeam } from "@/components/tracing-beam";

export default function SkeletonBlogPost() {
  return (
    <div className="flex min-h-screen flex-col bg-gradient-to-br from-gray-900 via-gray-800 to-black">

      <TracingBeam />

      <main className="relative mx-auto w-full max-w-5xl px-6 py-10 sm:px-8 lg:px-12">
        <article className="prose prose-invert prose-green max-w-none">
          {/* Header Skeleton */}
          <div className="mb-8 space-y-4">
            <div className="flex items-center gap-4">
              <div className="h-14 w-14 rounded-full bg-gray-700 animate-pulse" />
              <div>
                <div className="h-5 w-32 bg-gray-700 rounded animate-pulse" />
                <div className="h-4 w-48 bg-gray-700 rounded mt-1 animate-pulse" />
                <div className="flex items-center gap-2 text-sm text-gray-400 mt-1">
                  <div className="h-4 w-20 bg-gray-700 rounded animate-pulse" />
                  <span>·</span>
                  <div className="h-4 w-10 bg-gray-700 rounded animate-pulse" />
                </div>
              </div>
            </div>
            <div className="h-10 w-full bg-gray-700 rounded animate-pulse" />
            <div className="h-6 w-3/4 bg-gray-700 rounded animate-pulse" />
          </div>

          {/* Content Skeleton */}
          <div className="space-y-6">
            <div className="h-5 w-full bg-gray-700 rounded animate-pulse" />
            <div className="h-5 w-5/6 bg-gray-700 rounded animate-pulse" />
            <div className="h-5 w-4/5 bg-gray-700 rounded animate-pulse" />
            <div className="h-5 w-3/4 bg-gray-700 rounded animate-pulse" />
          </div>

          {/* Image Skeleton */}
          <div className="w-full h-64 bg-gray-700 rounded-lg mt-6 animate-pulse" />

          {/* More Text Skeleton */}
          <div className="space-y-6 mt-6">
            <div className="h-5 w-full bg-gray-700 rounded animate-pulse" />
            <div className="h-5 w-5/6 bg-gray-700 rounded animate-pulse" />
            <div className="h-5 w-4/5 bg-gray-700 rounded animate-pulse" />
            <div className="h-5 w-3/4 bg-gray-700 rounded animate-pulse" />
          </div>
        </article>
      </main>
    </div>
  );
}
