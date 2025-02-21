"use client"

import { motion } from "framer-motion"
import Link from "next/link"
import { useEffect, useState } from "react"
import { FaBrain, FaRocket, FaUsers, FaGithub, FaTwitter, FaGlobe, FaBolt, FaMagic, FaFeatherAlt } from "react-icons/fa"
import { Skeleton } from "@/components/ui/skeleton"
import { formatCount } from "@/lib/utils"
import { blogWordCountAndTotalUsers } from "@/server/blog"

export const BlogAside = () => {
  const [stats, setStats] = useState<{
    words: number
    activeUsers: number
  } | null>(null)

  useEffect(() => {
    async function fetchStats() {
      const fetchedStats = await blogWordCountAndTotalUsers()
      setStats({
        words: fetchedStats.words,
        activeUsers: fetchedStats.activeUsers,
      })
    }
    fetchStats()
  }, [])

  return (
    <motion.aside
      initial={{ opacity: 0, x: 20 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ duration: 0.5 }}
      className="fixed top-16 right-0 h-[calc(100vh-4rem)] w-80 flex flex-col justify-between p-6 overflow-hidden bg-gray-900"
    >
      <div className="space-y-8">
       

        {/* Stats Grid */}
        <motion.div 
          whileHover={{ y: -4 }}
          className="rounded-lg bg-gray-800/50 border border-neon-green-500/30 p-5 shadow-lg"
        >
          <h4 className="flex items-center gap-2 text-neon-green-400 font-bold mb-4 text-sm">
          <span className="animate-pulse">🖋️</span> 
            <span className="bg-gradient-to-r from-neon-green-400 to-cyan-400 bg-clip-text text-transparent">
              Pixie Metrics
            </span>
          </h4>

          <div className="space-y-4">
            <div className="flex justify-between items-center">
              <div className="flex items-center gap-2">
                <FaFeatherAlt className="w-3.5 h-3.5 text-neon-green-400" />
                <span className="text-xs text-neon-green-300/90">Words Written</span>
              </div>
              {stats ? (
                <p className="text-sm font-bold text-neon-green-400">
                  {formatCount(stats.words)}
                </p>
              ) : (
                <Skeleton className="h-4 w-16 bg-neon-green-900/30" />
              )}
            </div>

            <div className="flex justify-between items-center">
              <div className="flex items-center gap-2">
                <FaUsers className="w-3.5 h-3.5 text-cyan-400" />
                <span className="text-xs text-neon-green-300/90">Active Writers</span>
              </div>
              {stats ? (
                <p className="text-sm font-bold text-cyan-400">
                  {formatCount(stats.activeUsers)}
                </p>
              ) : (
                <Skeleton className="h-4 w-16 bg-cyan-900/30" />
              )}
            </div>
          </div>
        </motion.div>

        {/* Pixie Features */}
        <div className="space-y-4">
          <h3 className="text-lg font-semibold text-neon-green-400">Pixie Features</h3>
            {[
            { icon: FaMagic, text: "AI-powered tweet generation from blogs" },
            { icon: FaFeatherAlt, text: "Strong Markdown Support" },
            { icon: FaBolt, text: "Instant Publishing" },
            ].map((feature, index) => (
            <motion.div
              key={index}
              whileHover={{ scale: 1.02, backgroundColor: "rgba(6, 182, 212, 0.1)" }}
              className="p-3 rounded-md bg-gray-800/50 border border-neon-green-500/30 transition-all"
            >
              <div className="flex items-center gap-3">
              <feature.icon className="w-5 h-5 text-neon-green-400" />
              <p className="text-sm text-neon-green-300">{feature.text}</p>
              </div>
            </motion.div>
            ))}
        </div>
      </div>

      {/* Creator Section */}
      <motion.div 
        className="mt-auto pt-6"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
      >
        <div className="rounded-lg border border-neon-green-500/30 bg-gray-800/50 p-5 shadow-xl">
          <div className="text-center space-y-3">
            <p className="text-sm text-neon-green-300/90">
              Crafted with 
              <span className="mx-1.5 animate-pulse">❤️</span> 
              by
            </p>
            <h4 className="text-lg font-bold bg-gradient-to-r from-neon-green-400 to-cyan-400 bg-clip-text text-transparent">
              PixPerk
            </h4>
            <p className="text-xs text-neon-green-400/70 mb-4">Yashaswi Mishra</p>
            
            <div className="flex justify-center gap-3">
              {[
                { icon: FaGithub, href: "https://github.com/pixperk", label: "GitHub" },
                { icon: FaTwitter, href: "https://twitter.com/pixperk_", label: "Twitter" },
                { icon: FaGlobe, href: "https://yashaswi-portfolio.vercel.app/", label: "Website" }
              ].map((item, idx) => (
                <motion.div
                  key={idx}
                  whileHover={{ scale: 1.1 }}
                  whileTap={{ scale: 0.9 }}
                >
                  <Link
                    href={item.href}
                    target="_blank"
                    rel="noopener noreferrer"
                    aria-label={item.label}
                    className="p-2.5 rounded-xl bg-gray-900/50 border border-neon-green-500/20 hover:border-neon-green-500/40 transition-all text-neon-green-400 hover:text-cyan-400 hover:bg-neon-green-500/10 shadow-md"
                  >
                    <item.icon className="w-5 h-5" />
                  </Link>
                </motion.div>
              ))}
            </div>
          </div>
        </div>
      </motion.div>
    </motion.aside>
  )
}
