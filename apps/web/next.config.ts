import type { NextConfig } from 'next'

const API_URL = process.env.NEXT_PUBLIC_API_URL ?? 'http://localhost:4000'

const nextConfig: NextConfig = {
  reactStrictMode: true,
  experimental: {
    viewTransition: true,
  },
  images: {
    remotePatterns: [
      { protocol: 'https', hostname: 'upload.wikimedia.org' },
      { protocol: 'https', hostname: '**.r2.cloudflarestorage.com' },
      { protocol: 'https', hostname: '**.cloudflare.com' },
    ],
  },
  async rewrites() {
    return [
      {
        source: '/trpc/:path*',
        destination: `${API_URL}/trpc/:path*`,
      },
    ]
  },
}

export default nextConfig
