/** @type {import('next').NextConfig} */
const nextConfig = {
  images: {
    domains: ['hebbkx1anhila5yf.public.blob.vercel-storage.com'],
  },
}

module.exports = {
  async rewrites() {
    return [
      {
        source: '/score/:id',
        destination: '/score/[id]',
      },
    ]
  },
}
module.exports = nextConfig

const { i18n } = require('./next-i18next.config')

module.exports = {
  i18n,
}