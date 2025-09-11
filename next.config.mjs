/** @type {import('next').NextConfig} */

import createMDX from '@next/mdx'

import createNextIntlPlugin from 'next-intl/plugin'

const currentEnv = process.env.NODE_ENV

const loggingConfig =
  currentEnv === 'development'
    ? {
        logging: {
          fetches: {
            fullUrl: true,
            hmrRefreshes: false
          }
        }
      }
    : {}

const nextConfig = {
  // Configure `pageExtensions` to include markdown and MDX files
  pageExtensions: ['tsx', 'ts', 'jsx', 'js', 'mdx', 'md'],
  eslint: {
    // Warning: This allows production builds to successfully complete even if
    // your project has ESLint errors.
    ignoreDuringBuilds: true
  },
  trailingSlash: false,
  reactStrictMode: true,
  typescript: {
    ignoreBuildErrors: true
  },
  images: {
    unoptimized: true,
    minimumCacheTTL: 3600,
    path: '/_next/image',
    contentDispositionType: 'attachment',
    disableStaticImages: false,
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'cdn.repliers.io'
      }
    ]
  },
  ...loggingConfig
}

const withMDX = createMDX({
  /* Add markdown plugins here, as desired */
})

const withNextIntl = createNextIntlPlugin('./src/i18n/request.ts')

export default withNextIntl(withMDX(nextConfig))
