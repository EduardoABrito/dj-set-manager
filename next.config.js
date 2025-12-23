/** @type {import('next').NextConfig} */
const nextConfig = {
  experimental: {
    serverActions: true,
  },
  images: {
    domains: ['img.youtube.com'],
  },
};

module.exports = nextConfig;
