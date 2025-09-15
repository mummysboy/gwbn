import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Disable image optimization for Amplify compatibility
  images: {
    unoptimized: true,
  },
  // Ensure static files are served correctly
  async rewrites() {
    return [
      {
        source: '/uploads/:path*',
        destination: '/uploads/:path*',
      },
    ];
  },
  // Add experimental features for better Amplify compatibility
  experimental: {
    // Disable server components caching for Amplify
    serverComponentsExternalPackages: [],
  },
  // Ensure proper build output for Amplify
  trailingSlash: false,
  // Disable static optimization for dynamic routes
  generateStaticParams: false,
};

export default nextConfig;
