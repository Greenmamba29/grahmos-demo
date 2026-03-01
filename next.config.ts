import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  images: {
    unoptimized: true
  },
  experimental: {
    turbo: undefined
  }
};

export default nextConfig;
