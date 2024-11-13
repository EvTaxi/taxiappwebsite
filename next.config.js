/** @type {import('next').NextConfig} */
const nextConfig = {
  output: 'export',
  images: {
    unoptimized: true,
    domains: ['evtaxi.app']
  },
  trailingSlash: true,
  reactStrictMode: true,
  swcMinify: true,
  exportPathMap: async function(defaultPathMap) {
    return {
      '/': { page: '/' },
      '/sign-in': { page: '/sign-in' },
      '/sign-up': { page: '/sign-up' },
      '/dashboard': { page: '/dashboard' },
      '/dashboard/profile': { page: '/dashboard/profile' },
      '/dashboard/orders': { page: '/dashboard/orders' },
      '/dashboard/orders/[id]': { page: '/dashboard/orders/[id]' },
      '/dashboard/shipping': { page: '/dashboard/shipping' },
      '/dashboard/billing': { page: '/dashboard/billing' },
      '/dashboard/settings': { page: '/dashboard/settings' },
      '/success': { page: '/success' },
      '/admin': { page: '/admin' },
      '/admin/orders': { page: '/admin/orders' },
      '/admin/customers': { page: '/admin/customers' },
      '/admin/inventory': { page: '/admin/inventory' },
      '/admin/settings': { page: '/admin/settings' }
    }
  }
}