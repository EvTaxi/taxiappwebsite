// src/app/(dashboard)/page.tsx
'use client';

import { useAuth } from '@/contexts/AuthContext';
import { Card } from '@/components/ui/card';

export default function DashboardPage() {
  const { profile } = useAuth();

  return (
    <div className="py-6">
      <h1 className="text-2xl font-semibold text-gray-900">
        Welcome back{profile?.first_name ? `, ${profile.first_name}` : ''}!
      </h1>
      
      <div className="mt-6 grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3">
        <Card>
          <div className="p-5">
            <h3 className="text-lg font-medium text-gray-900">Orders</h3>
            <p className="mt-1 text-3xl font-semibold text-blue-600">0</p>
            <p className="mt-1 text-sm text-gray-500">Total orders</p>
          </div>
        </Card>

        <Card>
          <div className="p-5">
            <h3 className="text-lg font-medium text-gray-900">Shipping</h3>
            <p className="mt-1 text-3xl font-semibold text-blue-600">-</p>
            <p className="mt-1 text-sm text-gray-500">Latest tracking status</p>
          </div>
        </Card>

        <Card>
          <div className="p-5">
            <h3 className="text-lg font-medium text-gray-900">App Status</h3>
            <p className="mt-1 text-3xl font-semibold text-blue-600">-</p>
            <p className="mt-1 text-sm text-gray-500">Development status</p>
          </div>
        </Card>
      </div>

      <div className="mt-8">
        <h2 className="text-lg font-medium text-gray-900">Quick Actions</h2>
        <div className="mt-4 grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {/* Add quick action buttons here */}
        </div>
      </div>
    </div>
  );
}