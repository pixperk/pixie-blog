import Link from 'next/link'
import { ArrowRight } from 'lucide-react'

export const  PortfolioLink = () => {
  return (
    <div className="rounded-lg border border-neon-green-600 p-6 bg-neon-green-900/20 shadow-lg">
      <h2 className="text-xl font-semibold text-neon-green-400 mb-4">Meet Yashaswi</h2>
      <p className="text-neon-green-100 mb-4">
        Dive deeper into the mind behind these philosophical musings. Explore my other works, projects, and the journey that shapes my perspective.
      </p>
      <Link 
        href="https://yashaswi.xyz" 
        target="_blank"
        rel="noopener noreferrer"
        className="group inline-flex items-center px-4 py-2 rounded-md bg-neon-green-500 text-neon-green-100 font-semibold hover:bg-neon-green-600 transition-colors duration-200"
      >
        Explore My Universe
        <ArrowRight className="ml-2 h-4 w-4 transition-transform group-hover:translate-x-1" />
      </Link>
    </div>
  )
}
