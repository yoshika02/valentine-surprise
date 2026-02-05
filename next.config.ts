/** @type {import('next').NextConfig} */
const nextConfig = {
  output: 'export',
  eslint: {
    // This allows the build to finish even if you have small code warnings
    ignoreDuringBuilds: true,
  },
  images: {
    unoptimized: true,
  },
};

export default nextConfig;