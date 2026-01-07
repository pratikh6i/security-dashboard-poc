import type { NextConfig } from "next";

const isProd = process.env.NODE_ENV === 'production';
const isGitHubPages = process.env.DEPLOY_TARGET === 'github';

const nextConfig: NextConfig = {
  // Only use static export for GitHub Pages
  ...(isGitHubPages && {
    output: 'export',
    basePath: '/security-dashboard-poc',
    assetPrefix: '/security-dashboard-poc/',
  }),
  images: {
    unoptimized: true,
  },
  trailingSlash: true,
};

export default nextConfig;
