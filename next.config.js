/** @type {import('next').NextConfig} */
const nextConfig = {
  output: 'export',
  images: {
    unoptimized: true,
    domains: ['evtaxi.app']
  },
  trailingSlash: true,
  reactStrictMode: true,
  swcMinify: true
}

module.exports = nextConfig