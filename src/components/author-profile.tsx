import Image from "next/image"

export function AuthorProfile() {
  return (
    <div className="flex items-center space-x-4 mb-8">
      <Image src="/placeholder.jpeg?height=80&width=80" alt="Author" width={80} height={80} className="rounded-full" />
      <div>
        <h3 className="text-xl font-semibold text-neon-green-400">John Doe</h3>
        <p className="text-gray-400">Tech Enthusiast & Writer</p>
      </div>
    </div>
  )
}

