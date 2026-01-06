import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  output: 'export',
  basePath: '/security-dashboard-poc',
  assetPrefix: '/security-dashboard-poc/',
  images: {
    unoptimized: true,
  },
  trailingSlash: true,
};

export default nextConfig;
