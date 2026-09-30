import type { NextConfig } from "next";

const securityHeaders = [
  { key: "X-Content-Type-Options", value: "nosniff" },
  { key: "Referrer-Policy", value: "strict-origin-when-cross-origin" },
  { key: "X-Frame-Options", value: "SAMEORIGIN" },
  { key: "Permissions-Policy", value: "camera=(), microphone=(), geolocation=()" },
];

const nextConfig: NextConfig = {
  reactStrictMode: true,
  poweredByHeader: false,
  // Photography is served from Wikimedia Commons' own thumbnail CDN (responsive srcset),
  // see lib/media.ts. next/image is used for local assets only.
  images: { formats: ["image/avif", "image/webp"] },
  experimental: { optimizePackageImports: ["three", "@react-three/drei", "framer-motion"] },
  async headers() {
    return [
      { source: "/:path*", headers: securityHeaders },
      { source: "/geo/:path*", headers: [{ key: "Cache-Control", value: "public, max-age=31536000, immutable" }] },
    ];
  },
};

export default nextConfig;
