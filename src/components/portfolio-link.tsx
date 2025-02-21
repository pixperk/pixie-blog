"use client";

import { motion } from "framer-motion";
import Link from "next/link";
import { useEffect, useState, memo } from "react";
import { FaPen, FaUser, FaInfinity, FaMagic, FaGithub, FaTwitter, FaPortrait } from "react-icons/fa";
import { Skeleton } from "@/components/ui/skeleton";
import { formatCount } from "@/lib/utils";
import { blogWordCountAndTotalUsers } from "@/server/blog";

// New reusable StatBox component
const StatBox = memo(({ icon: Icon, label, value }: { icon: React.ElementType; label: string; value: string | number }) => (
  <div className="p-3 rounded-lg bg-neon-green-900/10 border border-neon-green-500/20 shadow-inner flex flex-col items-center">
    <div className="flex items-center gap-1 mb-1">
      <Icon className="w-4 h-4 text-neon-green-400" />
      <span className="text-xs text-neon-green-300/90">{label}</span>
    </div>
    <p className="text-sm font-bold text-neon-green-400">{value}</p>
  </div>
));

export const BlogAside = () => {
  const [stats, setStats] = useState<{ words: number; activeUsers: number } | null>(null);

  useEffect(() => {
    async function fetchStats() {
      const fetchedStats = await blogWordCountAndTotalUsers();
      setStats({
        words: fetchedStats.words,
        activeUsers: fetchedStats.activeUsers,
      });
    }
    fetchStats();
  }, []);

  return (
    <motion.aside
      initial={{ opacity: 0, x: 20 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ duration: 0.5 }}
      className="fixed top-16 right-0 h-[calc(100vh-4rem)] w-80 flex flex-col justify-between p-6 overflow-y-auto scrollbar-thin scrollbar-track-neon-green-900/10 scrollbar-thumb-neon-green-500/30"
    >
      <div className="space-y-6">
        {/* Pixie Introduction */}
        <motion.div
          whileHover={{ scale: 1.02 }}
          className="relative rounded-xl border border-neon-green-500/30 bg-neon-green-900/20 p-4 backdrop-blur-lg overflow-hidden shadow-lg"
        >
          <div className="absolute inset-0 pattern-dots pattern-neon-green-500/10 pattern-bg-transparent pattern-size-2 pattern-opacity-50" />
          <div className="relative space-y-3">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-full bg-neon-green-500/20 border border-neon-green-500/30 shadow-inner">
                <FaMagic className="w-6 h-6 text-neon-green-400" />
              </div>
              <div>
                <h3 className="text-xl font-bold text-neon-green-400">Pixie</h3>
                <p className="text-xs text-neon-green-300/90">Crafting Extraordinary Digital Experiences</p>
              </div>
            </div>
            <p className="text-neon-green-200/90 text-sm leading-relaxed">
              Transforming innovative ideas into immersive digital realities where creativity meets cutting-edge technology.
            </p>
          </div>
        </motion.div>

        {/* Pixie Stats */}
        <div className="rounded-xl border border-neon-green-500/30 bg-neon-green-900/20 p-4 backdrop-blur-lg shadow-lg">
          <h4 className="flex items-center gap-2 text-neon-green-400 font-medium mb-4 text-sm">
            <FaMagic className="w-4 h-4" />
            By the Numbers
          </h4>
          <div className="grid grid-cols-2 gap-3">
            {stats ? (
              <>
                <StatBox icon={FaPen} label="Words Crafted" value={formatCount(stats.words)} />
                <StatBox icon={FaUser} label="Active Readers" value={formatCount(stats.activeUsers)} />
              </>
            ) : (
              <>
                <Skeleton className="h-4 bg-neon-green-900/30 w-3/4" />
                <Skeleton className="h-4 bg-neon-green-900/30 w-3/4" />
              </>
            )}
            <div className="col-span-2">
              <StatBox icon={FaInfinity} label="Infinite Possibilities" value="Endless" />
            </div>
          </div>
        </div>
      </div>

      {/* Footer */}
      <div className="mt-auto pt-6">
        <div className="rounded-xl border border-neon-green-500/30 bg-neon-green-900/20 p-4 backdrop-blur-lg space-y-4 shadow-lg">
          <p className="text-center text-sm text-neon-green-400">
            Crafted with <span className="text-red-500">❤️</span> by
          </p>
          <div className="text-center">
            <span className="font-semibold text-neon-green-300">pixperk</span>
            <span className="text-neon-green-400/70 text-xs"> (Yashaswi Mishra)</span>
          </div>
          <div className="flex justify-center gap-3">
            <Link
              href="https://github.com/pixperk"
              target="_blank"
              rel="noopener noreferrer"
              className="p-2 rounded-full bg-neon-green-500/10 hover:bg-neon-green-500/20 border border-neon-green-500/20 transition-colors shadow-md"
            >
              <FaGithub className="w-4 h-4 text-neon-green-400" />
            </Link>
            <Link
              href="https://twitter.com/pixperk"
              target="_blank"
              rel="noopener noreferrer"
              className="p-2 rounded-full bg-neon-green-500/10 hover:bg-neon-green-500/20 border border-neon-green-500/20 transition-colors shadow-md"
            >
              <FaTwitter className="w-4 h-4 text-neon-green-400" />
            </Link>
            <Link
              href="https://pixperk.com"
              target="_blank"
              rel="noopener noreferrer"
              className="p-2 rounded-full bg-neon-green-500/10 hover:bg-neon-green-500/20 border border-neon-green-500/20 transition-colors shadow-md"
            >
              <FaPortrait className="w-4 h-4 text-neon-green-400" />
            </Link>
          </div>
        </div>
      </div>
    </motion.aside>
  );
};

export default BlogAside;
