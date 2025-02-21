"use client"

import { Button } from "@/components/ui/button"
import { loginWithGithub, loginWithGoogle } from "@/lib/firebase"
import { motion } from "framer-motion"
import Image from "next/image"
import { useRouter } from "next/navigation"
import { Suspense, useState } from "react"
import toast from "react-hot-toast"
import { FaGithub, FaGoogle } from "react-icons/fa"

export default function AuthForm() {
  const [isLoading, setIsLoading] = useState(false)
  const router = useRouter()

  const handleLogin = async (provider: "github" | "google") => {
    setIsLoading(true)
    try {
      if (provider === "github") {
        await loginWithGithub()
      } else {
        await loginWithGoogle()
      }
      toast.success("Successfully logged in! Redirecting...")
      router.push("/")
    } catch (error) {
      console.error("Login failed:", error)
      toast.error(
        error instanceof Error ? error.message : "Failed to sign in. Please try again."
      )
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <Suspense fallback={<>Loading...</>}>
    <div className="fixed inset-0 overflow-hidden flex items-center justify-center">
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="w-full max-w-md px-6 space-y-6 text-center"
      >
        {/* Logo */}
        <motion.div 
          className="flex justify-center"
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
        >
          <div className="relative h-28 w-28 rounded-full p-[3px] bg-gradient-to-r from-neon-green-400 to-neon-green-500 shadow-[0_0_20px_rgba(67,255,62,0.5)] group transition-all duration-300 hover:shadow-[0_0_30px_rgba(67,255,62,0.8)]">
            <div className="absolute inset-0 rounded-full animate-[spin_10s_linear_infinite] bg-gradient-to-r from-neon-green-400/0 via-neon-green-400/70 to-neon-green-400/0" />
            <div className="relative h-full w-full rounded-full bg-black p-2">
              <div className="relative h-full w-full rounded-full overflow-hidden">
                <Image
                  src="https://a3dg9kymej.ufs.sh/f/8azif4ZMinvpDo6CDJEC3hHaxtjqY9QwZBIp6F5kelWS2sci"
                  alt="Pixie Logo"
                  fill
                  className="object-cover"
                  priority
                />
              </div>
            </div>
          </div>
        </motion.div>

        {/* Title & Description */}
        <div className="space-y-2">
          <motion.h1
            className="text-4xl font-bold text-neon-green-400 animate-glow"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.2, duration: 0.5 }}
          >
            Welcome to Pixie
          </motion.h1>
          <motion.p
            className="text-neon-green-200/80 text-lg"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.4, duration: 0.5 }}
          >
            Sign in to continue exploring the magic of tech blogging.
          </motion.p>
        </div>

        {/* Auth Buttons */}
        <motion.div
          className="space-y-4"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.6, duration: 0.5 }}
        >
          <Button
            variant="outline"
            className="w-full h-12 text-lg relative overflow-hidden group border-neon-green-400/50 text-neon-green-400 hover:text-neon-green-300 hover:border-neon-green-400 transition-colors duration-300"
            onClick={() => handleLogin("github")}
            disabled={isLoading}
          >
            <span className="absolute inset-0 bg-neon-green-400/10 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
            <span className="relative flex items-center justify-center gap-2">
              <FaGithub className="h-5 w-5" />
              Sign in with GitHub
            </span>
          </Button>
          <Button
            variant="outline"
            className="w-full h-12 text-lg relative overflow-hidden group border-neon-green-400/50 text-neon-green-400 hover:text-neon-green-300 hover:border-neon-green-400 transition-colors duration-300"
            onClick={() => handleLogin("google")}
            disabled={isLoading}
          >
            <span className="absolute inset-0 bg-neon-green-400/10 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
            <span className="relative flex items-center justify-center gap-2">
              <FaGoogle className="h-5 w-5" />
              Sign in with Google
            </span>
          </Button>
        </motion.div>

        {/* Footer */}
        <motion.div
          className="text-sm text-neon-green-200/60 space-y-2"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.8, duration: 0.5 }}
        >
          <p>
            By signing in, you agree to our{" "}
            <button 
              onClick={() => {
                toast("Our terms and privacy policy are being updated.")
              }}
              className="text-neon-green-400 hover:text-neon-green-300 hover:underline focus:outline-none focus:ring-2 focus:ring-neon-green-400/50 focus:ring-offset-2 rounded transition-colors duration-300"
            >
              Terms & Privacy Policy
            </button>
          </p>
          {isLoading && (
            <p className="text-neon-green-400 animate-pulse">
              Authenticating...
            </p>
          )}
        </motion.div>
      </motion.div>
    </div>
    </Suspense>
  )
}
