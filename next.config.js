/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  swcMinify: true,
  images: {
    unoptimized: true,
    domains: ['evtaxi.app'],
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'evtaxi.app',
        port: '',
        pathname: '/**',
      },
    ],
  },
  output: 'standalone',
}

module.exports = nextConfig