// src/app/(admin)/layout.tsx
'use client';

import { useEffect, useState } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import { useAuth } from '@/contexts/AuthContext';
import Link from 'next/link';
import { 
  LayoutDashboard,
  Package, 
  Users,
  Settings, 
  LogOut,
  Menu,
  X,
  ShoppingCart,
  Bell,
  Box
} from 'lucide-react';

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const { user, signOut } = useAuth();
  const router = useRouter();
  const pathname = usePathname();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  // Protect admin routes
  useEffect(() => {
    if (!user) {
      router.push('/sign-in');
    }
    // Here you would typically check if the user has admin privileges
  }, [user, router]);

  const navigation = [
  { name: 'Dashboard', href: '/admin', icon: LayoutDashboard },
  { name: 'Orders', href: '/admin/orders', icon: ShoppingCart },
  { name: 'Shipments', href: '/admin/shipments', icon: Package },
  { name: 'Inventory', href: '/admin/inventory', icon: Box },
  { name: 'Customers', href: '/admin/customers', icon: Users },
  { name: 'Settings', href: '/admin/settings', icon: Settings },
];

  return (
    <div className="min-h-screen bg-gray-100">
      {/* Desktop Sidebar */}
      <div className="hidden lg:fixed lg:inset-y-0 lg:flex lg:w-64 lg:flex-col">
        <div className="flex flex-col flex-1 min-h-0 bg-gray-900">
          <div className="flex items-center h-16 flex-shrink-0 px-4 bg-gray-900">
            <h1 className="text-xl font-bold text-white">EV_Taxi Admin</h1>
          </div>
          <nav className="flex-1 px-2 py-4 space-y-1">
            {navigation.map((item) => {
              const isActive = pathname === item.href;
              return (
                <Link
                  key={item.name}
                  href={item.href}
                  className={`${
                    isActive
                      ? 'bg-gray-800 text-white'
                      : 'text-gray-300 hover:bg-gray-700 hover:text-white'
                  } group flex items-center px-2 py-2 text-sm font-medium rounded-md`}
                >
                  <item.icon
                    className="mr-3 flex-shrink-0 h-6 w-6"
                    aria-hidden="true"
                  />
                  {item.name}
                </Link>
              );
            })}
          </nav>
        </div>
      </div>

      {/* Mobile menu */}
      <div className="lg:hidden">
        <div className="fixed top-0 left-0 right-0 flex items-center justify-between px-4 h-16 bg-gray-900 text-white">
          <h1 className="text-xl font-bold">EV_Taxi Admin</h1>
          <button
            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
            className="p-2 rounded-md text-gray-400 hover:text-white"
          >
            {isMobileMenuOpen ? (
              <X className="h-6 w-6" />
            ) : (
              <Menu className="h-6 w-6" />
            )}
          </button>
        </div>

        {isMobileMenuOpen && (
          <div className="fixed inset-0 z-40 lg:hidden">
            <div className="fixed inset-0 bg-gray-600 bg-opacity-75" onClick={() => setIsMobileMenuOpen(false)} />
            <div className="relative flex-1 flex flex-col max-w-xs w-full pt-5 pb-4 bg-gray-900">
              <div className="absolute top-0 right-0 -mr-12 pt-2">
                <button
                  className="ml-1 flex items-center justify-center h-10 w-10 rounded-full focus:outline-none focus:ring-2 focus:ring-inset focus:ring-white"
                  onClick={() => setIsMobileMenuOpen(false)}
                >
                  <X className="h-6 w-6 text-white" />
                </button>
              </div>
              <nav className="mt-5 flex-1 px-2 bg-gray-900 space-y-1">
                {navigation.map((item) => {
                  const isActive = pathname === item.href;
                  return (
                    <Link
                      key={item.name}
                      href={item.href}
                      className={`${
                        isActive
                          ? 'bg-gray-800 text-white'
                          : 'text-gray-300 hover:bg-gray-700 hover:text-white'
                      } group flex items-center px-2 py-2 text-base font-medium rounded-md`}
                      onClick={() => setIsMobileMenuOpen(false)}
                    >
                      <item.icon
                        className="mr-3 flex-shrink-0 h-6 w-6"
                        aria-hidden="true"
                      />
                      {item.name}
                    </Link>
                  );
                })}
              </nav>
            </div>
          </div>
        )}
      </div>

      {/* Main content */}
      <div className="lg:pl-64">
        <main className="flex-1">
          <div className="py-6">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
              {children}
            </div>
          </div>
        </main>
      </div>
    </div>
  );
}