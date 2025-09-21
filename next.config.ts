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
  // Ensure proper build output for Amplify
  trailingSlash: false,
  // Server external packages for AWS SDK
  serverExternalPackages: ['@aws-sdk/client-bedrock-runtime', '@aws-sdk/client-transcribe', '@aws-sdk/client-s3', '@aws-sdk/client-secrets-manager'],
};

export default nextConfig;
