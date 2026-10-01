import path from "node:path";
import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  poweredByHeader: false,
  // This app lives in a sub-folder of a larger repository; pin the root.
  turbopack: { root: path.join(__dirname), resolveAlias: { framer: "./lib/framer-shim.ts" } },
};

export default nextConfig;
