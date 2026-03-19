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
  webpack: (config, { isServer }) => {
    if (!isServer) {
      config.watchOptions = {
        poll: 1000,
        aggregateTimeout: 300,
      };

      // For Hot Module Replacement (HMR) to work via ngrok
      if (config.infrastructureLogging) {
        config.infrastructureLogging.level = 'error';
      }
    }
    // Optimization: disable internal font optimization entirely to avoid proxying
    if (config.optimization) {
        config.optimization.minimize = false;
    }
    return config;
  },
};

export default nextConfig;
