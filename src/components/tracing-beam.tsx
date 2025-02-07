"use client"

import React, { useEffect } from "react"
import { motion, useScroll, useSpring, useMotionValueEvent } from "framer-motion"

export const TracingBeam = () => {
  const { scrollYProgress } = useScroll()

  // Smoothens the scrolling effect
  const scaleY = useSpring(scrollYProgress, {
    stiffness: 100,
    damping: 30,
    restDelta: 0.001,
  })

  // Ensure updates on the first scroll
  useEffect(() => {
    scrollYProgress.set(0.01) // A small initial value to trigger reactivity
  }, [scrollYProgress])

  // Listen for scroll changes to ensure reactivity
  useMotionValueEvent(scrollYProgress, "change", (latest) => {
    if (latest > 0 && scaleY.get() === 0) {
      scaleY.set(latest)
    }
  })

  return (
    <div className="fixed left-4 lg:left-8 top-0 bottom-0 w-1 h-full">
      <motion.div
        className="h-full w-full bg-gradient-to-b from-neon-green-500 to-neon-green-500/0"
        style={{ scaleY, transformOrigin: "top" }}
      />
    </div>
  )
}
