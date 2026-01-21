import path from "path";
import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  /* config options here */
  reactCompiler: true,
  turbopack: {
    // Explicitly set project root to avoid lockfile confusion
    root: path.join(__dirname),
  },
};

export default nextConfig;
