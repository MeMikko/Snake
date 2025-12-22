/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  experimental: {
    optimizePackageImports: ['@base-org/minikit']
  }
};

module.exports = nextConfig;
