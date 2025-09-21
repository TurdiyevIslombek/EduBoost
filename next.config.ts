import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "image.mux.com",
      },
      {
        protocol: "https",
        hostname: "utfs.io",
      },
      {
        protocol: "https",
        hostname: "**.ufs.sh", // <-- This allows any subdomain of ufs.sh
      },
    ],
  },

  // 👇 Add this to silence the multiple lockfile warning
  outputFileTracingRoot: __dirname,
};

export default nextConfig;
