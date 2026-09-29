import type { NextConfig } from 'next';

const nextConfig: NextConfig = {
  reactStrictMode: true,
  // The control plane is a separate process; the gateway talks to it server-side only.
  async headers() {
    return [
      {
        source: '/api/gateway/:path*',
        headers: [{ key: 'cache-control', value: 'no-store' }],
      },
    ];
  },
};

export default nextConfig;
