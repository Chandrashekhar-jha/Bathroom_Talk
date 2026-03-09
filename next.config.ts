import type { NextConfig } from 'next';

const nextConfig: NextConfig = {
  turbopack: {},
  // Allow Socket.io to work alongside Next.js (non-turbopack builds)
  webpack: (config) => {
    config.externals.push({
      'utf-8-validate': 'commonjs utf-8-validate',
      bufferutil: 'commonjs bufferutil',
    });
    return config;
  },
  serverExternalPackages: ['mongoose'],
};

export default nextConfig;
