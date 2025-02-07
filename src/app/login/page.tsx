"use client"

import { useState } from "react"
import { FaGithub, FaGoogle } from "react-icons/fa"
import { Button } from "@/components/ui/button"
import { loginWithGithub, loginWithGoogle } from "@/lib/firebase"
import { motion } from "framer-motion"
import { useRouter } from "next/navigation"

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
      router.push("/")
    } catch (error) {
      console.error("Login failed:", error)
      // You might want to show an error message to the user here
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-gradient-to-br from-gray-900 via-gray-800 to-black px-6">
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="w-full max-w-md space-y-8 text-center"
      >
        {/* Logo */}
        <motion.div className="flex justify-center" whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
          <div className="h-20 w-20 rounded-full bg-neon-green-400/20 flex items-center justify-center border-2 border-neon-green-400 shadow-lg shadow-neon-green-400/50">
            <span className="text-neon-green-400 text-3xl font-bold">Pixie</span>
          </div>
        </motion.div>

        {/* Title & Description */}
        <div className="space-y-2">
          <motion.h1
            className="text-5xl font-bold text-neon-green-500 drop-shadow-md"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.2, duration: 0.5 }}
          >
            Welcome to Pixie
          </motion.h1>
          <motion.p
            className="text-gray-400 text-lg"
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
            className="w-full bg-gray-900 text-white border-gray-700 hover:bg-gray-800 hover:border-neon-green-400 transition-all duration-300 flex items-center justify-center gap-2 h-12 text-lg"
            onClick={() => handleLogin("github")}
            disabled={isLoading}
          >
            <FaGithub className="h-6 w-6" />
            Sign in with GitHub
          </Button>
          <Button
            variant="outline"
            className="w-full bg-gray-800 text-white border-gray-600 hover:bg-gray-700 hover:border-neon-green-400 transition-all duration-300 flex items-center justify-center gap-2 h-12 text-lg"
            onClick={() => handleLogin("google")}
            disabled={isLoading}
          >
            <FaGoogle className="h-6 w-6 text-blue-400" />
            Sign in with Google
          </Button>
        </motion.div>

        {/* Footer */}
        <motion.p
          className="text-sm text-gray-500"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.8, duration: 0.5 }}
        >
          By signing in, you agree to our{" "}
          <span className="text-neon-green-400 hover:underline cursor-pointer transition-colors duration-300">
            Terms & Privacy Policy
          </span>
          .
        </motion.p>
      </motion.div>
    </div>
  )
}

