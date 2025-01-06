/** @type {import('next').NextConfig} */
const nextConfig = {
  i18n: {
    defaultLocale: 'en',
    locales: ['en', 'th'],
  },
  compiler: {
    removeConsole: process.env.NODE_ENV === 'production',
  },
  experimental: {
    workerThreads: true,
    cpus: 4
  },
  serverExternalPackages: [
    // Add any packages that need to be externalized
  ],
}

module.exports = nextConfig