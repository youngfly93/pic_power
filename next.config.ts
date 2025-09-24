import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  turbopack: {
    root: '.',
  },
  typescript: {
    // Windows 网络盘/防病毒导致 .next/cache/.tsbuildinfo 写入失败时可暂时开启
    ignoreBuildErrors: true,
  },
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
