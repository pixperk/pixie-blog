"use client"

import { BlogEditor } from "@/components/blog-editor"
import { ThemeProvider } from "next-themes"

export default function WritePage() {
  return (
    <ThemeProvider attribute="class" defaultTheme="dark">
      <div className="flex min-h-screen flex-col bg-gray-900 text-neon-green-400">
        <main className="flex-1 container mx-auto px-4 py-8">
          <h1 className="text-3xl font-bold mx-7 mb-6 text-neon-green-400">New Blog</h1>
          <BlogEditor />
        </main>
      </div>
    </ThemeProvider>
  )
}

