/** @type {import('next').NextConfig} */
const nextConfig = {
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'hebbkx1anhila5yf.public.blob.vercel-storage.com',
        port: '',
        pathname: '/**',
      },
    ],
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