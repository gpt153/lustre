import type { NextConfig } from 'next'

const { withTamagui } = require('@tamagui/next-plugin')

const nextConfig: NextConfig = {
  transpilePackages: ['@lustre/ui', '@lustre/app', '@lustre/api', 'tamagui', '@tamagui/core'],
  reactStrictMode: true,
  output: 'standalone',
}

export default withTamagui({
  config: './tamagui.config.ts',
  components: ['tamagui'],
  appDir: true,
})(nextConfig)
