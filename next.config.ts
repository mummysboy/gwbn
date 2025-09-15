import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'images.unsplash.com',
        port: '',
        pathname: '/**',
      },
    ],
    // Allow local images from uploads directory
    domains: ['localhost', '127.0.0.1'],
    unoptimized: true, // Disable optimization for local images to avoid issues
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
  // Add output configuration for better deployment compatibility
  output: 'standalone',
  // Ensure proper handling of environment variables
  env: {
    CUSTOM_KEY: process.env.CUSTOM_KEY,
  },
};

export default nextConfig;
