import type { NextConfig } from "next";
import path from "node:path";

const nextConfig: NextConfig = {
  outputFileTracingRoot: path.join(__dirname),
  // Hide the Next.js "N" development badge (bottom-left)
  devIndicators: false,
  images: {
    // WebP encodes far faster than AVIF on the optimizer and is ~as small for photos.
    formats: ["image/webp"],
    deviceSizes: [640, 750, 828, 1080, 1200, 1600, 1920, 2560],
    imageSizes: [16, 32, 48, 64, 96, 128, 256, 384],
    minimumCacheTTL: 60 * 60 * 24 * 365,
    // Every <Image quality> in the app must be listed here or the optimizer 400s.
    qualities: [75, 85, 90],
    remotePatterns: [
      { protocol: "https", hostname: "i.ytimg.com" },
      { protocol: "https", hostname: "img.youtube.com" },
      { protocol: "https", hostname: "*.public.blob.vercel-storage.com" },
    ],
  },
  experimental: {
    optimizePackageImports: ["lucide-react", "framer-motion", "gsap"],
  },
  eslint: {
    ignoreDuringBuilds: true,
  },
};

export default nextConfig;
