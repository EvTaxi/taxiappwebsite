// src/app/(dashboard)/orders/page.tsx
'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/contexts/AuthContext';
import { Card } from '@/components/ui/card';
import { supabase } from '@/lib/supabase';
import { Loader2, Package, Truck, Calendar } from 'lucide-react';
import { toast } from 'sonner';

interface Order {
  id: string;
  plan_name: string;
  status: string;
  total_amount: number;
  shipping_status: string;
  tracking_number: string | null;
  created_at: string;
}

export default function OrdersPage() {
  const { user } = useAuth();
  const router = useRouter();
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (user) {
      fetchOrders();
    }
  }, [user]);

  const fetchOrders = async () => {
    try {
      const { data, error } = await supabase
        .from('orders')
        .select('*')
        .eq('user_id', user?.id)
        .order('created_at', { ascending: false });

      if (error) throw error;
      setOrders(data || []);
    } catch (error) {
      console.error('Error fetching orders:', error);
      toast.error('Failed to load orders');
    } finally {
      setLoading(false);
    }
  };

  const getStatusColor = (status: string) => {
    switch (status.toLowerCase()) {
      case 'completed':
        return 'text-green-600 bg-green-100';
      case 'pending':
        return 'text-yellow-600 bg-yellow-100';
      case 'processing':
        return 'text-blue-600 bg-blue-100';
      default:
        return 'text-gray-600 bg-gray-100';
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <Loader2 className="w-8 h-8 animate-spin text-blue-600" />
      </div>
    );
  }

  return (
    <div className="py-6">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-semibold text-gray-900">My Orders</h1>
      </div>

      {orders.length === 0 ? (
        <Card>
          <div className="p-6 text-center">
            <Package className="w-12 h-12 mx-auto text-gray-400 mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-1">
              No orders yet
            </h3>
            <p className="text-gray-500">
              When you place an order, it will appear here.
            </p>
          </div>
        </Card>
      ) : (
        <div className="space-y-4">
          {orders.map((order) => (
            <Card 
              key={order.id}
              className="hover:shadow-md transition-shadow cursor-pointer"
              onClick={() => router.push(`/dashboard/orders/${order.id}`)}
            >
              <div className="p-6">
                <div className="flex flex-col md:flex-row md:items-center md:justify-between">
                  <div className="flex-1">
                    <div className="flex items-center">
                      <h3 className="text-lg font-medium text-gray-900">
                        {order.plan_name}
                      </h3>
                      <span className={`ml-3 inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                        getStatusColor(order.status)
                      }`}>
                        {order.status.charAt(0).toUpperCase() + order.status.slice(1)}
                      </span>
                    </div>
                    <div className="mt-1 text-sm text-gray-500">
                      Order #{order.id}
                    </div>
                    <div className="mt-2 text-sm text-gray-500">
                      Placed on {new Date(order.created_at).toLocaleDateString()}
                    </div>
                  </div>
                  
                  <div className="mt-4 md:mt-0 md:ml-6">
                    <div className="text-right">
                      <div className="text-sm font-medium text-gray-900">
                        ${order.total_amount.toFixed(2)}
                      </div>
                      {order.tracking_number && (
                        <div className="mt-1 flex items-center justify-end text-sm text-gray-500">
                          <Truck className="w-4 h-4 mr-1" />
                          Tracking available
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}