// src/app/(dashboard)/layout.tsx
'use client';

import { useEffect, useState } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import { useAuth } from '@/contexts/AuthContext';
import Link from 'next/link';
import { 
  Layout, 
  Home,
  Package, 
  Truck,
  Settings, 
  LogOut,
  Menu,
  X,
  User,
  CreditCard
} from 'lucide-react';

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const { user, signOut } = useAuth();
  const router = useRouter();
  const pathname = usePathname();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  // Protect all dashboard routes
  useEffect(() => {
    if (!user) {
      router.push('/sign-in');
    }
  }, [user, router]);

  if (!user) return null;

  const navigation = [
    { name: 'Dashboard', href: '/dashboard', icon: Home },
    { name: 'Orders', href: '/dashboard/orders', icon: Package },
    { name: 'Shipping', href: '/dashboard/shipping', icon: Truck },
    { name: 'Billing', href: '/dashboard/billing', icon: CreditCard },
    { name: 'Profile', href: '/dashboard/profile', icon: User },
    { name: 'Settings', href: '/dashboard/settings', icon: Settings },
  ];

  const handleSignOut = async () => {
    await signOut();
    router.push('/');
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Desktop sidebar */}
      <div className="hidden lg:fixed lg:inset-y-0 lg:flex lg:w-64 lg:flex-col">
        <div className="flex flex-col flex-1 min-h-0 bg-white border-r border-gray-200">
          <div className="flex items-center h-16 flex-shrink-0 px-4 bg-white border-b">
            <Link href="/" className="text-2xl font-bold text-blue-600">
              EV_Taxi
            </Link>
          </div>
          <div className="flex-1 flex flex-col overflow-y-auto">
            <nav className="flex-1 px-2 py-4 space-y-1">
              {navigation.map((item) => {
                const isActive = pathname === item.href;
                return (
                  <Link
                    key={item.name}
                    href={item.href}
                    className={`${
                      isActive
                        ? 'bg-blue-50 text-blue-600'
                        : 'text-gray-600 hover:bg-gray-50'
                    } group flex items-center px-2 py-2 text-sm font-medium rounded-md`}
                  >
                    <item.icon
                      className={`${
                        isActive ? 'text-blue-600' : 'text-gray-400'
                      } mr-3 flex-shrink-0 h-5 w-5`}
                    />
                    {item.name}
                  </Link>
                );
              })}
              <button
                onClick={handleSignOut}
                className="w-full text-gray-600 hover:bg-gray-50 group flex items-center px-2 py-2 text-sm font-medium rounded-md"
              >
                <LogOut className="text-gray-400 mr-3 flex-shrink-0 h-5 w-5" />
                Sign Out
              </button>
            </nav>
          </div>
        </div>
      </div>

      {/* Mobile menu */}
      <div className="lg:hidden">
        <div className="fixed top-0 left-0 right-0 flex items-center justify-between px-4 h-16 bg-white border-b">
          <Link href="/" className="text-2xl font-bold text-blue-600">
            EV_Taxi
          </Link>
          <button
            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
            className="p-2 rounded-md text-gray-400 hover:text-gray-500"
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
            <div className="relative flex-1 flex flex-col max-w-xs w-full pt-5 pb-4 bg-white">
              <div className="absolute top-0 right-0 -mr-12 pt-2">
                <button
                  className="ml-1 flex items-center justify-center h-10 w-10 rounded-full focus:outline-none focus:ring-2 focus:ring-inset focus:ring-white"
                  onClick={() => setIsMobileMenuOpen(false)}
                >
                  <X className="h-6 w-6 text-white" />
                </button>
              </div>
              <nav className="mt-5 flex-1 px-2 bg-white space-y-1">
                {navigation.map((item) => {
                  const isActive = pathname === item.href;
                  return (
                    <Link
                      key={item.name}
                      href={item.href}
                      className={`${
                        isActive
                          ? 'bg-blue-50 text-blue-600'
                          : 'text-gray-600 hover:bg-gray-50'
                      } group flex items-center px-2 py-2 text-base font-medium rounded-md`}
                      onClick={() => setIsMobileMenuOpen(false)}
                    >
                      <item.icon
                        className={`${
                          isActive ? 'text-blue-600' : 'text-gray-400'
                        } mr-3 flex-shrink-0 h-5 w-5`}
                      />
                      {item.name}
                    </Link>
                  );
                })}
                <button
                  onClick={handleSignOut}
                  className="w-full text-gray-600 hover:bg-gray-50 group flex items-center px-2 py-2 text-base font-medium rounded-md"
                >
                  <LogOut className="text-gray-400 mr-3 flex-shrink-0 h-5 w-5" />
                  Sign Out
                </button>
              </nav>
            </div>
          </div>
        )}
      </div>

      {/* Main content */}
      <div className="lg:pl-64 flex flex-col flex-1">
        <main className="flex-1 pb-8">
          <div className="mt-16 lg:mt-0">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
              {children}
            </div>
          </div>
        </main>
      </div>
    </div>
  );
}