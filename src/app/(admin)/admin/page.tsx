// src/app/(admin)/page.tsx
'use client';

import { useEffect, useState } from 'react';
import { Card } from '@/components/ui/card';
import { supabase } from '@/lib/supabase';
import { 
  Users,
  Package,
  DollarSign,
  ShoppingCart,
  TrendingUp,
  AlertCircle
} from 'lucide-react';

interface DashboardStats {
  totalOrders: number;
  totalCustomers: number;
  totalRevenue: number;
  pendingShipments: number;
  activeUsers: number;
  pendingApps: number;
}

export default function AdminDashboard() {
  const [stats, setStats] = useState<DashboardStats>({
    totalOrders: 0,
    totalCustomers: 0,
    totalRevenue: 0,
    pendingShipments: 0,
    activeUsers: 0,
    pendingApps: 0
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchDashboardStats();
  }, []);

  const fetchDashboardStats = async () => {
    try {
      // Fetch orders count
      const { count: ordersCount } = await supabase
        .from('orders')
        .select('*', { count: 'exact' });

      // Fetch customers count
      const { count: customersCount } = await supabase
        .from('profiles')
        .select('*', { count: 'exact' });

      // Fetch total revenue
      const { data: orders } = await supabase
        .from('orders')
        .select('total_amount');
      
      const totalRevenue = orders?.reduce((sum, order) => sum + order.total_amount, 0) || 0;

      // Fetch pending shipments
      const { count: pendingShipmentsCount } = await supabase
        .from('orders')
        .select('*', { count: 'exact' })
        .eq('shipping_status', 'pending');

      setStats({
        totalOrders: ordersCount || 0,
        totalCustomers: customersCount || 0,
        totalRevenue,
        pendingShipments: pendingShipmentsCount || 0,
        activeUsers: customersCount || 0, // This would typically come from active sessions
        pendingApps: 0 // This would come from your app development tracking system
      });
    } catch (error) {
      console.error('Error fetching dashboard stats:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div>
      <h1 className="text-2xl font-semibold text-gray-900">Dashboard</h1>

      {/* Stats Grid */}
      <div className="mt-8 grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3">
        <Card>
          <div className="p-5">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <ShoppingCart className="h-6 w-6 text-gray-400" />
              </div>
              <div className="ml-5 w-0 flex-1">
                <dl>
                  <dt className="text-sm font-medium text-gray-500 truncate">
                    Total Orders
                  </dt>
                  <dd className="text-lg font-semibold text-gray-900">
                    {stats.totalOrders}
                  </dd>
                </dl>
              </div>
            </div>
          </div>
        </Card>

        <Card>
          <div className="p-5">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <Users className="h-6 w-6 text-gray-400" />
              </div>
              <div className="ml-5 w-0 flex-1">
                <dl>
                  <dt className="text-sm font-medium text-gray-500 truncate">
                    Total Customers
                  </dt>
                  <dd className="text-lg font-semibold text-gray-900">
                    {stats.totalCustomers}
                  </dd>
                </dl>
              </div>
            </div>
          </div>
        </Card>

        <Card>
          <div className="p-5">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <DollarSign className="h-6 w-6 text-gray-400" />
              </div>
              <div className="ml-5 w-0 flex-1">
                <dl>
                  <dt className="text-sm font-medium text-gray-500 truncate">
                    Total Revenue
                  </dt>
                  <dd className="text-lg font-semibold text-gray-900">
                    ${stats.totalRevenue.toFixed(2)}
                  </dd>
                </dl>
              </div>
            </div>
          </div>
        </Card>

        <Card>
          <div className="p-5">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <Package className="h-6 w-6 text-gray-400" />
              </div>
              <div className="ml-5 w-0 flex-1">
                <dl>
                  <dt className="text-sm font-medium text-gray-500 truncate">
                    Pending Shipments
                  </dt>
                  <dd className="text-lg font-semibold text-gray-900">
                    {stats.pendingShipments}
                  </dd>
                </dl>
              </div>
            </div>
          </div>
        </Card>
      </div>

      {/* Recent Activity */}
      <div className="mt-8">
        <h2 className="text-lg font-medium text-gray-900">Recent Activity</h2>
        <div className="mt-4">
          <Card>
            <div className="p-6">
              {/* Add recent activity items here */}
              <p className="text-gray-500">No recent activity</p>
            </div>
          </Card>
        </div>
      </div>
    </div>
  );
}