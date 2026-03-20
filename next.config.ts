import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  /* config options here */
  async headers() {
    return [
      {
        source: '/:path*',
        headers: [
          { key: 'Access-Control-Allow-Origin', value: '*' },
          { key: 'Access-Control-Allow-Methods', value: 'GET,POST,PUT,DELETE,OPTIONS' },
          { key: 'Access-Control-Allow-Headers', value: 'X-Requested-With, Content-Type, Authorization' },
        ],
      },
    ];
  },
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: '**.ngrok.io',
      },
      {
        protocol: 'https',
        hostname: '**.ngrok-free.app',
      }
    ],
  },
  // Ensure Server Actions and HMR work via ngrok
  experimental: {
    serverActions: {
      allowedOrigins: ['*.ngrok.io', 'robert-local.ngrok.io', 'localhost:3000'],
    },
  },
  // Add empty turbopack config to silence the warning
  turbopack: {},
};

export default nextConfig;
