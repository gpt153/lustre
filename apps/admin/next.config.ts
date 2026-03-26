import type { NextConfig } from 'next'

const API_PROXY_TARGET = process.env.NEXT_PUBLIC_API_URL ?? 'http://localhost:4000'

const nextConfig: NextConfig = {
  reactStrictMode: true,
  output: 'standalone',
  async rewrites() {
    return [
      {
        source: '/trpc/:path*',
        destination: `${API_PROXY_TARGET}/trpc/:path*`,
      },
    ]
  },
}

export default nextConfig
