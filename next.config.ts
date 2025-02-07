import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  images : {
    remotePatterns : [
      {
        protocol : "https",
        hostname : '**'
      }
    ]
  },
  compiler: {
    styledComponents: {
      // Enabled by default.
      cssProp: true,
    },
  },
  reactStrictMode: false
};

export default nextConfig;
