import type { NextConfig } from 'next'
import path from 'path'

const { withTamagui } = require('@tamagui/next-plugin')

const API_PROXY_TARGET = process.env.NEXT_PUBLIC_API_URL ?? 'http://localhost:4000'

const nextConfig: NextConfig = {
  transpilePackages: ['@lustre/ui', '@lustre/app', '@lustre/api', 'tamagui', '@tamagui/core', '@expo/metro-runtime', 'expo-modules-core', 'expo-router', 'expo-screen-capture', 'expo-location', 'expo'],
  reactStrictMode: true,
  output: 'standalone',
  eslint: {
    ignoreDuringBuilds: true,
  },
  typescript: {
    ignoreBuildErrors: true,
  },
  async rewrites() {
    return [
      {
        source: '/trpc/:path*',
        destination: `${API_PROXY_TARGET}/trpc/:path*`,
      },
    ]
  },
  webpack: (config) => {
    // Stub out mobile-only packages for web
    config.resolve.alias = {
      ...config.resolve.alias,
      'expo-location': path.resolve(__dirname, 'stubs/expo-location.js'),
      'expo-screen-capture': path.resolve(__dirname, 'stubs/expo-screen-capture.js'),
      'expo-av': path.resolve(__dirname, 'stubs/expo-av.js'),
      'expo-image-picker': path.resolve(__dirname, 'stubs/expo-image-picker.js'),
      'expo-haptics': path.resolve(__dirname, 'stubs/expo-haptics.js'),
      'lottie-react-native': path.resolve(__dirname, 'stubs/lottie-react-native.js'),
    }
    return config
  },
}

export default withTamagui({
  config: './tamagui.config.ts',
  components: ['tamagui'],
  appDir: true,
  disableExtraction: true,
})(nextConfig)
