import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'ark-content-generation-v2-cn-beijing.tos-cn-beijing.volces.com',
        port: '',
        pathname: '/**',
      },
      {
        protocol: 'https',
        hostname: 'ark-doc.tos-ap-southeast-1.bytepluses.com',
        port: '',
        pathname: '/**',
      },
    ],
  },
};

export default nextConfig;
