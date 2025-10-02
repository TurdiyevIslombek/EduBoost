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
      {
        protocol: "https",
        hostname: "img.clerk.com", // <-- Allow Clerk profile images
      },
      {
        protocol: "https",
        hostname: "images.clerk.dev", // <-- Allow Clerk CDN images
      },
      {
        protocol: "https",
        hostname: "**.clerk.com", // <-- Allow all Clerk subdomains
      },
    ],
    // Add error handling for failed images
    dangerouslyAllowSVG: true,
    contentSecurityPolicy: "default-src 'self'; script-src 'none'; sandbox;",
  },

  // Production deployment: standalone output for Node environments
  output: 'standalone',

  // 👇 Add this to silence the multiple lockfile warning
  outputFileTracingRoot: __dirname,
};

export default nextConfig;
