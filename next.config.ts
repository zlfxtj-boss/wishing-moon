import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Suppress hydration warnings for theme attributes
  reactStrictMode: true,
};

export default nextConfig;
