"use client";

import Link from "next/link";
import { Suspense } from "react";

function NotFoundContent() {
  return (
    <div className="min-h-screen bg-black flex flex-col items-center justify-center p-4">
      {/* Glowing 404 number */}
      <div className="relative">
        <h1 className="text-neon-green text-9xl font-bold drop-shadow-glowneon animate-pulse">
          404
        </h1>
        {/* Glow effect */}
        <div className="absolute inset-0 bg-neon-green/20 blur-3xl rounded-full" />
      </div>

      {/* Message container */}
      <div className="mt-8 text-center space-y-6">
        <h2 className="text-neon-green text-3xl font-semibold tracking-wide">
          Page Not Found
        </h2>

        <p className="text-neon-green/80 text-lg max-w-md mx-auto">
          Lost in the neon grid? The page you're looking for has been
          disconnected from the mainframe.
        </p>

        {/* Home button with hover effects */}
        <Link
          href="/"
          className="inline-block px-8 py-3 border-2 border-neon-green text-neon-green 
          rounded-lg hover:bg-neon-green hover:text-black transition-all duration-300
          font-medium tracking-wide hover:scale-105 shadow-lg hover:shadow-neon-green/30"
        >
          Return to Home
        </Link>
      </div>

      {/* Grid pattern overlay */}
      <div className="absolute inset-0 opacity-20 [mask-image:linear-gradient(to_bottom,transparent,black)]">
        <div className="h-full w-full bg-gradient-to-r from-neon-green/5 to-transparent">
          <div className="h-full w-full bg-[linear-gradient(to_right,#b5b5b512_1px,transparent_1px),linear-gradient(to_bottom,#b5b5b512_1px,transparent_1px)] bg-[size:24px_24px]" />
        </div>
      </div>
    </div>
  );
}

export default function NotFound() {
  return (
    <Suspense fallback={<div className="min-h-screen flex items-center justify-center text-neon-green">Loading...</div>}>
      <NotFoundContent />
    </Suspense>
  );
}
