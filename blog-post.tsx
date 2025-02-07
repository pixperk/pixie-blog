"use client"

import Image from "next/image"
import { TracingBeam } from "./components/tracing-beam"
import { AuthorProfile } from "./components/author-profile"
import { CommentSection } from "./components/comment-section"
import { Upvotes } from "./components/upvotes"

// Combined content array
const content = [
  {
    type: "image",
    src: "https://hebbkx1anhila5yf.public.blob.vercel-storage.com/image-wvrXZ6x6iM0kjwakF4V614pjf8Z2NQ.png",
    alt: "Snow-capped mountains under a starry night sky",
    aspectRatio: "16/9",
  },
  {
    type: "paragraph",
    title: "Introduction",
    content:
      "Ex irure dolore veniam ex velit non aute nisi labore ipsum occaecat deserunt cupidatat aute. Enim cillum dolor et nulla sunt exercitation non voluptate qui aliquip esse tempor.",
  },
  {
    type: "image",
    src: "/placeholder.jpeg?height=800&width=1200",
    alt: "Second sample image",
    aspectRatio: "3/2",
  },
  {
    type: "paragraph",
    title: "Understanding the Basics",
    content:
      "Labore laborum culpa magna reprehenderit ea velit id esse adipisicing deserunt amet dolore. Ipsum occaecat veniam commodo proident aliqua id ad deserunt dolor aliquip duis veniam sunt.",
  },
  {
    type: "image",
    src: "/placeholder.jpeg?height=600&width=800",
    alt: "Third sample image",
    aspectRatio: "4/3",
  },
  {
    type: "paragraph",
    title: "Advanced Concepts",
    content:
      "In dolore veniam excepteur eu est et sunt velit. Ipsum sint esse veniam fugiat esse qui sint ad magna amet do. Enim anim aute qui esse sunt exercitation non voluptate qui aliquip esse tempor.",
  },
  {
    type: "paragraph",
    title: "Final Thoughts",
    content:
      "Ullamco ut sunt consectetur sint qui qui do do qui do. Labore laborum culpa magna reprehenderit ea velit id esse adipisicing deserunt amet dolore. Ipsum occaecat veniam commodo proident aliqua id ad deserunt dolor aliquip duis veniam sunt.",
  },
]

export default function BlogPost() {
  return (
    <div className="min-h-screen bg-gradient-radial from-gray-900 to-black text-white antialiased selection:bg-neon-green-500/30">
      <TracingBeam />

      <main className="relative mx-auto max-w-3xl px-4 py-10 sm:px-6 lg:px-8">
        <div className="space-y-12 sm:space-y-16">
          {/* Header */}
          <header className="space-y-4">
            <h1 className="text-4xl font-bold tracking-tight sm:text-5xl">Lorem Ipsum Dolor Sit Amet</h1>
            <AuthorProfile />
          </header>

          {/* Content Sections */}
          <section className="space-y-12">
            {content.map((item, index) => (
              <div key={index} className="space-y-6">
                {item.type === "image" ? (
                  <div className="relative w-full overflow-hidden rounded-xl">
                    <div
                      style={{ position: "relative", width: "100%", paddingTop: `calc(${item.aspectRatio} * 100%)` }}
                    >
                      <Image
                        src={item.src || "/placeholder.jpeg"}
                        alt={item.alt}
                        fill
                        className="object-cover"
                        priority={index === 0}
                      />
                    </div>
                  </div>
                ) : (
                  <>
                    <h2 className="text-2xl font-semibold text-neon-green-500/90">{item.title}</h2>
                    <p className="leading-relaxed text-gray-300">{item.content}</p>
                  </>
                )}
              </div>
            ))}
          </section>

          {/* Upvotes and Comments */}
          <div className="space-y-8">
            <Upvotes />
            <CommentSection />
          </div>
        </div>
      </main>
    </div>
  )
}

